import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BadgeCheck,
  Bookmark,
  Bot,
  Check,
  ChevronRight,
  ChevronDown,
  Circle,
  Compass,
  Download,
  FileText,
  Gauge,
  Heart,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Subtitles,
} from "lucide-react";
import {
  fmtSeconds,
  getCourse,
  lessonSeconds,
  sampleDiscussion,
  sampleTranscript,
} from "@/data/mockData";
import type { Course, DiscussionComment, Lesson } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { ProgressBar, EmptyState } from "@/components/shared";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const speeds = ["0.75", "1", "1.25", "1.5", "2"];
const resolutions = ["480p", "720p", "1080p"];

function simulatedExplain(lessonTitle: string, courseTitle: string): string {
  return `### "${lessonTitle}" — the 40-second version

Here's how I'd frame this lesson inside **${courseTitle}**:

- **The one idea.** Strip away the notation and this lesson is about one mechanism doing one job — trace it with the smallest possible example before touching the general case.
- **Why it matters.** This is the step that unlocks the next two lessons; if it feels hand-wavy now, everything downstream inherits the fuzz.
- **The classic trap.** Learners memorize the procedure but skip the "why it's legal" step — explain it aloud to an imaginary friend in under a minute.

**Check yourself:** can you state what would break if the key assumption of this lesson were dropped?

Want this deeper? Ask Socrates in the **AI Tutor** with *"Explain ${lessonTitle} with an analogy".*`;
}

function boldify(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function LessonKindIcon({ lesson }: { lesson: Lesson }) {
  if (lesson.kind === "quiz") return <ListChecks className="size-3.5" />;
  if (lesson.kind === "reading") return <FileText className="size-3.5" />;
  return <Play className="size-3.5" />;
}

function CourseWorkspace({ course }: { course: Course }) {
  const {
    completed,
    toggleLesson,
    markLesson,
    courseProgress,
    notes,
    setNote,
    isEnrolled,
    enrollCourse,
  } = useAppState();

  useEffect(() => {
    if (course?.id && !isEnrolled(course.id)) {
      enrollCourse(course.id);
    }
  }, [course?.id, isEnrolled, enrollCourse]);

  const allLessons = useMemo(() => course.modules.flatMap((m) => m.lessons), [course]);
  const done = completed[course.id] ?? [];
  const firstUnfinished = allLessons.find((l) => !done.includes(l.id)) ?? allLessons[0];

  const [currentId, setCurrentId] = useState(firstUnfinished.id);
  const current = allLessons.find((l) => l.id === currentId) ?? allLessons[0];
  const duration = lessonSeconds(current.duration);
  const isDone = done.includes(current.id);

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState("1");
  const [cc, setCc] = useState(true);
  const [resIdx, setResIdx] = useState(1);

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(course.modules.map((m) => m.id)),
  );
  const [tab, setTab] = useState("overview");
  const [explain, setExplain] = useState<{ lessonId: string; text: string } | null>(null);
  const explainTimer = useRef<number | null>(null);

  const [comments, setComments] = useState<DiscussionComment[]>(sampleDiscussion);
  const [commentDraft, setCommentDraft] = useState("");

  const note = notes[current.id] ?? "";

  // playback ticker — a simulated player, no real video in stage 1
  useEffect(() => {
    if (!playing || duration === 0) return;
    const t = window.setInterval(() => {
      setElapsed((e) => Math.min(duration, e + 0.25 * Number(speed)));
    }, 250);
    return () => window.clearInterval(t);
  }, [playing, duration, speed]);

  // auto-complete at the end of the "video"
  useEffect(() => {
    if (duration === 0 || elapsed < duration) return;
    setPlaying(false);
    if (!done.includes(current.id)) {
      markLesson(course.id, current.id, true);
      toast.success("Lesson complete", { description: current.title });
    }
    const idx = allLessons.findIndex((l) => l.id === current.id);
    const next = allLessons[idx + 1];
    if (next) {
      setCurrentId(next.id);
      setElapsed(0);
      toast.info("Up next", { description: next.title });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- advance exactly once per completion
  }, [elapsed, duration]);

  // stop streaming explanation when the lesson changes / unmount
  useEffect(
    () => () => {
      if (explainTimer.current) window.clearInterval(explainTimer.current);
    },
    [current.id],
  );

  const selectLesson = (lesson: Lesson) => {
    if (explainTimer.current) window.clearInterval(explainTimer.current);
    setCurrentId(lesson.id);
    setElapsed(0);
    setPlaying(false);
    setExplain(null);
    setTab("overview");
  };

  const runExplain = () => {
    if (explainTimer.current) window.clearInterval(explainTimer.current);
    const full = simulatedExplain(current.title, course.title);
    const words = full.split(" ");
    let i = 0;
    setExplain({ lessonId: current.id, text: "" });
    explainTimer.current = window.setInterval(() => {
      i += 2;
      setExplain({ lessonId: current.id, text: words.slice(0, i).join(" ") });
      if (i >= words.length && explainTimer.current) {
        window.clearInterval(explainTimer.current);
        explainTimer.current = null;
      }
    }, 22);
  };

  const toggleModule = (moduleId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });

  const progress = courseProgress(course.id);
  const doneCount = done.length;
  const nextLesson = allLessons[allLessons.findIndex((l) => l.id === current.id) + 1];

  const scrubPct = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  const actionRibbon: Array<{ label: string; icon: ReactNode; onClick: () => void; testId: string }> = [
    {
      label: "AI Explain This Lesson",
      icon: <Sparkles className="size-4" />,
      onClick: runExplain,
      testId: "lesson-ai-explain-btn",
    },
    {
      label: "Bookmark frame",
      icon: <Bookmark className="size-4" />,
      onClick: () => toast.success("Frame bookmarked", { description: `Saved at ${fmtSeconds(elapsed)} in “${current.title}”` }),
      testId: "lesson-bookmark-frame-btn",
    },
    {
      label: "Download slides",
      icon: <Download className="size-4" />,
      onClick: () => toast.info("Prototype preview", { description: "Slide exports arrive with the backend stage." }),
      testId: "lesson-slides-btn",
    },
    {
      label: "Take AI note",
      icon: <FileText className="size-4" />,
      onClick: () => {
        setTab("notes");
        setExplain(null);
      },
      testId: "lesson-note-btn",
    },
    {
      label: "Ask Socrates",
      icon: <Bot className="size-4" />,
      onClick: () => toast.info("Opens the AI Tutor", { description: "Use the sidebar → AI Tutor for the full chat." }),
      testId: "lesson-ask-socrates-btn",
    },
  ];

  return (
    <div className="animate-fade-up">
      {/* breadcrumb */}
      <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/explore" className="transition-colors hover:text-violet-300">
          Explore
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-zinc-300">{course.category}</span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* ── left column ── */}
        <div className="min-w-0 space-y-4">
          {/* player */}
          <div
            data-testid="course-video-player"
            className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#08080c]"
          >
            <div className="relative aspect-video">
              {current.youtubeId ? (
                <iframe
                  className="size-full aspect-video border-0 rounded-2xl"
                  src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?modestbranding=1&rel=0`}
                  title={current.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={course.thumbnail}
                    alt=""
                    className={cn(
                      "size-full object-cover transition-all duration-700",
                      playing ? "scale-105 brightness-[0.55] saturate-150" : "brightness-[0.45]",
                    )}
                  />
                  {/* ambient glow while playing */}
                  {playing ? (
                    <div className="animate-aura pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.35),transparent_65%)]" />
                  ) : null}

                  {/* center play/pause */}
                  <button
                    type="button"
                    data-testid="video-play-pause-btn"
                    aria-label={playing ? "Pause" : "Play"}
                    onClick={() => duration > 0 && setPlaying((p) => !p)}
                    className="group absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex size-20 items-center justify-center rounded-full bg-violet-600/90 text-white shadow-[0_0_60px_rgba(124,58,237,0.65)] transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                      {playing ? (
                        <Pause className="size-9 fill-current" />
                      ) : (
                        <Play className="ml-1.5 size-9 fill-current" />
                      )}
                    </span>
                  </button>

                  {/* cc overlay */}
                  {cc && playing && duration > 0 ? (
                    <p className="absolute bottom-20 left-1/2 max-w-[80%] -translate-x-1/2 rounded-lg bg-black/75 px-4 py-1.5 text-center text-sm text-zinc-100 backdrop-blur">
                      {sampleTranscript.find((t) => t.seconds <= elapsed * 1.2)?.text ??
                        sampleTranscript[0].text}
                    </p>
                  ) : null}

                  {/* title chip */}
                  <span className="absolute left-4 top-4 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-zinc-100 backdrop-blur">
                    {current.title}
                    {current.kind === "reading" ? " · reading" : current.kind === "quiz" ? " · checkpoint quiz" : ""}
                  </span>

                  {/* bottom controls */}
                  <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-8">
                    <div className="relative">
                      <input
                        type="range"
                        data-testid="video-scrubber"
                        className="scrubber w-full"
                        min={0}
                        max={Math.max(duration, 1)}
                        step={1}
                        value={Math.floor(elapsed)}
                        onChange={(e) => setElapsed(Number(e.target.value))}
                        disabled={duration === 0}
                        style={{
                          background: `linear-gradient(to right, #7c3aed ${scrubPct}%, #2e2e33 ${scrubPct}%)`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-300">
                      <button
                        type="button"
                        onClick={() => setElapsed((e) => Math.max(0, e - 10))}
                        aria-label="Rewind 10 seconds"
                        className="transition-colors hover:text-white"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                      <span className="font-mono tabular-nums" data-testid="video-time-display">
                        {fmtSeconds(elapsed)} / {duration > 0 ? current.duration : "—"}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <Gauge className="size-3.5 text-zinc-500" />
                        <Select value={speed} onValueChange={(v: string) => setSpeed(v)}>
                          <SelectTrigger data-testid="video-speed-select" size="sm" className="h-7 w-[74px] border-transparent bg-white/10 text-xs text-zinc-100">
                            <SelectValue>{(v: string | null) => `${v ?? "1"}×`}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="border-[#2e2e33] bg-popover">
                            {speeds.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}×
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          type="button"
                          data-testid="video-resolution-btn"
                          onClick={() => setResIdx((i) => (i + 1) % resolutions.length)}
                          className="rounded-md bg-white/10 px-2 py-1 font-medium transition-colors hover:bg-white/20"
                        >
                          {resolutions[resIdx]}
                        </button>
                        <button
                          type="button"
                          data-testid="video-cc-btn"
                          aria-label="Toggle subtitles"
                          onClick={() => setCc((c) => !c)}
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors",
                            cc ? "bg-violet-600 text-white" : "bg-white/10 text-zinc-300 hover:bg-white/20",
                          )}
                        >
                          <Subtitles className="size-4" /> CC
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* action ribbon */}
          <div className="flex flex-wrap gap-2">
            {actionRibbon.map((a) => (
              <button
                key={a.label}
                type="button"
                data-testid={a.testId}
                onClick={a.onClick}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all active:scale-95",
                  a.testId === "lesson-ai-explain-btn"
                    ? "glow-ring border-violet-600/60 bg-[#1f1d2b] text-violet-200 hover:bg-[#262239]"
                    : "border-[#2e2e33] bg-card text-zinc-300 hover:border-[#3f3f46] hover:text-white",
                )}
              >
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>

          {/* AI explanation panel */}
          {explain && explain.lessonId === current.id ? (
            <div
              data-testid="lesson-ai-explain-panel"
              className="rounded-2xl border border-violet-600/40 bg-gradient-to-b from-[#1a1826] to-[#161522] p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-500">
                  <Sparkles className="size-3.5 text-white" />
                </span>
                <p className="font-heading text-sm font-semibold text-violet-200">
                  Socrates explains this lesson
                </p>
                <button
                  type="button"
                  onClick={() => setExplain(null)}
                  className="ml-auto text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  Dismiss
                </button>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-300">
                {explain.text.split("\n").filter(Boolean).map((line, i) => {
                  if (line.startsWith("- "))
                    return (
                      <p key={i} className="flex gap-2.5">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                        <span>
                          <span className="font-semibold text-white">
                            {line.slice(2).split(".")[0]}.
                          </span>
                          {line.slice(2 + line.slice(2).split(".")[0].length + 1)}
                        </span>
                      </p>
                    );
                  if (line.startsWith("### "))
                    return (
                      <p key={i} className="font-heading text-[15px] font-semibold text-white">
                        {line.slice(4)}
                      </p>
                    );
                  if (line.startsWith("**"))
                    return (
                      <p key={i} className="font-medium text-violet-200">
                        {line.replace(/\*\*/g, "")}
                      </p>
                    );
                  return <p key={i}>{line.replace(/\*\*/g, "")}</p>;
                })}
                {explain.text.length < 40 ? (
                  <span className="caret-blink inline-block h-4 w-1.5 rounded-sm bg-violet-400 align-middle" />
                ) : null}
              </div>
            </div>
          ) : null}

          {/* tabs */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-[#1b1b1e]">
              <TabsTrigger value="overview" data-testid="course-tab-trigger-overview">
                Overview
              </TabsTrigger>
              <TabsTrigger value="transcript" data-testid="course-tab-trigger-transcript">
                Transcript
              </TabsTrigger>
              <TabsTrigger value="notes" data-testid="course-tab-trigger-notes">
                Notes
              </TabsTrigger>
              <TabsTrigger value="discussion" data-testid="course-tab-trigger-discussion">
                Q&A
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="rounded-2xl border border-[#27272a] bg-card p-5">
                <h2 className="font-heading text-lg font-semibold">{course.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.instructor} · {course.instructorTitle} · Updated {course.updated}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{course.description}</p>
                <h3 className="mt-5 flex items-center gap-2 font-heading text-sm font-semibold text-white">
                  <Lightbulb className="size-4 text-amber-400" /> Key takeaways of this lesson
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                  {[
                    `Where "${current.title}" fits in the course arc — and what it unlocks next.`,
                    "The mechanism in plain language, plus the vocabulary you'll hear in the wild.",
                    "A worked example you should reproduce before moving on.",
                  ].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <BadgeCheck className="mt-0.5 size-4 shrink-0 text-violet-400" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {course.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#232326] px-3 py-1 text-xs font-medium text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="transcript" className="mt-4">
              <div
                data-testid="course-transcript"
                className="max-h-96 space-y-1 overflow-y-auto rounded-2xl border border-[#27272a] bg-card p-4"
              >
                <p className="px-1 pb-2 text-xs text-muted-foreground">
                  AI-generated transcript — click a timestamp to jump.
                </p>
                {sampleTranscript.map((line) => {
                  const activeLine = elapsed * 1.2 >= line.seconds;
                  return (
                    <button
                      key={line.time}
                      type="button"
                      data-testid={`transcript-line-${line.time}`}
                      onClick={() => {
                        setElapsed(Math.min(line.seconds / 1.2, duration));
                        setPlaying(true);
                      }}
                      className={cn(
                        "flex w-full gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        activeLine ? "bg-[#1f1d2b] text-zinc-100" : "text-zinc-400 hover:bg-[#1e1e21]",
                      )}
                    >
                      <span className="shrink-0 font-mono text-xs text-violet-400">
                        {line.time}
                      </span>
                      <span>{line.text}</span>
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="rounded-2xl border border-[#27272a] bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Notes for “{current.title}”</p>
                  <span className="text-[11px] text-emerald-400" data-testid="lesson-notes-saved">
                    Auto-saved in your browser
                  </span>
                </div>
                <textarea
                  data-testid="lesson-notes-textarea"
                  value={note}
                  onChange={(e) => setNote(current.id, e.target.value)}
                  placeholder="Type your notes… timestamps like 03:26 will link to the transcript in a later stage."
                  rows={8}
                  className="w-full resize-y rounded-xl border border-[#2e2e33] bg-[#181818] px-3.5 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-600"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNote(current.id, `${note}${note ? "\n" : ""}★ Key point at ${fmtSeconds(elapsed)} — `)
                    }
                    className="rounded-full border border-[#2e2e33] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-violet-600/50 hover:text-white"
                  >
                    ★ Insert timestamp note at {fmtSeconds(elapsed)}
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="discussion" className="mt-4">
              <div className="rounded-2xl border border-[#27272a] bg-card p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!commentDraft.trim()) return;
                    setComments((prev) => [
                      {
                        id: `c-${Date.now()}`,
                        author: "You",
                        avatarSeed: "AC",
                        at: "just now",
                        text: commentDraft.trim(),
                        likes: 0,
                      },
                      ...prev,
                    ]);
                    setCommentDraft("");
                    toast.success("Question posted to the discussion");
                  }}
                  className="flex gap-2"
                >
                  <input
                    data-testid="discussion-input"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Ask the community anything about this lesson…"
                    className="h-10 flex-1 rounded-xl border border-[#2e2e33] bg-[#181818] px-3.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-600"
                  />
                  <button
                    type="submit"
                    data-testid="discussion-post-btn"
                    className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white transition-all hover:opacity-90 active:scale-95"
                  >
                    <Send className="size-4" />
                  </button>
                </form>
                <ul className="mt-4 space-y-4">
                  {comments.map((c) => (
                    <li key={c.id} className="flex gap-3" data-testid={`discussion-comment-${c.id}`}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2e1065] text-xs font-bold text-violet-200">
                        {c.avatarSeed}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-100">
                          {c.author}{" "}
                          <span className="ml-1 text-xs font-normal text-zinc-500">{c.at}</span>
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-zinc-300">{c.text}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
                          <Heart className="size-3" /> {c.likes}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── right column: syllabus ── */}
        <aside className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-[#27272a] bg-card xl:sticky xl:top-20">
            <div className="border-b border-[#232326] p-4">
              <p className="font-heading text-sm font-semibold">Course modules & syllabus</p>
              <p className="mt-1 text-xs text-muted-foreground" data-testid="syllabus-progress-text">
                {doneCount} of {allLessons.length} lessons complete ({progress}%)
              </p>
              <ProgressBar value={progress} glow className="mt-2.5" />
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {course.modules.map((module) => {
                const open = expanded.has(module.id);
                const moduleDone = module.lessons.filter((l) => done.includes(l.id)).length;
                return (
                  <div key={module.id} className="mb-1.5">
                    <button
                      type="button"
                      data-testid={`syllabus-module-${module.id}`}
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#1e1e21]"
                    >
                      {open ? (
                        <ChevronDown className="size-4 shrink-0 text-zinc-500" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-zinc-500" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-zinc-100">
                          {module.title}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {moduleDone}/{module.lessons.length} complete
                        </span>
                      </span>
                    </button>
                    {open ? (
                      <ul className="ml-3 space-y-0.5 border-l border-[#232326] pl-2">
                        {module.lessons.map((lesson) => {
                          const lessonDone = done.includes(lesson.id);
                          const isCurrent = lesson.id === current.id;
                          return (
                            <li key={lesson.id}>
                              <div
                                data-testid={`syllabus-lesson-${lesson.id}`}
                                className={cn(
                                  "group flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors",
                                  isCurrent ? "bg-[#1f1d2b]" : "hover:bg-[#1e1e21]",
                                )}
                              >
                                <button
                                  type="button"
                                  aria-label={lessonDone ? "Mark incomplete" : "Mark complete"}
                                  data-testid={`lesson-complete-toggle-${lesson.id}`}
                                  onClick={() => toggleLesson(course.id, lesson.id)}
                                  className={cn(
                                    "shrink-0 transition-all active:scale-90",
                                    lessonDone
                                      ? "text-emerald-400"
                                      : "text-zinc-600 hover:text-violet-400",
                                  )}
                                >
                                  {lessonDone ? (
                                    <Check className="size-4.5" />
                                  ) : (
                                    <Circle className="size-4.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => selectLesson(lesson)}
                                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                >
                                  <span className="min-w-0">
                                    <span
                                      className={cn(
                                        "block truncate text-[13px]",
                                        isCurrent
                                          ? "font-medium text-violet-200"
                                          : "text-zinc-300",
                                      )}
                                    >
                                      {lesson.title}
                                    </span>
                                  </span>
                                  <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] text-zinc-500">
                                    <LessonKindIcon lesson={lesson} />
                                    {lesson.duration}
                                  </span>
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {nextLesson ? (
              <div className="border-t border-[#232326] p-3">
                <button
                  type="button"
                  data-testid="syllabus-next-lesson-btn"
                  onClick={() => selectLesson(nextLesson)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                >
                  Next lesson <ChevronRight className="size-4" />
                </button>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {/* mobile "isDone" indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground xl:hidden">
        {isDone ? (
          <>
            <BadgeCheck className="size-4 text-emerald-400" /> This lesson is marked complete
          </>
        ) : (
          <>
            <Compass className="size-4 text-violet-400" /> Pick up from the syllabus on the right —{" "}
            <span className="text-violet-300">{progress}% done</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function CoursePlayer() {
  const { id } = useParams();
  const course = getCourse(id ?? "");

  if (!course) {
    return (
      <EmptyState
        testId="course-not-found"
        icon={<Compass className="size-6" />}
        title="Course not found"
        body="That course doesn't exist in the prototype catalog."
      >
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Browse the catalog
        </Link>
      </EmptyState>
    );
  }

  return <CourseWorkspace key={course.id} course={course} />;
}
