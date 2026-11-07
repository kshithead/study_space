import { useEffect, useRef, useState } from "react";
import {
  Check,
  CloudRain,
  Coffee,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Timer,
  Trees,
  Waves,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { user as mockUser } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "focus" | "short" | "long";

const modeSpecs: Record<Mode, { label: string; seconds: number; hint: string }> = {
  focus: { label: "Focus", seconds: 25 * 60, hint: "25 minutes of deep work" },
  short: { label: "Short break", seconds: 5 * 60, hint: "5 minutes — stand up, look far away" },
  long: { label: "Long break", seconds: 15 * 60, hint: "15 minutes — recharge properly" },
};

const soundscapes: Array<{ id: string; name: string; icon: LucideIcon }> = [
  { id: "rain", name: "Rain on Window", icon: CloudRain },
  { id: "lofi", name: "Cyberpunk Lofi Cafe", icon: Coffee },
  { id: "binaural", name: "Binaural Waves 40Hz", icon: Waves },
  { id: "forest", name: "Deep Forest", icon: Trees },
];

const R = 130;
const CIRC = 2 * Math.PI * R;

export default function FocusRoom() {
  const { pomodorosToday, incrementPomodoros, focusTasks, addFocusTask, toggleFocusTask, removeFocusTask } =
    useAppState();
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(modeSpecs.focus.seconds);
  const [running, setRunning] = useState(false);
  const [zen, setZen] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>("lofi");
  const [taskDraft, setTaskDraft] = useState("");
  const completionGuard = useRef<Mode | null>(null);

  const total = modeSpecs[mode].seconds;

  const switchMode = (m: Mode) => {
    setMode(m);
    setRemaining(modeSpecs[m].seconds);
    setRunning(false);
  };

  // ticking
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => window.clearInterval(t);
  }, [running, remaining]);

  // completion
  useEffect(() => {
    if (remaining > 0 || !running) return;
    setRunning(false);
    if (mode === "focus") {
      if (completionGuard.current !== mode) {
        completionGuard.current = mode;
        incrementPomodoros();
        toast.success("Pomodoro complete 🍅", {
          description: "Logged to today's tally. Take your break.",
        });
      }
      switchMode("short");
    } else {
      toast.info("Break over", { description: "Back to depth — start the next focus block." });
      switchMode("focus");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on zero
  }, [remaining, running]);

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = 1 - remaining / total;
  const doneTasks = focusTasks.filter((t) => t.done).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Focus Room</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pomodoro sessions with ambient soundscapes — ambient audio is a visual prototype.
          </p>
        </div>
        <button
          type="button"
          data-testid="focus-zen-mode-btn"
          onClick={() => setZen((z) => !z)}
          className="inline-flex items-center gap-2 rounded-full border border-[#2e2e33] bg-card px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:border-violet-600/50 hover:text-white active:scale-95"
        >
          {zen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          {zen ? "Exit zen mode" : "Zen mode"}
        </button>
      </div>

      <div className={cn("grid gap-5", zen ? "" : "lg:grid-cols-[280px_minmax(0,1fr)_280px]")}>
        {/* tasks */}
        {!zen ? (
          <aside className="order-2 lg:order-1">
            <div className="rounded-2xl border border-[#27272a] bg-card p-4">
              <p className="font-heading text-sm font-semibold">
                Session queue{" "}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {doneTasks}/{focusTasks.length} done
                </span>
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!taskDraft.trim()) return;
                  addFocusTask(taskDraft.trim());
                  setTaskDraft("");
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  data-testid="focus-task-input"
                  value={taskDraft}
                  onChange={(e) => setTaskDraft(e.target.value)}
                  placeholder="Add a task for this block…"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-[#2e2e33] bg-[#181818] px-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-600"
                />
                <button
                  type="submit"
                  data-testid="focus-task-add-btn"
                  aria-label="Add task"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition-all hover:opacity-90 active:scale-90"
                >
                  <Plus className="size-4" />
                </button>
              </form>
              <ul className="mt-3 space-y-1.5">
                {focusTasks.map((t) => (
                  <li
                    key={t.id}
                    data-testid={`focus-task-${t.id}`}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                      t.done ? "text-zinc-500" : "bg-[#1b1b1e] text-zinc-200",
                    )}
                  >
                    <button
                      type="button"
                      aria-label={t.done ? "Mark undone" : "Mark done"}
                      onClick={() => toggleFocusTask(t.id)}
                      data-testid={`focus-task-toggle-${t.id}`}
                      className={cn(
                        "flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90",
                        t.done
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : "border-[#3f3f46] hover:border-violet-500",
                      )}
                    >
                      {t.done ? <Check className="size-3" /> : null}
                    </button>
                    <span className={cn("min-w-0 flex-1 truncate", t.done && "line-through")}>
                      {t.text}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove task"
                      onClick={() => removeFocusTask(t.id)}
                      className="hidden shrink-0 text-zinc-600 transition-colors hover:text-red-400 group-hover:block"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#27272a] bg-card p-4 text-center">
                <p className="font-heading text-2xl font-bold text-violet-300" data-testid="focus-pomodoro-count">
                  {pomodorosToday}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">pomodoros today</p>
              </div>
              <div className="rounded-2xl border border-[#27272a] bg-card p-4 text-center">
                <p className="font-heading text-2xl font-bold text-orange-300">
                  {mockUser.streak}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">day streak</p>
              </div>
            </div>
          </aside>
        ) : null}

        {/* timer */}
        <section
          className={cn(
            "order-1 flex flex-col items-center justify-center rounded-3xl border border-[#1e1e24] bg-[#0b0c10] px-6 py-10 lg:order-2",
            zen && "min-h-[70vh]",
          )}
        >
          {/* mode pills */}
          <div className="mb-8 flex gap-1.5 rounded-full border border-[#1e1b4b] bg-[#131521] p-1">
            {(Object.keys(modeSpecs) as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                data-testid={`focus-mode-${m}`}
                onClick={() => switchMode(m)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-all active:scale-95",
                  mode === m
                    ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-[0_0_16px_rgba(124,58,237,0.5)]"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                {modeSpecs[m].label}
              </button>
            ))}
          </div>

          {/* ring */}
          <div className="relative">
            {running ? (
              <div className="animate-aura absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.28),transparent_70%)]" />
            ) : null}
            <svg width="300" height="300" viewBox="0 0 300 300" className="-rotate-90">
              <circle cx="150" cy="150" r={R} fill="none" stroke="#1e1e24" strokeWidth="14" />
              <circle
                cx="150"
                cy="150"
                r={R}
                fill="none"
                stroke="url(#timerGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${progress * CIRC} ${CIRC}`}
                style={{ transition: "stroke-dasharray 0.6s linear" }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                data-testid="focus-timer-display"
                className="font-heading text-6xl font-bold tabular-nums text-zinc-50"
              >
                {mm}:{ss}
              </span>
              <span className="mt-1 text-xs text-zinc-500">{modeSpecs[mode].hint}</span>
            </div>
          </div>

          {/* controls */}
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              data-testid="focus-timer-reset-btn"
              aria-label="Reset timer"
              onClick={() => {
                setRemaining(total);
                setRunning(false);
              }}
              className="flex size-12 items-center justify-center rounded-full border border-[#2e2e33] bg-card text-zinc-300 transition-all hover:border-[#3f3f46] hover:text-white active:scale-90"
            >
              <RotateCcw className="size-5" />
            </button>
            <button
              type="button"
              data-testid="focus-timer-toggle-btn"
              onClick={() => setRunning((r) => !r)}
              className="glow-ring inline-flex h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-8 text-base font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            >
              {running ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
              {running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              data-testid="focus-timer-skip-btn"
              aria-label="Skip to next block"
              onClick={() => switchMode(mode === "focus" ? "short" : "focus")}
              className="flex size-12 items-center justify-center rounded-full border border-[#2e2e33] bg-card text-zinc-300 transition-all hover:border-[#3f3f46] hover:text-white active:scale-90"
            >
              <SkipForward className="size-5" />
            </button>
          </div>

          <p className="mt-6 inline-flex items-center gap-1.5 text-[11px] text-zinc-600">
            <Timer className="size-3" />
            {pomodorosToday} pomodoro{pomodorosToday === 1 ? "" : "s"} logged today · each one
            banks 25 focus minutes
          </p>
        </section>

        {/* soundscapes */}
        {!zen ? (
          <aside className="order-3">
            <div className="rounded-2xl border border-[#27272a] bg-card p-4">
              <p className="font-heading text-sm font-semibold">Ambient mixer</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick one atmosphere — visual prototype (no audio streaming yet).
              </p>
              <ul className="mt-3 space-y-1.5">
                {soundscapes.map((s) => {
                  const active = activeSound === s.id;
                  const Icon = s.icon;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        data-testid={`soundscape-chip-${s.id}`}
                        onClick={() => {
                          setActiveSound(active ? null : s.id);
                          if (!active) toast.success(`${s.name} playing`, { description: "(Visual prototype)" });
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all active:scale-[0.98]",
                          active
                            ? "border-violet-600/60 bg-[#1e1b4b] text-violet-100"
                            : "border-[#27272a] bg-[#1b1b1e] text-zinc-300 hover:border-[#3f3f46]",
                        )}
                      >
                        <Icon className={cn("size-4 shrink-0", active ? "text-violet-400" : "text-zinc-500")} />
                        <span className="min-w-0 flex-1 truncate">{s.name}</span>
                        {active ? (
                          <span className="flex h-4 items-end gap-0.5" aria-hidden>
                            <span className="eq-bar h-3 w-0.5 rounded bg-violet-400" />
                            <span className="eq-bar h-4 w-0.5 rounded bg-violet-400 [animation-delay:150ms]" />
                            <span className="eq-bar h-2.5 w-0.5 rounded bg-violet-400 [animation-delay:300ms]" />
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
