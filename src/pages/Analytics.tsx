import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/lib/recharts";
import {
  Award,
  BarChart3,
  CircleCheck,
  Clock,
  Flame,
  ListChecks,
  Target,
  Timer,
  BookOpen,
} from "lucide-react";
import { useAppState } from "@/store/appState";
import { PageHeader, ProgressBar } from "@/components/shared";
import { cn } from "@/lib/utils";
import {
  computeUserBadges,
  computeSkillDistribution,
  computeWeeklyHours,
  computeRecentActivities,
} from "@/lib/userAnalytics";

const tooltipStyle = {
  background: "#181818",
  border: "1px solid #2e2e33",
  borderRadius: 12,
  fontSize: 12,
  color: "#f4f4f5",
};

export default function Analytics() {
  const {
    user,
    quizScores,
    completed,
    enrolledCourses,
    chatSessions,
    pomodorosToday,
  } = useAppState();

  const scores = useMemo(() => Object.values(quizScores), [quizScores]);
  const hasQuizzes = scores.length > 0;
  const avgAccuracy = hasQuizzes
    ? Math.round(scores.reduce((n, s) => n + s.best, 0) / scores.length)
    : null;

  const lessonsDone = useMemo(
    () => Object.values(completed).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0),
    [completed]
  );

  // Compute live study hours based on actual lesson duration & focus timer
  const calculatedHours = useMemo(
    () => Math.round((lessonsDone * 0.35 + (pomodorosToday || 0) * 0.42) * 10) / 10,
    [lessonsDone, pomodorosToday]
  );
  const activeHours = Math.max(user.hoursThisWeek || 0, calculatedHours);
  const goalHours = user.weeklyGoalHours || 6;
  const goalPct = Math.min(100, Math.round((activeHours / goalHours) * 100));

  const stats = [
    {
      id: "hours",
      label: "Study time this week",
      value: `${activeHours}h`,
      sub: `of ${goalHours}h weekly goal (${goalPct}%)`,
      icon: Clock,
      tint: "text-violet-400",
    },
    {
      id: "streak",
      label: "Current streak",
      value: `${user.streak || 1} day${(user.streak || 1) > 1 ? "s" : ""}`,
      sub: (user.streak || 1) > 1 ? "Daily momentum ongoing" : "Logged in today",
      icon: Flame,
      tint: "text-orange-400",
    },
    {
      id: "accuracy",
      label: "Avg quiz accuracy",
      value: avgAccuracy !== null ? `${avgAccuracy}%` : "—",
      sub: avgAccuracy !== null ? `across ${scores.length} quiz${scores.length > 1 ? "zes" : ""}` : "No quizzes taken yet",
      icon: Target,
      tint: "text-blue-400",
    },
    {
      id: "lessons",
      label: "Lessons completed",
      value: String(lessonsDone),
      sub: lessonsDone > 0 ? `across ${enrolledCourses.length || 1} course${enrolledCourses.length > 1 ? "s" : ""}` : "Start your first lesson",
      icon: CircleCheck,
      tint: "text-emerald-400",
    },
  ];

  // Dynamic user-driven charts data
  const dynamicWeeklyHours = useMemo(
    () => computeWeeklyHours(lessonsDone, pomodorosToday, activeHours),
    [lessonsDone, pomodorosToday, activeHours]
  );

  const dynamicSkillRadar = useMemo(
    () => computeSkillDistribution(completed, quizScores),
    [completed, quizScores]
  );

  const dynamicBadges = useMemo(
    () =>
      computeUserBadges({
        user,
        completed,
        quizScores,
        enrolledCourses,
        chatSessions,
        pomodorosToday,
      }),
    [user, completed, quizScores, enrolledCourses, chatSessions, pomodorosToday]
  );

  const unlockedBadges = dynamicBadges.filter((b) => b.earned);

  const dynamicActivities = useMemo(
    () =>
      computeRecentActivities({
        user,
        completed,
        quizScores,
        enrolledCourses,
        chatSessions,
      }),
    [user, completed, quizScores, enrolledCourses, chatSessions]
  );

  // Dynamic quiz accuracy curve
  const quizTrendData = useMemo(() => {
    const entries = Object.entries(quizScores);
    if (entries.length === 0) return [];
    return entries.map(([id, q], idx) => ({
      quiz: `Quiz ${idx + 1}`,
      accuracy: q.best,
    }));
  }, [quizScores]);

  // Dynamic focus trend
  const focusData = useMemo(() => {
    const count = pomodorosToday || 0;
    return [
      { week: "3 wks ago", sessions: 0 },
      { week: "2 wks ago", sessions: 0 },
      { week: "Last week", sessions: Math.max(0, count - 1) },
      { week: "This week", sessions: count },
    ];
  }, [pomodorosToday]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Learning Analytics"
        subtitle="Live metrics computed directly from your study activity, completed lessons, quizzes, and focus sessions."
      />

      {/* stat row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              data-testid={`analytics-stat-${s.id}`}
              className="rounded-2xl border border-[#27272a] bg-card p-4 transition-all hover:border-[#38383e]"
            >
              <div className="flex items-center justify-between">
                <span className={cn("flex size-9 items-center justify-center rounded-xl bg-[#1f1d2b]", s.tint)}>
                  <Icon className="size-4.5" />
                </span>
              </div>
              <p className="mt-3 font-heading text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium text-zinc-300">{s.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* charts bento */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#27272a] bg-card p-5 xl:col-span-2" data-testid="analytics-chart-weekly">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="size-4 text-violet-400" /> Study hours, this week
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Daily totals based on completed modules & focus sessions</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-lg font-bold text-violet-300">{activeHours}h</p>
              <ProgressBar value={goalPct} className="mt-1 w-28" glow />
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicWeeklyHours} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#232326" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(124,58,237,0.08)" }} contentStyle={tooltipStyle} formatter={(value: number) => [`${value}h`, "Study time"]} />
                <Bar dataKey="hours" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="analytics-chart-radar">
          <h3 className="font-heading text-sm font-semibold">Skill distribution</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Live mastery estimated from your enrolled topics</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={dynamicSkillRadar} outerRadius="72%">
                <PolarGrid stroke="#2e2e33" />
                <PolarAngleAxis dataKey="skill" stroke="#a1a1aa" fontSize={10} />
                <Radar dataKey="score" stroke="#a78bfa" fill="#7c3aed" fillOpacity={0.45} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}/100`, "Mastery"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="analytics-chart-accuracy">
          <h3 className="font-heading text-sm font-semibold">Quiz accuracy trend</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Performance across your checkpoint quizzes</p>
          <div className="mt-2 h-52">
            {quizTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizTrendData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#232326" vertical={false} />
                  <XAxis dataKey="quiz" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Accuracy"]} />
                  <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-3">
                <Target className="size-8 text-zinc-600 mb-2" />
                <p className="text-xs font-semibold text-zinc-300">No quizzes completed yet</p>
                <p className="mt-1 text-[11px] text-zinc-500 max-w-[210px]">
                  Take quizzes at the end of course modules to track your retention curve here.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-card p-5 xl:col-span-2" data-testid="analytics-chart-focus">
          <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
            <Timer className="size-4 text-violet-400" /> Focus sessions
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Pomodoro focus blocks completed in the Focus Room</p>
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#232326" vertical={false} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(59,130,246,0.08)" }} contentStyle={tooltipStyle} formatter={(value: number) => [value, "Sessions"]} />
                <Bar dataKey="sessions" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* badges + activity */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="analytics-badges">
          <div className="flex items-center justify-between">
            <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
              <Award className="size-4 text-amber-400" /> Badges & milestones
            </h3>
            <span className="rounded-full bg-[#1f1d2b] px-2.5 py-0.5 text-xs font-medium text-violet-300">
              {unlockedBadges.length} of {dynamicBadges.length} unlocked
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {dynamicBadges.map((b) => (
              <div
                key={b.id}
                data-testid={`badge-${b.id}`}
                className={cn(
                  "rounded-xl border p-3 text-center transition-all",
                  b.earned
                    ? "border-violet-600/50 bg-[#1f1d2b] shadow-[0_0_15px_rgba(124,58,237,0.12)]"
                    : "border-[#232326] bg-[#141416] opacity-60",
                )}
              >
                <span
                  className={cn(
                    "mx-auto flex size-9 items-center justify-center rounded-full",
                    b.earned ? "bg-gradient-to-br from-violet-600 to-blue-500 text-white" : "bg-[#232326] text-zinc-500",
                  )}
                >
                  <Award className="size-4.5" />
                </span>
                <p className="mt-2 text-xs font-semibold text-zinc-100">{b.name}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{b.desc}</p>
                <p className={cn("mt-1.5 text-[10px] font-semibold", b.earned ? "text-emerald-400" : "text-zinc-500")}>
                  {b.progressText}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="analytics-activity">
          <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="size-4 text-violet-400" /> Recent activity
          </h3>
          <ul className="mt-4 space-y-3">
            {dynamicActivities.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-200">{a.text}</p>
                  <p className="text-[11px] text-zinc-500">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
