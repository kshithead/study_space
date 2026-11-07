import { Bell, Bot, Moon, Palette, Save, Target, UserRound } from "lucide-react";
import { tutorModes, user as mockUser } from "@/data/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";
import { PageHeader } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ToggleRowProps {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testId: string;
}

function ToggleRow({ label, desc, checked, onChange, testId }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-100">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-testid={testId}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors active:scale-95",
          checked ? "bg-violet-600" : "bg-[#2e2e33]",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const [dailyGoal, setDailyGoal] = usePersistentState("ss.settings.dailyGoal", "1.5");
  const [defaultMode, setDefaultMode] = usePersistentState("ss.settings.aiMode", "Socratic Mentor");
  const [notifCourse, setNotifCourse] = usePersistentState("ss.settings.notifCourse", true);
  const [notifQuiz, setNotifQuiz] = usePersistentState("ss.settings.notifQuiz", true);
  const [notifStreak, setNotifStreak] = usePersistentState("ss.settings.notifStreak", true);
  const [autoplay, setAutoplay] = usePersistentState("ss.settings.autoplay", true);
  const [reduceMotion, setReduceMotion] = usePersistentState("ss.settings.reduceMotion", false);

  const saveAll = () =>
    toast.success("Settings saved", {
      description: "Stored locally — this stage has no backend to sync to.",
    });

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Preferences persist in this browser — authentication and sync arrive in a later stage"
      />

      {/* profile */}
      <section className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="settings-profile-section">
        <h2 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <UserRound className="size-4 text-violet-400" /> Profile
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="size-20 rounded-2xl object-cover"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-400">Full name</span>
              <input
                defaultValue={mockUser.name}
                data-testid="settings-name-input"
                className="h-10 w-full rounded-xl border border-[#2e2e33] bg-[#181818] px-3.5 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-600"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-400">Email</span>
              <input
                defaultValue={mockUser.email}
                data-testid="settings-email-input"
                className="h-10 w-full rounded-xl border border-[#2e2e33] bg-[#181818] px-3.5 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-600"
              />
            </label>
          </div>
        </div>
      </section>

      {/* learning */}
      <section className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="settings-learning-section">
        <h2 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <Target className="size-4 text-violet-400" /> Learning preferences
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">Daily study goal</p>
            <p className="text-xs text-muted-foreground">Feeds your home-page goal ring</p>
          </div>
          <Select value={dailyGoal} onValueChange={(v: string) => setDailyGoal(v)}>
            <SelectTrigger data-testid="settings-daily-goal-select" className="w-40 border-[#2e2e33] bg-[#181818] text-sm">
              <SelectValue>{(v: string | null) => `${v ?? "1.5"} hours / day`}</SelectValue>
            </SelectTrigger>
            <SelectContent className="border-[#2e2e33] bg-popover">
              {["0.5", "1", "1.5", "2", "3", "4"].map((h) => (
                <SelectItem key={h} value={h}>
                  {h} hours / day
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="divide-y divide-[#232326]">
          <ToggleRow
            label="Autoplay next lesson"
            desc="Roll straight into the next lesson when one ends"
            checked={autoplay}
            onChange={setAutoplay}
            testId="settings-autoplay-toggle"
          />
          <ToggleRow
            label="Reduce motion"
            desc="Tone down ambient animations across the app"
            checked={reduceMotion}
            onChange={setReduceMotion}
            testId="settings-reduce-motion-toggle"
          />
        </div>
      </section>

      {/* AI */}
      <section className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="settings-ai-section">
        <h2 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <Bot className="size-4 text-violet-400" /> AI tutor defaults
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">Default personality</p>
            <p className="text-xs text-muted-foreground">Applied to every new AI Tutor session</p>
          </div>
          <Select value={defaultMode} onValueChange={(v: string) => setDefaultMode(v)}>
            <SelectTrigger data-testid="settings-ai-mode-select" className="w-52 border-[#2e2e33] bg-[#181818] text-sm">
              <SelectValue>{(v: string | null) => v ?? "Socratic Mentor"}</SelectValue>
            </SelectTrigger>
            <SelectContent className="border-[#2e2e33] bg-popover">
              {tutorModes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* notifications */}
      <section className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="settings-notifications-section">
        <h2 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <Bell className="size-4 text-violet-400" /> Notifications
        </h2>
        <div className="mt-1 divide-y divide-[#232326]">
          <ToggleRow
            label="New lessons in enrolled courses"
            desc="When an instructor publishes fresh material"
            checked={notifCourse}
            onChange={setNotifCourse}
            testId="settings-notif-course-toggle"
          />
          <ToggleRow
            label="Quiz reminders"
            desc="A nudge when a checkpoint quiz is due"
            checked={notifQuiz}
            onChange={setNotifQuiz}
            testId="settings-notif-quiz-toggle"
          />
          <ToggleRow
            label="Streak alerts"
            desc="Warning pings before your streak is at risk"
            checked={notifStreak}
            onChange={setNotifStreak}
            testId="settings-notif-streak-toggle"
          />
        </div>
      </section>

      {/* appearance */}
      <section className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="settings-appearance-section">
        <h2 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <Palette className="size-4 text-violet-400" /> Appearance
        </h2>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">Theme</p>
            <p className="text-xs text-muted-foreground">
              STUDYSPACE is dark-first — the charcoal look is the product
            </p>
          </div>
          <span
            data-testid="settings-theme-badge"
            className="inline-flex items-center gap-2 rounded-full border border-violet-600/50 bg-[#1f1d2b] px-4 py-2 text-sm font-medium text-violet-200"
          >
            <Moon className="size-4" /> Dark (default)
          </span>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          data-testid="settings-save-btn"
          onClick={saveAll}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        >
          <Save className="size-4" /> Save changes
        </button>
      </div>
    </div>
  );
}
