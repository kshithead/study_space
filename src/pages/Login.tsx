import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAppState } from "@/store/appState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AVATARS = [
  {
    id: "alex",
    label: "Creative",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=200&h=200",
  },
  {
    id: "david",
    label: "Coder",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=200&h=200",
  },
  {
    id: "priya",
    label: "Researcher",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=200&h=200",
  },
  {
    id: "marcus",
    label: "Architect",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=200&h=200",
  },
];

const TRACKS = [
  "Artificial Intelligence & ML",
  "Full-Stack Web Development",
  "Computer Science & DSA",
  "Database & Cloud Systems",
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppState();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [track, setTrack] = useState(TRACKS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [remember, setRemember] = useState(true);

  // Quick fill for demo student
  const handleQuickDemo = () => {
    setEmail("alex.carter@studyspace.app");
    setPassword("studyspace2026");
    toast.info("Demo credentials loaded", {
      description: "Signed in as Alex Carter (Student Demo).",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Missing fields", { description: "Please enter your email and password." });
      return;
    }

    if (password.length < 6) {
      toast.error("Password too short", { description: "Password must be at least 6 characters." });
      return;
    }

    if (mode === "signup") {
      const name = fullname.trim() || email.split("@")[0];
      const firstName = name.split(" ")[0];
      const handle = `@${firstName.toLowerCase()}.learns`;

      login({
        name,
        firstName,
        email,
        handle,
        avatar: selectedAvatar,
        interests: [track, "Learning Science", "Problem Solving"],
        streak: 1,
        level: 1,
        levelName: "Explorer",
        xp: 250,
        xpToNext: 1000,
        hoursThisWeek: 0.5,
        joined: "November 2026",
      });

      toast.success(`Welcome to STUDYSPACE, ${firstName}! 🎉`, {
        description: `Profile created for ${track}. Socrates AI tutor is ready.`,
      });
    } else {
      const raw = email.split("@")[0].replace(/[._-]+/g, " ");
      const firstName = raw.charAt(0).toUpperCase() + raw.slice(1);

      login({
        name: raw.charAt(0).toUpperCase() + raw.slice(1),
        firstName,
        email,
      });

      toast.success(`Welcome back, ${firstName}! 👋`, {
        description: "Your courses, notes, and study streak are synced.",
      });
    }

    navigate("/");
  };

  const handleSocialAuth = (provider: string) => {
    login({
      name: `Student (${provider})`,
      firstName: "Learner",
      email: `student@${provider.toLowerCase()}.com`,
    });
    toast.success(`Signed in via ${provider}`, {
      description: "Redirecting to your STUDYSPACE dashboard...",
    });
    navigate("/");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#090810] text-zinc-100 flex flex-col justify-between selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glowing auras */}
      <div className="pointer-events-none absolute -left-40 -top-40 size-[600px] rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[550px] rounded-full bg-blue-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.12),transparent_70%)]" />

      {/* Top bar with back link */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md transition-all hover:border-violet-500/40 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to StudySpace
        </Link>
        <span className="text-xs font-medium text-zinc-500">College Major Project Prototype</span>
      </header>

      {/* Main split container */}
      <main className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-8 lg:grid-cols-[1.1fr_460px] sm:px-12">
        {/* Left Column: Brand Showcase & Value Propositions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-500 shadow-[0_0_25px_rgba(124,58,237,0.5)]">
              <Sparkles className="size-6 text-white" />
            </span>
            <span className="font-heading text-2xl font-black tracking-tight text-white">
              STUDYSPACE
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
              AI-Powered Personal Learning Assistant
            </p>
            <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Master any subject with your{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
                personal AI mentor.
              </span>
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
              Explore 12+ real YouTube lecture playlists, chat with Socrates to clear doubts,
              and solidify your memory through automated spaced-repetition flashcards.
            </p>
          </div>

          {/* Feature pill chips */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-[#16122c]/60 px-4 py-2 text-xs font-medium text-violet-200 backdrop-blur-md shadow-sm">
              <Brain className="size-4 text-violet-400" /> Socrates Socratic Tutor
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-[#10192e]/60 px-4 py-2 text-xs font-medium text-blue-200 backdrop-blur-md shadow-sm">
              <BookOpen className="size-4 text-blue-400" /> 12+ Curated Courses
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0d221b]/60 px-4 py-2 text-xs font-medium text-emerald-200 backdrop-blur-md shadow-sm">
              <Zap className="size-4 text-emerald-400" /> Smart Flashcards
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-[#2b170c]/60 px-4 py-2 text-xs font-medium text-orange-200 backdrop-blur-md shadow-sm">
              <Flame className="size-4 text-orange-400" /> Daily Streak & XP
            </span>
          </div>
        </div>

        {/* Right Column: Glassmorphism Login / Signup Card */}
        <div className="relative rounded-3xl border border-violet-500/30 bg-[#121024]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          {/* Segmented Switcher */}
          <div className="mb-6 flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-semibold transition-all duration-200",
                mode === "signin"
                  ? "bg-violet-600 text-white shadow-[0_2px_12px_rgba(124,58,237,0.5)]"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-semibold transition-all duration-200",
                mode === "signup"
                  ? "bg-violet-600 text-white shadow-[0_2px_12px_rgba(124,58,237,0.5)]"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              Create Profile
            </button>
          </div>

          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
              {mode === "signin" ? "Welcome back" : "Create your student profile"}
            </h2>
            <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
              {mode === "signin"
                ? "Pick up right where you left off today."
                : "Set your learning track and join thousands of active learners."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Avatar on Signup */}
            {mode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="e.g. Alex Carter"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-violet-500 focus:bg-white/10"
                  />
                </div>

                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Choose an Avatar</label>
                  <div className="flex items-center gap-3">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.url)}
                        className={cn(
                          "relative size-11 overflow-hidden rounded-full border-2 transition-transform active:scale-90",
                          selectedAvatar === av.url
                            ? "border-violet-500 ring-2 ring-violet-500/40 scale-105"
                            : "border-transparent opacity-70 hover:opacity-100",
                        )}
                      >
                        <img src={av.url} alt={av.label} className="size-full object-cover" />
                        {selectedAvatar === av.url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-violet-600/40">
                            <CheckCircle2 className="size-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Learning Track */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Primary Learning Goal</label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#18152e] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                  >
                    {TRACKS.map((t) => (
                      <option key={t} value={t} className="bg-[#18152e]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@studyspace.app"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-violet-500 focus:bg-white/10"
              />
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-violet-500 focus:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {mode === "signin" && (
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-3.5 rounded border-white/20 bg-white/10 text-violet-600 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Password Reset", { description: "Password reset link sent to your email." })}
                  className="text-violet-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-[0_6px_24px_rgba(124,58,237,0.45)] transition-all hover:opacity-95 active:scale-98"
            >
              <span>{mode === "signin" ? "Sign in to STUDYSPACE" : "Create Profile & Start Learning"}</span>
              <ArrowRight className="size-4" />
            </button>

            {/* Quick 1-Click Demo Account for Reviewers */}
            {mode === "signin" && (
              <button
                type="button"
                onClick={handleQuickDemo}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-500/40 bg-violet-600/10 py-2.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-600/20 hover:text-white"
              >
                <span>⚡ One-Click Fill: Demo Student (Alex Carter)</span>
              </button>
            )}
          </form>

          {/* Social Auth Separator */}
          <div className="relative my-6 text-center text-xs text-zinc-500">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#121024] px-3 font-medium">or continue with</span>
          </div>

          {/* Social Auth Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleSocialAuth("Google")}
              className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:border-violet-500/40 hover:bg-white/10 hover:text-white"
              aria-label="Google"
            >
              <svg viewBox="0 0 24 24" className="size-5 fill-current">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.485 0 2.835.54 3.885 1.425l2.4-2.4C16.89 3.42 14.715 2.5 12.24 2.5 7.005 2.5 2.76 6.745 2.76 11.98s4.245 9.48 9.48 9.48c5.46 0 9.1-3.84 9.1-9.27 0-.63-.06-1.245-.18-1.905h-8.92z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth("GitHub")}
              className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:border-violet-500/40 hover:bg-white/10 hover:text-white"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" className="size-5 fill-current">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth("Apple")}
              className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:border-violet-500/40 hover:bg-white/10 hover:text-white"
              aria-label="Apple"
            >
              <svg viewBox="0 0 24 24" className="size-5 fill-current">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.65-.79 1.1-1.88.98-2.97-.95.04-2.09.64-2.77 1.43-.59.69-1.12 1.8-0.98 2.86 1.06.08 2.13-.53 2.77-1.32z" />
              </svg>
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-400">
            {mode === "signin" ? "New to STUDYSPACE? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-violet-400 hover:underline"
            >
              {mode === "signin" ? "Create a profile" : "Sign in here"}
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 text-center text-xs text-zinc-500 sm:px-12">
        STUDYSPACE &mdash; Secure Student Authentication & Profile Management &bull; 2026
      </footer>
    </div>
  );
}

