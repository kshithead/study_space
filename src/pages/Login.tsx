import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "@/store/appState";
import {
  DEFAULT_NEUTRAL_AVATAR,
  getOAuthUrl,
  loginUser,
  registerUser,
} from "@/services/auth";
import { toast } from "sonner";
import "./login04.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppState();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);
  const [doneTitle, setDoneTitle] = useState("");
  const [doneText, setDoneText] = useState("");
  const [oauthDialog, setOauthDialog] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        if (!fullname.trim()) {
          setErrorMsg("Please enter your full name.");
          setIsSubmitting(false);
          return;
        }

        const res = await registerUser({
          email: cleanEmail,
          password,
          fullName: fullname.trim(),
          avatar: DEFAULT_NEUTRAL_AVATAR,
        });

        login(res.user);
        setDoneTitle(`Welcome to StudySpace, ${res.user.firstName}!`);
        setDoneText(
          "Your student account has been registered in the database. All courses, notes, and the Socrates AI tutor are ready."
        );
        setDone(true);
        toast.success(`Welcome to StudySpace, ${res.user.firstName}! 🎉`);
      } else {
        const res = await loginUser({
          email: cleanEmail,
          password,
        });

        login(res.user);
        setDoneTitle(`Welcome back, ${res.user.firstName}`);
        setDoneText(
          "Authenticated with secure session. Your study streak, bookmarked courses, and AI notes are synchronized."
        );
        setDone(true);
        toast.success(`Welcome back, ${res.user.firstName}! 👋`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify your credentials.");
      toast.error("Authentication Error", {
        description: err.message || "Failed to authenticate.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      const authUrl = await getOAuthUrl(provider);
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (err: any) {
      setOauthDialog(
        `${provider} OAuth requires client credentials (e.g. ${provider.toUpperCase()}_CLIENT_ID) configured in your backend .env file. Direct passwordless bypass is disabled for security. Please use Email & Password registration or configure OAuth.`
      );
      toast.error(`${provider} OAuth Not Configured`, {
        description: "Please sign in with your email and password.",
      });
    }
  };

  const handleFillDemo = () => {
    setEmail("alex.carter@studyspace.app");
    setPassword("studyspace2026");
    setErrorMsg("");
    toast.info("Demo credentials loaded", {
      description: "Click 'Sign in' below to verify against the backend database.",
    });
  };

  const handleReset = () => {
    setDone(false);
    setEmail("");
    setPassword("");
    setFullname("");
    setErrorMsg("");
  };

  return (
    <main className="cl-login04">
      {/* Top navigation back link */}
      <Link to="/" className="cl-login04__back-btn" aria-label="Back to StudySpace">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to StudySpace
      </Link>

      {/* Backdrop image from login-page-04 */}
      <img className="cl-login04__bg" src="/images/backdrop.jpg" width="1200" height="800" alt="" />

      {/* Left intro section */}
      <div className="cl-login04__intro">
        <Link className="cl-login04__brand" to="/" aria-label="StudySpace home">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="#fb7185" />
            <circle cx="20" cy="12" r="8" fill="#38bdf8" fillOpacity=".85" />
            <circle cx="16" cy="19" r="8" fill="#facc15" fillOpacity=".85" />
          </svg>
          <span>StudySpace</span>
        </Link>
        <p className="cl-login04__kicker">AI-POWERED PERSONAL LEARNING PLATFORM</p>
        <p className="cl-login04__headline">Every course, lecture, and AI tutor session, in one place.</p>
        <ul className="cl-login04__chips" aria-label="Recent topics">
          <li>
            <span style={{ background: "#fb7185" }}></span>
            <span style={{ background: "#f97316" }}></span>
            <span style={{ background: "#facc15" }}></span>
            AI Socratic Tutor
          </li>
          <li>
            <span style={{ background: "#0ea5e9" }}></span>
            <span style={{ background: "#6366f1" }}></span>
            <span style={{ background: "#a855f7" }}></span>
            12+ Curated Courses
          </li>
        </ul>
      </div>

      {/* Right glass card */}
      <section className="cl-login04__glass" aria-labelledby="cl-login04-title">
        {!done ? (
          <div>
            <h1 className="cl-login04__title" id="cl-login04-title">
              {mode === "signup" ? "Create an account" : "Sign in"}
            </h1>
            <p className="cl-login04__sub">
              {mode === "signup"
                ? "Register a permanent account stored in the database."
                : "Good to see you again. Verify your identity to continue."}
            </p>

            <form className="cl-login04__form" onSubmit={handleSubmit} noValidate>
              {mode === "signup" && (
                <div className="cl-login04__field">
                  <label className="cl-login04__label" htmlFor="cl-name">
                    Full Name
                  </label>
                  <input
                    className="cl-login04__input"
                    id="cl-name"
                    name="fullname"
                    type="text"
                    required
                    placeholder="Alex Carter"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                  />
                </div>
              )}

              <div className={`cl-login04__field ${errorMsg ? "is-error" : ""}`}>
                <label className="cl-login04__label" htmlFor="cl-login04-email">
                  Email address
                </label>
                <input
                  className="cl-login04__input"
                  id="cl-login04-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="you@studyspace.app"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                />
              </div>

              <div className="cl-login04__field">
                <label className="cl-login04__label" htmlFor="cl-login04-pw">
                  Password
                </label>
                <div className="cl-login04__pw">
                  <input
                    className="cl-login04__input"
                    id="cl-login04-pw"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                  />
                  <button
                    className="cl-login04__eye"
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {!showPassword ? (
                      <svg
                        className="cl-login04__eye-on"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        className="cl-login04__eye-off"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 3l18 18M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div style={{ marginBottom: "16px" }}>
                  <p className="cl-login04__error">{errorMsg}</p>
                </div>
              )}

              <div className="cl-login04__row">
                <label className="cl-login04__check">
                  <input type="checkbox" name="remember" defaultChecked />
                  <span>Remember me</span>
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="cl-login04__link"
                    onClick={handleFillDemo}
                    title="Preload verified demo credentials"
                  >
                    Quick fill Demo Student
                  </button>
                )}
              </div>

              <button
                className="cl-login04__submit"
                type="submit"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.75 : 1 }}
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === "signup" ? "Create an account" : "Sign in"}</span>
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="cl-login04__or">
              <span>or continue with</span>
            </p>

            <div className="cl-login04__social">
              <button
                className="cl-login04__icon-btn"
                type="button"
                aria-label="Continue with Google"
                onClick={() => handleSocialAuth("Google")}
                title="Sign in with Google OAuth"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
                </svg>
              </button>
              <button
                className="cl-login04__icon-btn"
                type="button"
                aria-label="Continue with Apple"
                onClick={() => handleSocialAuth("Apple")}
                title="Sign in with Apple"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <rect x="6" y="2.5" width="12" height="19" rx="3" />
                  <path d="M10.5 18.5h3" />
                </svg>
              </button>
              <button
                className="cl-login04__icon-btn"
                type="button"
                aria-label="Continue with GitHub"
                onClick={() => handleSocialAuth("GitHub")}
                title="Sign in with GitHub OAuth"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19c-4 0-7-2.7-7-6.5S8.5 5 12.5 5 19 7.5 19 10.5c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.4 3.4c.8.8.4 2.1-.6 2.1Z" />
                  <circle cx="8.5" cy="12" r="1" />
                  <circle cx="11" cy="8.5" r="1" />
                  <circle cx="15" cy="8.5" r="1" />
                </svg>
              </button>
            </div>

            {/* OAuth Info Modal */}
            {oauthDialog && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(30, 20, 60, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                <p style={{ color: "#c4b5fd", marginBottom: "8px" }}>{oauthDialog}</p>
                <button
                  type="button"
                  onClick={() => setOauthDialog(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "none",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}

            <p className="cl-login04__foot">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    className="cl-login04__link"
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setErrorMsg("");
                    }}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to StudySpace?{" "}
                  <button
                    className="cl-login04__link"
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMsg("");
                    }}
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="cl-login04__done" tabIndex={-1}>
            <span className="cl-login04__swatches" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </span>
            <h2 className="cl-login04__title">{doneTitle}</h2>
            <p className="cl-login04__sub">{doneText}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              <button
                className="cl-login04__submit"
                type="button"
                onClick={() => navigate("/")}
              >
                Go to StudySpace Dashboard
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <button className="cl-login04__ghost" type="button" onClick={handleReset}>
                Sign out / Switch account
              </button>
            </div>
          </div>
        )}

        <p className="cl-login04__demo">StudySpace &mdash; Secure Student Authentication & Database Profile</p>
      </section>
    </main>
  );
}
