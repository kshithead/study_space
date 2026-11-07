import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useAppState } from "@/store/appState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppState();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (mode === "signup" && !name) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login({
        id: `u-${Date.now()}`,
        name: mode === "signup" ? name : email.split("@")[0].replace(/[._]/g, " "),
        email,
        studentId: studentId || "VU2026-ENG",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=200&h=200",
      });
      setIsLoading(false);
      toast.success(`Welcome back!`, {
        description: `Logged in as ${email}`,
      });
      navigate("/");
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login({
        id: "demo-user-1",
        name: "Kshitij Rathod",
        email: "kshitij.rathod@vupune.ac.in",
        studentId: "3124045020169",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=200&h=200",
      });
      setIsLoading(false);
      toast.success("Logged in with Demo Student Profile!");
      navigate("/");
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0d] px-4 py-12 selection:bg-violet-500/30 selection:text-violet-200">
      {/* ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/20 to-blue-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 -z-10 h-[400px] w-[500px] rounded-full bg-violet-900/10 blur-[120px]" />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#27272a] bg-[#121216]/90 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
        {/* left banner column (desktop) */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[#232327] bg-gradient-to-b from-[#1a172a] via-[#141320] to-[#0f0e17] p-10 lg:flex">
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-[0_0_24px_rgba(124,58,237,0.45)]">
                <GraduationCap className="size-5 text-white" />
              </span>
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                Study<span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Space</span>
              </span>
            </Link>

            <div className="mt-12 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                <Sparkles className="size-3.5" /> AI-Powered Personal Learning
              </span>
              <h2 className="font-heading text-3xl font-bold leading-tight text-white">
                Learn smarter from your own lecture notes & courses.
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400">
                Upload PDFs, query with grounded RAG, take adaptive quizzes, and track weak topics with Socrates AI.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-8">
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <CheckCircle2 className="size-4 text-violet-400" />
              <span>Document-grounded RAG with source citations</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <CheckCircle2 className="size-4 text-violet-400" />
              <span>Embedded top-tier YouTube lectures & courses</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <CheckCircle2 className="size-4 text-violet-400" />
              <span>Offline & cloud hybrid AI tutoring (Gemini / Ollama)</span>
            </div>
          </div>

          <div className="relative z-10 mt-8 border-t border-[#2a2838] pt-4 text-xs text-zinc-500">
            Vishwakarma University · Major Project
          </div>
        </div>

        {/* right auth form column */}
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">
                {mode === "signin" ? "Welcome back" : "Create an account"}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {mode === "signin"
                  ? "Enter your academic credentials to continue"
                  : "Join StudySpace to personalize your learning journey"}
              </p>
            </div>
            <div className="lg:hidden">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500">
                <GraduationCap className="size-5 text-white" />
              </span>
            </div>
          </div>

          {/* mode tabs */}
          <div className="mb-6 flex rounded-xl border border-[#27272a] bg-[#18181c] p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                mode === "signin"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                mode === "signup"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-zinc-400 hover:text-zinc-200",
              )}
            >
              Sign Up
            </button>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Full Name</label>
                  <div className="flex items-center gap-2 rounded-xl border border-[#2e2e33] bg-[#17171b] px-3.5 py-2.5 transition-colors focus-within:border-violet-500">
                    <User className="size-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. Kshitij Rathod"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">PRN / Student ID (Optional)</label>
                  <div className="flex items-center gap-2 rounded-xl border border-[#2e2e33] bg-[#17171b] px-3.5 py-2.5 transition-colors focus-within:border-violet-500">
                    <ShieldCheck className="size-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. 3124045020169"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">College or Personal Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#2e2e33] bg-[#17171b] px-3.5 py-2.5 transition-colors focus-within:border-violet-500">
                <Mail className="size-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="student@vu.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                {mode === "signin" && (
                  <span className="text-[11px] text-zinc-500 hover:text-zinc-400 cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#2e2e33] bg-[#17171b] px-3.5 py-2.5 transition-colors focus-within:border-violet-500">
                <Lock className="size-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                "Processing..."
              ) : mode === "signin" ? (
                <>
                  Sign In to StudySpace <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#27272a]" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">or review demo</span>
            <div className="h-px flex-1 bg-[#27272a]" />
          </div>

          {/* Quick Demo Login Button for Examiners / Reviewers */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 py-2.5 text-xs font-semibold text-violet-200 transition-all hover:bg-violet-500/20 active:scale-95"
          >
            <Bot className="size-4 text-violet-400" />
            Quick 1-Click Demo Login (College Review)
          </button>

          <p className="mt-6 text-center text-xs text-zinc-500">
            By continuing, you agree to StudySpace's academic honor code and terms of study.
          </p>
        </div>
      </div>
    </div>
  );
}
