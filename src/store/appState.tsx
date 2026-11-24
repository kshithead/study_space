import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  bookmarkSeed,
  completedSeed,
  quizScoreSeed,
} from "@/data/mockData";
import type { ChatSession } from "@/data/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";
import { getCourse, courseLessons } from "@/data/mockData";
import {
  UserProfile,
  DEFAULT_NEUTRAL_AVATAR,
  authStorage,
  fetchCurrentUser,
} from "@/services/auth";

export type { UserProfile };

export const defaultGuestUser: UserProfile = {
  id: "guest",
  email: "",
  name: "Guest",
  firstName: "Guest",
  avatar: DEFAULT_NEUTRAL_AVATAR,
  bio: "Welcome to StudySpace! Sign in to track your learning journey.",
  learningTrack: "General Studies",
  handle: "@learner",
  streak: 0,
  level: 1,
  levelName: "Explorer",
  xp: 0,
  xpToNext: 1000,
  weeklyGoalHours: 6,
  hoursThisWeek: 0,
  joined: "November 2026",
  interests: ["Learning Science", "Problem Solving"],
  authProvider: "local",
};

export function normalizeUser(u: any): UserProfile {
  if (!u || u.id === "guest" || u.id === "usr_demo_alex" || u.email === "alex.carter@studyspace.app") {
    return defaultGuestUser;
  }
  const name = u.name || u.full_name || "Student";
  const firstName = u.firstName || (name ? name.split(" ")[0] : "Student");
  return {
    id: String(u.id || "usr_student"),
    email: u.email || "",
    name,
    firstName,
    avatar: u.avatar && u.avatar.trim() ? u.avatar : DEFAULT_NEUTRAL_AVATAR,
    bio: u.bio || "",
    learningTrack: u.learningTrack || u.learning_track || "General Studies",
    handle: u.handle || `@${firstName.toLowerCase()}.learns`,
    streak: typeof u.streak === "number" ? u.streak : 0,
    level: typeof u.level === "number" ? u.level : 1,
    levelName: u.levelName || u.level_name || "Explorer",
    xp: typeof u.xp === "number" ? u.xp : 0,
    xpToNext: typeof u.xpToNext === "number" ? u.xpToNext : 1000,
    weeklyGoalHours: typeof u.weeklyGoalHours === "number" ? u.weeklyGoalHours : 6,
    hoursThisWeek: typeof u.hoursThisWeek === "number" ? u.hoursThisWeek : 0,
    joined: u.joined || "November 2026",
    interests:
      Array.isArray(u.interests) && u.interests.length > 0
        ? u.interests
        : [u.learningTrack || "General Studies", "Learning Science"],
    authProvider: u.authProvider || u.auth_provider || "local",
  };
}

export interface FocusTask {
  id: string;
  text: string;
  done: boolean;
}

interface QuizScore {
  best: number;
  attempts: number;
}

export interface UserProgressData {
  enrolledCourses: string[];
  completed: Record<string, string[]>;
  bookmarks: string[];
  quizScores: Record<string, QuizScore>;
  notes: Record<string, string>;
  focusTasks: FocusTask[];
}

const BLANK_PROGRESS: UserProgressData = {
  enrolledCourses: [],
  completed: {},
  bookmarks: [],
  quizScores: {},
  notes: {},
  focusTasks: [
    { id: "ft1", text: "Explore the course catalog and start your first lesson", done: false },
    { id: "ft2", text: "Ask Socrates AI Tutor a question about your course materials", done: false },
  ],
};

function getUserProgressKey(userId?: string): string {
  return `ss.progress_v3.${userId || "guest"}`;
}

function getUserChatKey(userId?: string): string {
  return `ss.chats_v2.${userId || "guest"}`;
}

function loadUserChatSessions(userId?: string, _email?: string): ChatSession[] {
  if (!userId || userId === "guest") return [];
  const key = getUserChatKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse chats for user", userId, e);
  }
  return [];
}

function getUserPomodoroKey(userId?: string): string {
  return `ss.pomodoros_v2.${userId || "guest"}`;
}

function loadUserPomodoro(userId?: string): { date: string; count: number } {
  const key = getUserPomodoroKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.date === todayKey()) return data;
    }
  } catch (e) {
    // ignore
  }
  return { date: todayKey(), count: 0 };
}

function loadUserProgress(userId?: string, _email?: string): UserProgressData {
  if (!userId || userId === "guest") return BLANK_PROGRESS;
  const key = getUserProgressKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse progress for user", userId, e);
  }
  return BLANK_PROGRESS;
}

interface AppStateValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  enrolledCourses: string[];
  isEnrolled: (courseId: string) => boolean;
  enrollCourse: (courseId: string) => void;
  unenrollCourse: (courseId: string) => void;
  bookmarks: string[];
  toggleBookmark: (courseId: string) => void;
  completed: Record<string, string[]>;
  toggleLesson: (courseId: string, lessonId: string) => void;
  markLesson: (courseId: string, lessonId: string, done: boolean) => void;
  courseProgress: (courseId: string) => number;
  notes: Record<string, string>;
  setNote: (lessonId: string, text: string) => void;
  chatSessions: ChatSession[];
  upsertChatSession: (session: ChatSession) => void;
  deleteChatSession: (id: string) => void;
  pomodorosToday: number;
  incrementPomodoros: () => void;
  quizScores: Record<string, QuizScore>;
  recordQuizScore: (quizId: string, pct: number) => void;
  focusTasks: FocusTask[];
  addFocusTask: (text: string) => void;
  toggleFocusTask: (id: string) => void;
  removeFocusTask: (id: string) => void;
  notificationsRead: boolean;
  markNotificationsRead: () => void;
  user: UserProfile;
  isAuthenticated: boolean;
  login: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

const todayKey = () => new Date().toISOString().slice(0, 10);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState(
    "ss.sidebar.collapsed",
    false,
  );
  const [mobileNavOpen, setMobileNavOpen] = usePersistentState(
    "ss.mobileNav.open",
    false,
  );
  // Authenticated user state - defaults to null for clean guest session
  const [storedUser, setStoredUser] = usePersistentState<any>("ss.user", null);
  const [user, setUserState] = useState<UserProfile>(() => normalizeUser(storedUser));

  // User-scoped AI chat sessions (strictly isolated per user account)
  const [chatSessions, setChatSessionsState] = useState<ChatSession[]>(() =>
    loadUserChatSessions(user.id, user.email)
  );

  // User-scoped pomodoro tally
  const [pomodoroTally, setPomodoroTallyState] = useState<{ date: string; count: number }>(() =>
    loadUserPomodoro(user.id)
  );

  const [notificationsRead, setNotificationsRead] = usePersistentState(
    "ss.notifsRead",
    false,
  );

  // User-scoped progress state (strictly isolated per user account)
  const [userProgress, setUserProgress] = useState<UserProgressData>(() =>
    loadUserProgress(user.id, user.email)
  );

  // Sync storedUser changes & immediately purge legacy demo account
  useEffect(() => {
    if (
      storedUser &&
      (storedUser.id === "usr_demo_alex" || storedUser.email === "alex.carter@studyspace.app")
    ) {
      setStoredUser(null);
      try {
        localStorage.removeItem("ss.user");
      } catch {}
      setUserState(defaultGuestUser);
      return;
    }
    setUserState(normalizeUser(storedUser));
  }, [storedUser, setStoredUser]);

  // When active user ID or email changes, switch immediately to their isolated progress, chats, and pomodoros
  useEffect(() => {
    setUserProgress(loadUserProgress(user.id, user.email));
    setChatSessionsState(loadUserChatSessions(user.id, user.email));
    setPomodoroTallyState(loadUserPomodoro(user.id));
  }, [user.id, user.email]);

  // Helper to persist user-scoped progress changes
  const saveUserProgress = useCallback(
    (updater: (prev: UserProgressData) => UserProgressData) => {
      setUserProgress((prev) => {
        const next = updater(prev);
        const key = getUserProgressKey(user.id);
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.error("Failed to save progress for user:", user.id, e);
        }
        return next;
      });
    },
    [user.id]
  );

  // On initial mount, fetch current authenticated user from backend/supabase
  useEffect(() => {
    let isMounted = true;
    async function loadAuth() {
      const token = authStorage.getToken();
      if (!token) return;
      try {
        const remoteUser = await fetchCurrentUser();
        if (remoteUser && isMounted) {
          const norm = normalizeUser(remoteUser);
          setUserState(norm);
          setStoredUser(norm);
        }
      } catch (err) {
        console.error("Failed to fetch current user profile:", err);
      }
    }
    loadAuth();
    return () => {
      isMounted = false;
    };
  }, [setStoredUser]);

  const isAuthenticated = useMemo(() => {
    return Boolean(
      authStorage.getToken() &&
        user &&
        user.id !== "guest" &&
        user.id !== "usr_demo_alex"
    );
  }, [user]);

  const login = useCallback(
    (profile: Partial<UserProfile>) => {
      setUserState((prev) => {
        const norm = normalizeUser({ ...prev, ...profile });
        setStoredUser(norm);
        return norm;
      });
    },
    [setStoredUser],
  );

  const logout = useCallback(() => {
    authStorage.removeToken();
    const guest = normalizeUser(defaultGuestUser);
    setUserState(guest);
    setStoredUser(guest);
  }, [setStoredUser]);

  const updateUser = useCallback(
    (updates: Partial<UserProfile>) => {
      setUserState((prev) => {
        const norm = normalizeUser({ ...prev, ...updates });
        setStoredUser(norm);
        return norm;
      });
    },
    [setStoredUser],
  );

  const toggleSidebar = useCallback(
    () => setSidebarCollapsed((v) => !v),
    [setSidebarCollapsed],
  );

  // Course Enrollment
  const isEnrolled = useCallback(
    (courseId: string) => {
      return (
        userProgress.enrolledCourses.includes(courseId) ||
        (userProgress.completed[courseId] ?? []).length > 0
      );
    },
    [userProgress.enrolledCourses, userProgress.completed]
  );

  const enrollCourse = useCallback(
    (courseId: string) => {
      saveUserProgress((prev) => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.includes(courseId)
          ? prev.enrolledCourses
          : [...prev.enrolledCourses, courseId],
      }));
    },
    [saveUserProgress]
  );

  const unenrollCourse = useCallback(
    (courseId: string) => {
      saveUserProgress((prev) => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.filter((id) => id !== courseId),
      }));
    },
    [saveUserProgress]
  );

  // Bookmarks
  const toggleBookmark = useCallback(
    (courseId: string) => {
      saveUserProgress((prev) => ({
        ...prev,
        bookmarks: prev.bookmarks.includes(courseId)
          ? prev.bookmarks.filter((id) => id !== courseId)
          : [...prev.bookmarks, courseId],
      }));
    },
    [saveUserProgress]
  );

  // Lessons Completion & XP Rewards
  const markLesson = useCallback(
    (courseId: string, lessonId: string, done: boolean) => {
      saveUserProgress((prev) => {
        const list = prev.completed[courseId] ?? [];
        const updatedList = done
          ? list.includes(lessonId)
            ? list
            : [...list, lessonId]
          : list.filter((id) => id !== lessonId);

        const enrolled = prev.enrolledCourses.includes(courseId)
          ? prev.enrolledCourses
          : [...prev.enrolledCourses, courseId];

        return {
          ...prev,
          enrolledCourses: enrolled,
          completed: {
            ...prev.completed,
            [courseId]: updatedList,
          },
        };
      });

      // Reward XP (+50 XP per lesson finished)
      if (done) {
        updateUser({ xp: (user.xp || 150) + 50 });
      }
    },
    [saveUserProgress, updateUser, user.xp]
  );

  const toggleLesson = useCallback(
    (courseId: string, lessonId: string) => {
      const isDone = (userProgress.completed[courseId] ?? []).includes(lessonId);
      markLesson(courseId, lessonId, !isDone);
    },
    [userProgress.completed, markLesson]
  );

  const courseProgress = useCallback(
    (courseId: string) => {
      const course = getCourse(courseId);
      if (!course) return 0;
      const total = courseLessons(course).length;
      if (total === 0) return 0;
      const doneCount = (userProgress.completed[courseId] ?? []).length;
      return Math.min(100, Math.round((doneCount / total) * 100));
    },
    [userProgress.completed]
  );

  const setNote = useCallback(
    (lessonId: string, text: string) => {
      saveUserProgress((prev) => ({
        ...prev,
        notes: { ...prev.notes, [lessonId]: text },
      }));
    },
    [saveUserProgress]
  );

  const upsertChatSession = useCallback(
    (session: ChatSession) => {
      setChatSessionsState((prev) => {
        const idx = prev.findIndex((s) => s.id === session.id);
        const next = idx === -1 ? [session, ...prev] : [...prev];
        if (idx !== -1) next[idx] = session;
        const key = getUserChatKey(user.id);
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.error("Failed to save chat sessions for user:", user.id, e);
        }
        return next;
      });
    },
    [user.id]
  );

  const deleteChatSession = useCallback(
    (id: string) => {
      setChatSessionsState((prev) => {
        const next = prev.filter((s) => s.id !== id);
        const key = getUserChatKey(user.id);
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.error("Failed to delete chat session for user:", user.id, e);
        }
        return next;
      });
    },
    [user.id]
  );

  const incrementPomodoros = useCallback(() => {
    setPomodoroTallyState((prev) => {
      const next =
        prev.date === todayKey()
          ? { ...prev, count: prev.count + 1 }
          : { date: todayKey(), count: 1 };
      const key = getUserPomodoroKey(user.id);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, [user.id]);

  const recordQuizScore = useCallback(
    (quizId: string, pct: number) => {
      saveUserProgress((prev) => {
        const cur = prev.quizScores[quizId];
        return {
          ...prev,
          quizScores: {
            ...prev.quizScores,
            [quizId]: {
              best: Math.max(cur?.best ?? 0, pct),
              attempts: (cur?.attempts ?? 0) + 1,
            },
          },
        };
      });
    },
    [saveUserProgress]
  );

  const addFocusTask = useCallback(
    (text: string) =>
      saveUserProgress((prev) => ({
        ...prev,
        focusTasks: [...prev.focusTasks, { id: `ft-${Date.now()}`, text, done: false }],
      })),
    [saveUserProgress]
  );

  const toggleFocusTask = useCallback(
    (id: string) =>
      saveUserProgress((prev) => ({
        ...prev,
        focusTasks: prev.focusTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      })),
    [saveUserProgress]
  );

  const removeFocusTask = useCallback(
    (id: string) =>
      saveUserProgress((prev) => ({
        ...prev,
        focusTasks: prev.focusTasks.filter((t) => t.id !== id),
      })),
    [saveUserProgress]
  );

  const markNotificationsRead = useCallback(
    () => setNotificationsRead(true),
    [setNotificationsRead],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
      enrolledCourses: userProgress.enrolledCourses,
      isEnrolled,
      enrollCourse,
      unenrollCourse,
      bookmarks: userProgress.bookmarks,
      toggleBookmark,
      completed: userProgress.completed,
      toggleLesson,
      markLesson,
      courseProgress,
      notes: userProgress.notes,
      setNote,
      chatSessions,
      upsertChatSession,
      deleteChatSession,
      pomodorosToday:
        pomodoroTally.date === todayKey() ? pomodoroTally.count : 0,
      incrementPomodoros,
      quizScores: userProgress.quizScores,
      recordQuizScore,
      focusTasks: userProgress.focusTasks,
      addFocusTask,
      toggleFocusTask,
      removeFocusTask,
      notificationsRead,
      markNotificationsRead,
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
    }),
    [
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      userProgress.enrolledCourses,
      isEnrolled,
      enrollCourse,
      unenrollCourse,
      userProgress.bookmarks,
      toggleBookmark,
      userProgress.completed,
      toggleLesson,
      markLesson,
      courseProgress,
      userProgress.notes,
      setNote,
      chatSessions,
      upsertChatSession,
      deleteChatSession,
      pomodoroTally,
      incrementPomodoros,
      userProgress.quizScores,
      recordQuizScore,
      userProgress.focusTasks,
      addFocusTask,
      toggleFocusTask,
      removeFocusTask,
      notificationsRead,
      markNotificationsRead,
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
