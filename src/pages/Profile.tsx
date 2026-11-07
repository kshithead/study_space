import { Link } from "react-router-dom";
import { Award, Flame, GraduationCap, Mail, Settings, Sparkles, Zap } from "lucide-react";
import { allCourses, badges, user as mockUser } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { PageHeader, ProgressBar } from "@/components/shared";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { courseProgress, completed, quizScores } = useAppState();
  const enrolled = allCourses.filter((c) => c.enrolled);
  const lessonsDone = Object.values(completed).reduce((n, l) => n + l.length, 0);
  const scores = Object.values(quizScores);
  const avgAccuracy =
    scores.length > 0
      ? Math.round(scores.reduce((n, s) => n + s.best, 0) / scores.length)
      : 82;
  const xpPct = Math.round((mockUser.xp / mockUser.xpToNext) * 100);
  const earned = badges.filter((b) => b.earned);

  const stats = [
    { id: "courses", label: "Courses enrolled", value: String(enrolled.length), icon: GraduationCap, tint: "text-violet-400" },
    { id: "lessons", label: "Lessons completed", value: String(lessonsDone), icon: Sparkles, tint: "text-blue-400" },
    { id: "streak", label: "Day streak", value: String(mockUser.streak), icon: Flame, tint: "text-orange-400" },
    { id: "accuracy", label: "Quiz accuracy", value: `${avgAccuracy}%`, icon: Zap, tint: "text-emerald-400" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" subtitle="Your learning identity on STUDYSPACE (prototype account)" />

      {/* identity card */}
      <div className="overflow-hidden rounded-3xl border border-[#27272a] bg-card animate-fade-up">
        <div className="relative h-36 bg-gradient-to-r from-violet-700/60 via-purple-700/40 to-blue-600/60">
          <div className="animate-drift absolute -left-10 -top-16 size-48 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="animate-drift absolute -right-6 top-4 size-40 rounded-full bg-blue-500/30 blur-3xl [animation-delay:1.2s]" />
        </div>
        <div className="relative px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <img
                src={mockUser.avatar}
                alt={mockUser.name}
                className="-mt-10 size-24 rounded-2xl border-4 border-card object-cover shadow-xl"
                data-testid="profile-avatar"
              />
              <div className="pb-1">
                <h2 className="font-heading text-xl font-bold" data-testid="profile-name">
                  {mockUser.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mockUser.handle} · Level {mockUser.level} {mockUser.levelName}
                </p>
              </div>
            </div>
            <Link
              to="/settings"
              data-testid="profile-settings-link"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2e2e33] bg-[#1b1b1e] px-4 py-2 text-sm font-medium text-zinc-200 transition-all hover:border-violet-600/50 hover:text-white active:scale-95"
            >
              <Settings className="size-4" /> Edit preferences
            </Link>
          </div>

          {/* XP bar */}
          <div className="mt-5 flex items-center gap-3">
            <ProgressBar value={xpPct} glow />
            <span className="shrink-0 text-xs text-muted-foreground">
              {mockUser.xp.toLocaleString()} / {mockUser.xpToNext.toLocaleString()} XP to level{" "}
              {mockUser.level + 1}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" /> {mockUser.email}
            </span>
            <span>Member since {mockUser.joined}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {mockUser.interests.map((i) => (
              <span
                key={i}
                className="rounded-full bg-[#232326] px-3 py-1 text-xs font-medium text-zinc-300"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="rounded-2xl border border-[#27272a] bg-card p-4" data-testid={`profile-stat-${s.id}`}>
              <span className={cn("flex size-9 items-center justify-center rounded-xl bg-[#1f1d2b]", s.tint)}>
                <Icon className="size-4.5" />
              </span>
              <p className="mt-3 font-heading text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* enrolled */}
        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="profile-courses">
          <h3 className="font-heading text-sm font-semibold">Enrolled courses</h3>
          <ul className="mt-4 space-y-3.5">
            {enrolled.map((c) => (
              <li key={c.id}>
                <Link to={`/course/${c.id}`} className="group flex items-center gap-3">
                  <img src={c.thumbnail} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100 group-hover:text-violet-300">
                      {c.title}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={courseProgress(c.id)} className="h-1" />
                      <span className="shrink-0 text-[11px] font-medium text-violet-300">
                        {courseProgress(c.id)}%
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* achievements */}
        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="profile-achievements">
          <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
            <Award className="size-4 text-amber-400" /> Achievements ({earned.length}/{badges.length})
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "rounded-xl border p-3 text-center",
                  b.earned ? "border-violet-600/40 bg-[#1f1d2b]" : "border-[#232326] bg-[#161616] opacity-45",
                )}
              >
                <span
                  className={cn(
                    "mx-auto flex size-9 items-center justify-center rounded-full",
                    b.earned
                      ? "bg-gradient-to-br from-violet-600 to-blue-500 text-white"
                      : "bg-[#232326] text-zinc-500",
                  )}
                >
                  <Award className="size-4.5" />
                </span>
                <p className="mt-2 text-xs font-semibold text-zinc-100">{b.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
