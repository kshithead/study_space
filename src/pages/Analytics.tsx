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
} from "lucide-react";
import {
  accuracyTrend,
  badges,
  focusTrend,
  recentActivity,
  skillRadar,
  user as mockUser,
  weeklyHours,
} from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { PageHeader, ProgressBar } from "@/components/shared";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "#181818",
  border: "1px solid #2e2e33",
  borderRadius: 12,
  fontSize: 12,
  color: "#f4f4f5",
};

const earnedBadges = badges.filter((b) => b.earned);

export default function Analytics() {
  const { quizScores, completed } = useAppState();
  const scores = Object.values(quizScores);
  const avgAccuracy =
    scores.length > 0
      ? Math.round(scores.reduce((n, s) => n + s.best, 0) / scores.length)
      : 82;
  const lessonsDone = Object.values(completed).reduce((n, l) => n + l.length, 0);
  const goalPct = Math.min(
    100,
    Math.round((mockUser.hoursThisWeek / mockUser.weeklyGoalHours) * 100),
  );

  const stats = [
    {
      id: "hours",
      label: "Watch time this week",
      value: `${mockUser.hoursThisWeek}h`,
      sub: `of ${mockUser.weeklyGoalHours}h goal (${goalPct}%)`,
      icon: Clock,
      tint: "text-violet-400",
    },
    {
      id: "streak",
      label: "Current streak",
      value: `${mockUser.streak} days`,
      sub: "personal best: 21 days",
      icon: Flame,
      tint: "text-orange-400",
    },
    {
      id: "accuracy",
      label: "Avg quiz accuracy",
      value: `${avgAccuracy}%`,
      sub: "across all attempts",
      icon: Target,
      tint: "text-blue-400",
    },
    {
      id: "lessons",
      label: "Lessons completed",
      value: String(lessonsDone),
      sub: "this is your live count",
      icon: CircleCheck,
      tint: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Learning Analytics"
        subtitle="Velocity, retention and habits — sample metrics combined with your live prototype state"
      />

      {/* stat row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              data-testid={`analytics-stat-${s.id}`}
              className="rounded-2xl border border-[#27272a] bg-card p-4"
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
              <p className="mt-0.5 text-xs text-muted-foreground">Sample data · daily totals</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-lg font-bold text-violet-300">{mockUser.hoursThisWeek}h</p>
              <ProgressBar value={goalPct} className="mt-1 w-28" glow />
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHours} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
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
          <p className="mt-0.5 text-xs text-muted-foreground">Mastery estimate per topic</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadar} outerRadius="72%">
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
          <p className="mt-0.5 text-xs text-muted-foreground">8-week arc · sample data</p>
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#232326" vertical={false} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[40, 100]} stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Accuracy"]} />
                <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: "#3b82f6" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-card p-5 xl:col-span-2" data-testid="analytics-chart-focus">
          <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
            <Timer className="size-4 text-violet-400" /> Focus sessions per week
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Pomodoros completed in the Focus Room</p>
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusTrend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#232326" vertical={false} />
                <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
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
          <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
            <Award className="size-4 text-amber-400" /> Badges & milestones
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {badges.map((b) => (
              <div
                key={b.id}
                data-testid={`badge-${b.id}`}
                className={cn(
                  "rounded-xl border p-3 text-center transition-all",
                  b.earned
                    ? "border-violet-600/40 bg-[#1f1d2b]"
                    : "border-[#232326] bg-[#161616] opacity-45",
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
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {earnedBadges.length} of {badges.length} unlocked
          </p>
        </div>

        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="analytics-activity">
          <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="size-4 text-violet-400" /> Recent activity
          </h3>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                <div className="min-w-0">
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
