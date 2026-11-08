import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  Camera,
  Check,
  Edit3,
  Flame,
  GraduationCap,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Upload,
  User,
  X,
  Zap,
} from "lucide-react";
import { allCourses, badges } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { PageHeader, ProgressBar } from "@/components/shared";
import {
  DEFAULT_NEUTRAL_AVATAR,
  fetchCurrentUser,
  updateUserProfile,
  uploadUserAvatar,
} from "@/services/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Profile() {
  const navigate = useNavigate();
  const {
    courseProgress,
    completed,
    quizScores,
    user,
    updateUser,
    logout,
    isAuthenticated,
  } = useAppState();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name || "");
  const [editBio, setEditBio] = useState(user.bio || "");
  const [editTrack, setEditTrack] = useState(user.learningTrack || "General Studies");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load fresh profile from database on mount (once)
  useEffect(() => {
    let isMounted = true;
    async function loadFresh() {
      if (!isAuthenticated) return;
      setIsLoadingProfile(true);
      try {
        const fresh = await fetchCurrentUser();
        if (fresh && isMounted) {
          updateUser(fresh);
        }
      } catch (err) {
        console.error("Failed to refresh profile from database:", err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }
    loadFresh();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep edit state in sync with user
  useEffect(() => {
    if (!isEditing) {
      setEditName(user.name || "");
      setEditBio(user.bio || "");
      setEditTrack(user.learningTrack || "General Studies");
    }
  }, [user.name, user.bio, user.learningTrack, isEditing]);

  // Safe calculated statistics
  const enrolled = allCourses.filter((c) => c.enrolled);
  const lessonsDone = Object.values(completed || {}).reduce((n, l) => n + (l?.length || 0), 0);
  const scores = Object.values(quizScores || {});
  const avgAccuracy =
    scores.length > 0
      ? Math.round(scores.reduce((n, s) => n + (s?.best || 0), 0) / scores.length)
      : 82;

  const currentXp = typeof user.xp === "number" ? user.xp : 150;
  const targetXp = typeof user.xpToNext === "number" ? user.xpToNext : 1000;
  const xpPct = Math.min(100, Math.round((currentXp / Math.max(targetXp, 1)) * 100));
  const earned = badges.filter((b) => b.earned);

  const stats = [
    {
      id: "courses",
      label: "Courses enrolled",
      value: String(enrolled.length),
      icon: GraduationCap,
      tint: "text-violet-400",
    },
    {
      id: "lessons",
      label: "Lessons completed",
      value: String(lessonsDone),
      icon: Sparkles,
      tint: "text-blue-400",
    },
    {
      id: "streak",
      label: "Day streak",
      value: `${user.streak || 1} days`,
      icon: Flame,
      tint: "text-orange-400",
    },
    {
      id: "accuracy",
      label: "Quiz accuracy",
      value: `${avgAccuracy}%`,
      icon: Zap,
      tint: "text-emerald-400",
    },
  ];

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Name required", { description: "Please enter your name." });
      return;
    }

    setIsSaving(true);
    try {
      if (isAuthenticated) {
        const updated = await updateUserProfile({
          fullName: editName.trim(),
          bio: editBio.trim(),
          learningTrack: editTrack.trim(),
        });
        updateUser(updated);
      } else {
        updateUser({
          name: editName.trim(),
          firstName: editName.trim().split(" ")[0],
          bio: editBio.trim(),
          learningTrack: editTrack.trim(),
        });
      }
      setIsEditing(false);
      toast.success("Profile updated!", {
        description: "Your changes have been saved to your account.",
      });
    } catch (err: any) {
      toast.error("Failed to update profile", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", { description: "Please select an image file (PNG, JPG, SVG, WebP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Image size must be less than 5MB." });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      if (isAuthenticated) {
        const updated = await uploadUserAvatar(file);
        updateUser(updated);
        toast.success("Avatar updated!", { description: "Your new profile picture has been saved." });
      } else {
        // For guest, preview via local ObjectURL or FileReader
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          updateUser({ avatar: dataUrl });
          toast.success("Avatar updated (preview mode)");
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      toast.error("Avatar upload failed", { description: err.message || "Could not upload image." });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetToDefaultAvatar = async () => {
    try {
      if (isAuthenticated) {
        const updated = await updateUserProfile({ avatar: DEFAULT_NEUTRAL_AVATAR });
        updateUser(updated);
      } else {
        updateUser({ avatar: DEFAULT_NEUTRAL_AVATAR });
      }
      toast.success("Reset to neutral avatar", {
        description: "The clean default profile picture has been restored.",
      });
    } catch (err: any) {
      toast.error("Failed to reset avatar", { description: err.message });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully", {
      description: "You have been logged out of your StudySpace account.",
    });
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Student Profile"
          subtitle={
            isAuthenticated
              ? "Your personal learning identity, credentials and progress."
              : "Guest profile. Sign in to store and sync your progress in the database."
          }
        />
        {!isAuthenticated && (
          <Link
            to="/login"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <LogIn className="size-4" /> Sign In / Register
          </Link>
        )}
      </div>

      {/* Main Identity Card */}
      <div className="overflow-hidden rounded-3xl border border-[#27272a] bg-card shadow-xl animate-fade-up">
        {/* Banner with ambient glowing aura */}
        <div className="relative h-40 bg-gradient-to-r from-violet-800/80 via-purple-700/60 to-blue-600/80">
          <div className="animate-drift absolute -left-10 -top-16 size-48 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="animate-drift absolute -right-6 top-4 size-40 rounded-full bg-blue-500/30 blur-3xl [animation-delay:1.2s]" />

          {/* Quick Refresh Status */}
          {isLoadingProfile && (
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs text-zinc-300 backdrop-blur-md">
              <RefreshCw className="size-3 animate-spin text-violet-400" />
              <span>Syncing with database...</span>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6 pt-2">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar + Info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Avatar with Upload Hover Button */}
              <div className="group relative -mt-16 inline-block">
                <img
                  src={user.avatar || DEFAULT_NEUTRAL_AVATAR}
                  alt={user.name || "Student"}
                  className="size-28 rounded-2xl border-4 border-card bg-[#18152e] object-cover shadow-2xl transition-all duration-300 group-hover:brightness-75"
                  data-testid="profile-avatar"
                />

                {/* Upload overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  aria-label="Change profile picture"
                  className="absolute inset-0 m-auto flex size-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 hover:scale-110 active:scale-95"
                >
                  {isUploadingAvatar ? (
                    <RefreshCw className="size-5 animate-spin" />
                  ) : (
                    <Camera className="size-5" />
                  )}
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-2xl font-bold text-white" data-testid="profile-name">
                    {user.name || "Student"}
                  </h2>
                  <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
                    Level {user.level || 1}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {user.handle || "@student"} &bull; {user.learningTrack || "General Studies"}
                </p>
                {user.bio ? (
                  <p className="mt-1.5 max-w-xl text-xs text-zinc-300 leading-relaxed">{user.bio}</p>
                ) : null}
              </div>
            </div>

            {/* Action Buttons: Edit, Switch, Logout */}
            <div className="flex flex-wrap items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-600/15 px-4 py-2 text-sm font-medium text-violet-200 transition-all hover:bg-violet-600/30 hover:text-white active:scale-95"
                  >
                    <Edit3 className="size-4" /> Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Upload className="size-3.5" /> Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefaultAvatar}
                    title="Reset to clean default neutral avatar"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
                  >
                    Default Avatar
                  </button>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-600/10 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-600/20 hover:text-red-200 active:scale-95"
                    >
                      <LogOut className="size-4" /> Sign Out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-300 transition-all hover:bg-violet-600/30 hover:text-white"
                    >
                      <LogIn className="size-4" /> Sign In
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-violet-500 active:scale-95"
                  >
                    {isSaving ? <RefreshCw className="size-4 animate-spin" /> : <Check className="size-4" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
                  >
                    <X className="size-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Inline Edit Form */}
          {isEditing && (
            <div className="mt-6 rounded-2xl border border-violet-500/30 bg-[#16122c]/50 p-5 backdrop-blur-md animate-fade-up">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Edit3 className="size-4 text-violet-400" /> Edit Profile Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Learning Track / Goal</label>
                  <select
                    value={editTrack}
                    onChange={(e) => setEditTrack(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#1e1b38] px-3.5 py-2 text-sm text-white outline-none focus:border-violet-500"
                  >
                    <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                    <option value="Full-Stack Web Development">Full-Stack Web Development</option>
                    <option value="Computer Science & DSA">Computer Science & DSA</option>
                    <option value="Database & Cloud Systems">Database & Cloud Systems</option>
                    <option value="General Studies">General Studies</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Bio / Notes</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Write a brief note about your goals or university program..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* XP Progress Bar */}
          <div className="mt-6 flex items-center gap-3">
            <ProgressBar value={xpPct} glow />
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {currentXp.toLocaleString()} / {targetXp.toLocaleString()} XP to Level {(user.level || 1) + 1}
            </span>
          </div>

          {/* Metadata Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-zinc-300">
              <Mail className="size-3.5 text-violet-400" /> {user.email || "student@studyspace.app"}
            </span>
            <span>Account created: {user.joined || "November 2026"}</span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-emerald-400">
              {isAuthenticated ? "Database Verified Account" : "Guest Session"}
            </span>
          </div>

          {/* Interests */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(user.interests || []).map((i) => (
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-[#27272a] bg-card p-4 transition-all hover:border-violet-500/30"
              data-testid={`profile-stat-${s.id}`}
            >
              <span className={cn("flex size-9 items-center justify-center rounded-xl bg-[#1f1d2b]", s.tint)}>
                <Icon className="size-4.5" />
              </span>
              <p className="mt-3 font-heading text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Enrolled Courses & Badges */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Enrolled Courses */}
        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="profile-courses">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-white">Enrolled Courses</h3>
            <span className="text-xs text-muted-foreground">{enrolled.length} active</span>
          </div>
          <ul className="space-y-3.5">
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

        {/* Achievements / Badges */}
        <div className="rounded-2xl border border-[#27272a] bg-card p-5" data-testid="profile-achievements">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading flex items-center gap-2 text-sm font-semibold text-white">
              <Award className="size-4 text-amber-400" /> Achievements ({earned.length}/{badges.length})
            </h3>
            <span className="text-xs text-muted-foreground">Level {user.level || 1} Rewards</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {badges.map((b) => (
              <div
                key={b.id}
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
                    b.earned
                      ? "bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-md"
                      : "bg-[#232326] text-zinc-500",
                  )}
                >
                  <Award className="size-4.5" />
                </span>
                <p className="mt-2 text-xs font-semibold text-zinc-100">{b.name}</p>
                <p className="mt-0.5 text-[10px] text-zinc-400 line-clamp-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
