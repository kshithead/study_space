import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "@/store/appState";
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
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);
  const [doneTitle, setDoneTitle] = useState("");
  const [doneText, setDoneText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Enter your email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (mode === "signup") {
      const name = fullname.trim() || email.split("@")[0];
      const firstName = name.split(" ")[0];
      const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1);

      login({
        name,
        firstName: capitalized,
        email: email.trim(),
        handle: `@${capitalized.toLowerCase()}.learns`,
      });

      setDoneTitle(`Welcome to StudySpace, ${capitalized}!`);
      setDoneText("Your student profile has been created. All 12 courses, notes, and Socrates AI tutor are ready.");
      setDone(true);
      toast.success(`Welcome to StudySpace, ${capitalized}! 🎉`);
    } else {
      const raw = email.split("@")[0].replace(/[._-]+/g, " ");
      const firstName = raw.charAt(0).toUpperCase() + raw.slice(1);

      login({
        name: firstName,
        firstName,
        email: email.trim(),
      });

      setDoneTitle(`Welcome back, ${firstName}`);
      setDoneText("Your study streak, bookmarked courses, and AI notes are synced.");
      setDone(true);
      toast.success(`Welcome back, ${firstName}! 👋`);
    }
  };

  const handleSocialAuth = (provider: string) => {
    login({
      name: `Student (${provider})`,
      firstName: "Learner",
      email: `student@${provider.toLowerCase()}.com`,
    });
    setDoneTitle(`Welcome back`);
    setDoneText(`Authenticated with ${provider}. Redirecting to your dashboard...`);
    setDone(true);
    toast.success(`Signed in via ${provider}`);
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

      {/* Exact backdrop image from login-page-04 */}
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
                ? "Start your personalized learning journey today."
                : "Good to see you again."}
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
                {errorMsg && <p className="cl-login04__error">{errorMsg}</p>}
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
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="cl-login04__row">
                <label className="cl-login04__check">
                  <input type="checkbox" name="remember" defaultChecked />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="cl-login04__link"
                  onClick={() => toast.info("Demo reset link sent to your email.")}
                >
                  Forgot password?
                </button>
              </div>

              <button className="cl-login04__submit" type="submit">
                {mode === "signup" ? "Create an account" : "Sign in"}
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
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19c-4 0-7-2.7-7-6.5S8.5 5 12.5 5 19 7.5 19 10.5c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.4 3.4c.8.8.4 2.1-.6 2.1Z" />
                  <circle cx="8.5" cy="12" r="1" />
                  <circle cx="11" cy="8.5" r="1" />
                  <circle cx="15" cy="8.5" r="1" />
                </svg>
              </button>
            </div>

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

        <p className="cl-login04__demo">StudySpace &mdash; College Major Project Prototype</p>
      </section>
    </main>
  );
}
