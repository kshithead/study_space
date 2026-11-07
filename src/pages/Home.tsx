import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Flame,
  Layers,
  ListChecks,
  PlayCircle,
  Route,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  aiQuickActions,
  allCourses,
  courseLessons,
  learningPaths,
  slugify,
  trendingTopics,
  user as mockUser,
} from "@/data/mockData";
import type { Course } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { CourseCard } from "@/components/CourseCard";
import { ProgressBar, SectionHeader } from "@/components/shared";
import { cn } from "@/lib/utils";

const actionIcons: Record<string, typeof Bot> = {
  bot: Bot,
  quiz: ListChecks,
  sum: Sparkles,
  cards: Layers,
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const navigate = useNavigate();
  const { completed, courseProgress, user: currentUser } = useAppState();
  const user = currentUser ?? mockUser;

  const inProgress = allCourses
    .filter((c) => c.enrolled && courseProgress(c.id) < 100)
    .sort((a, b) => courseProgress(b.id) - courseProgress(a.id));
  const spotlight = inProgress[0];
  const recommended = allCourses.filter((c) => !c.enrolled).slice(0, 6);
  const recentlyWatched = allCourses.filter(
    (c) => c.enrolled && courseProgress(c.id) > 0,
  ).slice(0, 3);

  const nextLessonOf = (course: Course) => {
    const done = completed[course.id] ?? [];
    const all = courseLessons(course);
    return all.find((l) => !done.includes(l.id)) ?? all[0];
  };

  const goalPct = Math.round(
    Math.min(100, (user.hoursThisWeek / user.weeklyGoalHours) * 100),
  );

  return (
    <div className="space-y-10">
      {/* greeting */}
      <section className="animate-fade-up">
        <p className="text-sm font-medium text-violet-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl" data-testid="home-greeting">
          {greeting()}, {user.firstName} — ready to level up?
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1f1d2b] px-3 py-1.5 text-xs font-semibold text-orange-300">
            <Flame className="size-3.5" /> {user.streak}-day streak
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1f1d2b] px-3 py-1.5 text-xs font-semibold text-violet-300">
            <Zap className="size-3.5" /> {user.hoursThisWeek}h / {user.weeklyGoalHours}h this week
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1f1d2b] px-3 py-1.5 text-xs font-semibold text-blue-300">
            Level {user.level} · {user.levelName}
          </span>
        </div>
      </section>

      {/* spotlight + AI launcher */}
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {spotlight ? (
          <div
            data-testid={`continue-learning-card-${spotlight.id}`}
            className="group relative overflow-hidden rounded-3xl border border-[#27272a] animate-fade-up-1"
          >
            <img
              src={spotlight.thumbnail}
              alt={spotlight.title}
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/85 to-[#0f0f0f]/30" />
            <div className="relative flex min-h-56 flex-col justify-end p-6 sm:p-7">
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-600/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                <PlayCircle className="size-3.5" /> Continue learning
              </span>
              <h2 className="max-w-lg font-heading text-xl font-bold leading-snug sm:text-2xl">
                {spotlight.title}
              </h2>
              <p className="mt-1.5 text-sm text-zinc-300">
                Up next · {nextLessonOf(spotlight)?.title}
              </p>
              <div className="mt-4 flex max-w-md items-center gap-3">
                <ProgressBar value={courseProgress(spotlight.id)} glow />
                <span className="shrink-0 text-xs font-semibold text-violet-300">
                  {courseProgress(spotlight.id)}%
                </span>
              </div>
              <div className="mt-5">
                <Link
                  to={`/course/${spotlight.id}`}
                  data-testid="spotlight-resume-button"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,0.4)] transition-all hover:opacity-90 active:scale-95"
                >
                  Resume course <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-violet-600/25 bg-gradient-to-b from-[#1a1826] to-[#151419] p-5 animate-fade-up-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-500">
              <Bot className="size-4 text-white" />
            </span>
            <h2 className="font-heading text-base font-semibold">AI learning tools</h2>
          </div>
          <ul className="space-y-1.5">
            {aiQuickActions.map((a) => {
              const Icon = actionIcons[a.icon];
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    data-testid={`ai-quick-prompt-${a.id}`}
                    onClick={() => navigate(a.target)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-[#26262b] active:scale-[0.98]"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1f1d2b] text-violet-400">
                      <Icon className="size-4.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-100">
                        {a.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {a.desc}
                      </span>
                    </span>
                    <ArrowRight className="ml-auto size-4 shrink-0 text-zinc-600" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* topic chips */}
      <section>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`topic-filter-chip-${slugify(t.name)}`}
              onClick={() => navigate(`/explore?q=${encodeURIComponent(t.name)}`)}
              className="rounded-full border border-[#2e2e33] bg-card px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-violet-600/50 hover:text-white active:scale-95"
            >
              {t.name}
              <span className="ml-1.5 text-[10px] text-muted-foreground">{t.posts}</span>
            </button>
          ))}
        </div>
      </section>

      {/* continue learning */}
      <section>
        <SectionHeader
          title="Continue learning"
          subtitle="Pick up exactly where you left off"
          icon={<PlayCircle className="size-5" />}
          actionLabel="My Learning"
          actionTo="/my-learning"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {inProgress.slice(0, 3).map((c) => (
            <CourseCard key={c.id} course={c} showProgress />
          ))}
        </div>
      </section>

      {/* recommended */}
      <section>
        <SectionHeader
          title="Recommended for you"
          subtitle="Tuned to your goals and learning history"
          icon={<Sparkles className="size-5" />}
          actionLabel="Explore all"
          actionTo="/explore"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recommended.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* recently watched */}
      <section>
        <SectionHeader
          title="Recently watched"
          subtitle="Quick resume from your watch history"
          icon={<TrendingUp className="size-5" />}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recentlyWatched.map((c) => (
            <Link
              key={c.id}
              to={`/course/${c.id}`}
              data-testid={`recently-watched-${c.id}`}
              className="group flex items-center gap-3.5 rounded-2xl border border-[#27272a] bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-violet-600/50"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={c.thumbnail}
                  alt=""
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <PlayCircle className="size-6 text-white" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-heading line-clamp-1 text-sm font-semibold">
                  {c.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  Last: {nextLessonOf(c)?.title}
                </p>
                <p className="mt-1 text-[11px] font-medium text-violet-300">
                  {courseProgress(c.id)}% complete
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* learning paths */}
      <section>
        <SectionHeader
          title="Popular learning paths"
          subtitle="Multi-course roadmaps with a clear finish line"
          icon={<Route className="size-5" />}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {learningPaths.map((p) => (
            <button
              key={p.id}
              type="button"
              data-testid={`learning-path-${p.id}`}
              onClick={() => navigate("/explore")}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-[#27272a] bg-gradient-to-br p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(109,40,217,0.25)]",
                p.gradient,
              )}
            >
              <div className="absolute inset-0 bg-[#0f0f0f]/55 transition-colors group-hover:bg-[#0f0f0f]/40" />
              <div className="relative">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-200">
                  <Route className="size-3.5" /> Learning path
                </div>
                <h3 className="mt-2 font-heading text-lg font-bold text-white">
                  {p.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-zinc-200/90">{p.blurb}</p>
                <div className="mt-4 flex items-center gap-3 text-xs font-medium text-zinc-300">
                  <span>{p.weeks} weeks</span>
                  <span className="size-1 rounded-full bg-zinc-400" />
                  <span>{p.courses} courses</span>
                  <span className="size-1 rounded-full bg-zinc-400" />
                  <span>{p.learners} learners</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* footer note */}
      <footer className="flex items-center justify-center gap-2 border-t border-[#232326] pt-6 text-xs text-zinc-600">
        <BookOpen className="size-3.5" />
        STUDYSPACE stage 1 — frontend prototype with sample data. AI responses and
        progress are simulated locally in your browser.
      </footer>
    </div>
  );
}
