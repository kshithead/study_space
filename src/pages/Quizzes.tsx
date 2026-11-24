import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  ListChecks,
  Timer,
  X,
  Sparkles,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { quizzes } from "@/data/mockData";
import type { Quiz } from "@/data/mockData";
import { PageHeader, ProgressBar } from "@/components/shared";
import { useAppState } from "@/store/appState";
import { usePersistentState } from "@/hooks/usePersistentState";
import { generateQuizWithAI } from "@/services/ai";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type View = "list" | "run" | "results";

interface RunState {
  quiz: Quiz;
  idx: number;
  answers: Record<string, number[]>;
  confirmed: Record<string, boolean>;
  secondsLeft: number;
}

export default function Quizzes() {
  const { quizScores, recordQuizScore } = useAppState();
  const location = useLocation();

  const [customQuizzes, setCustomQuizzes] = usePersistentState<Quiz[]>("ss.customQuizzes", []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateTopic, setGenerateTopic] = useState("");

  const [view, setView] = useState<View>("list");
  const [run, setRun] = useState<RunState | null>(null);
  const [score, setScore] = useState(0);

  const allQuizzes = useMemo(() => {
    return [...customQuizzes, ...quizzes];
  }, [customQuizzes]);

  const startQuiz = (quiz: Quiz) => {
    setRun({
      quiz,
      idx: 0,
      answers: {},
      confirmed: {},
      secondsLeft: quiz.durationMin * 60,
    });
    setView("run");
  };

  const generateAndStart = async (title: string) => {
    setIsGenerating(true);
    setGeneratingTitle(title);
    try {
      const newQuiz = await generateQuizWithAI(title);
      setCustomQuizzes((prev) => [newQuiz, ...prev.filter((q) => q.id !== newQuiz.id)]);
      startQuiz(newQuiz);
      toast.success(`Adaptive quiz ready!`, {
        description: `4 conceptual questions generated for "${title}".`,
      });
    } catch (e) {
      console.error("Quiz generation failed:", e);
      toast.error("Could not generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
      setGeneratingTitle("");
    }
  };

  // Listen for auto-generate requests from Study Materials
  useEffect(() => {
    const locState = location.state as {
      documentTitle?: string;
      autoGenerate?: boolean;
    } | null;

    if (locState?.autoGenerate && locState.documentTitle) {
      const title = locState.documentTitle;
      const existing = customQuizzes.find(
        (q) =>
          q.title.toLowerCase().includes(title.toLowerCase()) ||
          q.course.toLowerCase().includes(title.toLowerCase()),
      );
      if (existing) {
        startQuiz(existing);
        toast.info(`Loaded checkpoint for "${title}"`);
      } else {
        generateAndStart(title);
      }
    }
  }, [location.state]);

  const finish = (r: RunState) => {
    const correct = r.quiz.questions.filter(
      (q) =>
        r.confirmed[q.id] &&
        (r.answers[q.id] ?? []).length === q.answer.length &&
        [...(r.answers[q.id] ?? [])].sort().join() === [...q.answer].sort().join(),
    ).length;
    const pct = Math.round((correct / r.quiz.questions.length) * 100);
    setScore(pct);
    recordQuizScore(r.quiz.id, pct);
    setRun({ ...r });
    setView("results");
    toast.success(`Quiz finished — ${pct}%`, { description: r.quiz.title });
  };

  // countdown
  useEffect(() => {
    if (view !== "run" || !run) return;
    if (run.secondsLeft <= 0) {
      finish(run);
      return;
    }
    const t = window.setTimeout(
      () => setRun((r) => (r ? { ...r, secondsLeft: r.secondsLeft - 1 } : r)),
      1000,
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick per second; finish handles expiry
  }, [view, run]);

  const q = run?.quiz.questions[run.idx];
  const chosen = q ? run?.answers[q.id] ?? [] : [];
  const confirmedQ = q ? (run?.confirmed[q.id] ?? false) : false;
  const isCorrect =
    q &&
    chosen.length === q.answer.length &&
    [...chosen].sort().join() === [...q.answer].sort().join();

  const analysis = useMemo(() => {
    if (!run) return null;
    const wrongTopics = run.quiz.questions
      .filter(
        (qq) =>
          run.confirmed[qq.id] &&
          ((run.answers[qq.id] ?? []).length !== qq.answer.length ||
            [...(run.answers[qq.id] ?? [])].sort().join() !== [...qq.answer].sort().join()),
      )
      .map((qq) => qq.prompt.slice(0, 42));
    return wrongTopics;
  }, [run]);

  // ── list view ──
  if (view === "list") {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Quizzes"
          subtitle="Adaptive checkpoints with instant explanations — every wrong answer is a lesson"
        >
          <Button
            type="button"
            data-testid="quiz-generate-ai-btn"
            onClick={() => setShowGenerateModal(true)}
            disabled={isGenerating}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="mr-1.5 size-3.5" /> Generate with AI
          </Button>
        </PageHeader>

        {isGenerating && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-amber-500/40 bg-amber-950/20 p-8 text-center animate-pulse">
            <Loader2 className="mb-3 size-8 animate-spin text-amber-400" />
            <h3 className="text-base font-semibold text-white">Synthesizing Adaptive Quiz with Gemini AI</h3>
            <p className="mt-1 max-w-md text-xs text-amber-300/80">
              Generating 4 grounded conceptual questions with instant explanations based on "{generatingTitle}"...
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allQuizzes.map((quiz) => {
            const s = quizScores[quiz.id];
            const isAiQuiz = quiz.id.startsWith("ai-") || quiz.id.startsWith("syn-");
            return (
              <div
                key={quiz.id}
                data-testid={`quiz-card-${quiz.id}`}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-5 transition-all hover:-translate-y-1",
                  isAiQuiz
                    ? "border-amber-500/40 hover:border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.06)]"
                    : "border-[#27272a] hover:border-violet-600/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      isAiQuiz ? "bg-amber-500/15 text-amber-400" : "bg-[#1f1d2b] text-violet-400",
                    )}
                  >
                    <ListChecks className="size-5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isAiQuiz && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        AI Document Checkpoint
                      </span>
                    )}
                    {s ? (
                      <span
                        className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300"
                        data-testid={`quiz-best-score-${quiz.id}`}
                      >
                        Best {s.best}% · {s.attempts} attempt{s.attempts > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#232326] px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                        Not started
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mt-3 font-heading text-base font-semibold">{quiz.title}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{quiz.course}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-[#232326] px-2 py-0.5">{quiz.difficulty}</span>
                  <span className="inline-flex items-center gap-1">
                    <Timer className="size-3.5" /> {quiz.durationMin} min
                  </span>
                  <span>{quiz.questions.length} questions</span>
                </div>
                <Button
                  data-testid={`quiz-start-btn-${quiz.id}`}
                  onClick={() => startQuiz(quiz)}
                  className={cn(
                    "mt-4 rounded-full text-white hover:opacity-90",
                    isAiQuiz
                      ? "bg-gradient-to-r from-amber-500 to-amber-600"
                      : "bg-gradient-to-r from-violet-600 to-blue-500",
                  )}
                >
                  {s ? "Retake quiz" : "Start quiz"}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Generate Modal */}
        <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
          <DialogContent className="border-[#2e2e33] bg-[#181818] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <Sparkles className="size-4 text-amber-400" />
                Generate Quiz with Gemini AI
              </DialogTitle>
              <DialogDescription>
                Enter any study document title or topic. Google Gemini will create 4 conceptual questions with instant explanations.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!generateTopic.trim()) return;
                setShowGenerateModal(false);
                const t = generateTopic.trim();
                setGenerateTopic("");
                generateAndStart(t);
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <label className="text-xs font-medium text-zinc-300">Topic or Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ParkPulse Project Explainer, Dynamic Programming..."
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#2e2e33] bg-[#121214] px-3.5 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-amber-500"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerateModal(false)}
                  className="border-[#2e2e33] text-zinc-300 hover:bg-[#232326]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!generateTopic.trim() || isGenerating}
                  className="bg-gradient-to-r from-amber-500 to-violet-600 text-white hover:opacity-90"
                >
                  Generate Quiz
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── results view ──
  if (view === "results" && run) {
    const ringPct = score;
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <button
          type="button"
          onClick={() => setView("list")}
          data-testid="quiz-back-to-list"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-violet-300"
        >
          <ChevronLeft className="size-4" /> All quizzes
        </button>

        <div className="rounded-3xl border border-[#27272a] bg-card p-6 text-center animate-fade-up">
          <h1 className="font-heading text-xl font-semibold">{run.quiz.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your performance review</p>
          <div className="relative mx-auto mt-6 size-40">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#27272a" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(ringPct / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center" data-testid="quiz-score-display">
              <span className="font-heading text-4xl font-bold">{score}%</span>
              <span className="text-xs text-muted-foreground">score</span>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              onClick={() => startQuiz(run.quiz)}
              data-testid="quiz-retry-btn"
              className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90"
            >
              Retry quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => setView("list")}
              className="rounded-full border-[#2e2e33] bg-transparent"
            >
              Back to quizzes
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-violet-600/40 bg-gradient-to-b from-[#1a1826] to-[#161522] p-5 animate-fade-up-1">
          <p className="font-heading flex items-center gap-2 text-sm font-semibold text-violet-200">
            <CircleCheck className="size-4" /> AI analysis of weak areas
          </p>
          {analysis && analysis.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {analysis.slice(0, 3).map((t) => (
                <li key={t} className="flex gap-2.5">
                  <CircleX className="mt-0.5 size-4 shrink-0 text-red-400" />
                  <span>
                    <span className="font-medium text-white">{t}…</span> — rewatch the linked
                    lesson, then try a 3-question drill in the AI Tutor.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-300">
              Flawless run — every confirmed answer was correct. You're ready for the harder
              checkpoint; the AI Tutor can draft one at exam difficulty.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {run.quiz.questions.map((qq) => {
            const my = run.answers[qq.id] ?? [];
            const ok =
              run.confirmed[qq.id] &&
              my.length === qq.answer.length &&
              [...my].sort().join() === [...qq.answer].sort().join();
            return (
              <div key={qq.id} className="rounded-2xl border border-[#27272a] bg-card p-4">
                <p className="flex items-start gap-2 text-sm font-medium text-zinc-100">
                  {ok ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  ) : (
                    <CircleX className="mt-0.5 size-4 shrink-0 text-red-400" />
                  )}
                  {qq.prompt}
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Correct: {qq.answer.map((i) => qq.options[i]).join(" · ")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{qq.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── run view ──
  if (view === "run" && run && q) {
    const mm = Math.floor(run.secondsLeft / 60);
    const ss = String(run.secondsLeft % 60).padStart(2, "0");
    const answeredCount = Object.keys(run.confirmed).length;
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setView("list")}
            data-testid="quiz-abandon-btn"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-red-300"
          >
            <X className="size-4" /> Exit
          </button>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold tabular-nums",
              run.secondsLeft < 30
                ? "bg-red-500/15 text-red-300"
                : "bg-[#1f1d2b] text-violet-200",
            )}
            data-testid="quiz-timer"
          >
            <Timer className="size-4" /> {mm}:{ss}
          </span>
        </div>

        <ProgressBar value={(answeredCount / run.quiz.questions.length) * 100} glow />

        {/* question grid nav */}
        <div className="flex flex-wrap gap-1.5" data-testid="quiz-question-grid">
          {run.quiz.questions.map((qq, i) => {
            const c = run.confirmed[qq.id];
            const correct =
              c &&
              (run.answers[qq.id] ?? []).length === qq.answer.length &&
              [...(run.answers[qq.id] ?? [])].sort().join() === [...qq.answer].sort().join();
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => setRun({ ...run, idx: i })}
                className={cn(
                  "size-9 rounded-lg text-xs font-semibold transition-all active:scale-90",
                  i === run.idx
                    ? "bg-violet-600 text-white"
                    : correct
                      ? "bg-emerald-500/20 text-emerald-300"
                      : c
                        ? "bg-red-500/20 text-red-300"
                        : "bg-[#232326] text-zinc-400 hover:bg-[#2e2e33]",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* question card */}
        <div className="rounded-3xl border border-[#27272a] bg-card p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
            Question {run.idx + 1} of {run.quiz.questions.length}
            {q.type === "multi" ? " · select all that apply" : q.type === "code" ? " · code reading" : ""}
          </p>
          <h2 className="mt-2 font-heading text-lg font-semibold leading-snug">{q.prompt}</h2>
          {q.code ? (
            <pre className="mt-3 overflow-x-auto rounded-xl border border-[#2e2e33] bg-[#09090b] p-4 font-mono text-[12.5px] leading-relaxed text-zinc-200">
              {q.code}
            </pre>
          ) : null}

          <div className="mt-4 space-y-2">
            {q.options.map((opt, i) => {
              const picked = chosen.includes(i);
              const revealCorrect = confirmedQ && q.answer.includes(i);
              const revealWrong = confirmedQ && picked && !q.answer.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  data-testid={`quiz-option-btn-${i}`}
                  disabled={confirmedQ}
                  onClick={() =>
                    setRun((r) => {
                      if (!r || !q) return r;
                      const cur = r.answers[q.id] ?? [];
                      const next =
                        q.type === "multi"
                          ? cur.includes(i)
                            ? cur.filter((x) => x !== i)
                            : [...cur, i]
                          : [i];
                      return { ...r, answers: { ...r.answers, [q.id]: next } };
                    })
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                    revealCorrect
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                      : revealWrong
                        ? "border-red-500/60 bg-red-500/10 text-red-200"
                        : picked
                          ? "border-violet-600 bg-violet-600/15 text-white"
                          : "border-[#2e2e33] bg-[#181818] text-zinc-300 hover:border-[#3f3f46]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center border text-xs font-semibold",
                      q.type === "multi" ? "rounded-md" : "rounded-full",
                      picked ? "border-violet-500 bg-violet-600 text-white" : "border-[#3f3f46] text-zinc-500",
                    )}
                  >
                    {picked ? <Check className="size-3.5" /> : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {confirmedQ ? (
            <div
              data-testid="quiz-explanation"
              className={cn(
                "mt-4 rounded-xl border p-4 text-sm leading-relaxed",
                isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-100",
              )}
            >
              <p className="font-semibold">
                {isCorrect ? "Correct — here's why:" : "Not quite — here's the lesson:"}
              </p>
              <p className="mt-1 text-zinc-200">{q.explanation}</p>
            </div>
          ) : null}

          <div className="mt-5 flex justify-between gap-2">
            <Button
              variant="outline"
              data-testid="quiz-prev-question-btn"
              disabled={run.idx === 0}
              onClick={() => setRun((r) => (r ? { ...r, idx: Math.max(0, r.idx - 1) } : r))}
              className="rounded-full border-[#2e2e33] bg-transparent"
            >
              <ChevronLeft className="mr-1 size-4" /> Previous
            </Button>
            {!confirmedQ ? (
              <Button
                data-testid="quiz-submit-btn"
                disabled={chosen.length === 0}
                onClick={() =>
                  setRun((r) => (r && q ? { ...r, confirmed: { ...r.confirmed, [q.id]: true } } : r))
                }
                className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90"
              >
                Confirm answer
              </Button>
            ) : run.idx < run.quiz.questions.length - 1 ? (
              <Button
                data-testid="quiz-next-question-btn"
                onClick={() => setRun((r) => (r ? { ...r, idx: r.idx + 1 } : r))}
                className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90"
              >
                Next question <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button
                data-testid="quiz-finish-btn"
                onClick={() => finish(run)}
                className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90"
              >
                Finish quiz <CircleCheck className="ml-1 size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
