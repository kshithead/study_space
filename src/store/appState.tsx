import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  bookmarkSeed,
  completedSeed,
  quizScoreSeed,
  seedChatSessions,
  user as defaultUser,
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

const defaultGuestUser: UserProfile = {
  id: "guest",
  email: "guest@studyspace.app",
  name: "Guest Student",
  firstName: "Guest",
  avatar: DEFAULT_NEUTRAL_AVATAR,
  bio: "Welcome to StudySpace! Sign in to track your learning journey.",
  learningTrack: "General Studies",
  handle: "@guest.learner",
  streak: 1,
  level: 1,
  levelName: "Explorer",
  xp: 150,
  xpToNext: 1000,
  weeklyGoalHours: 6,
  hoursThisWeek: 1.5,
  joined: "November 2026",
  interests: ["General Studies", "Learning Science", "Problem Solving"],
  authProvider: "local",
};

export function normalizeUser(u: any): UserProfile {
  if (!u) return defaultGuestUser;
  const name = u.name || u.full_name || "Student";
  const firstName = u.firstName || (name ? name.split(" ")[0] : "Student");
  return {
    id: String(u.id || "usr_student"),
    email: u.email || "student@studyspace.app",
    name,
    firstName,
    avatar: u.avatar && u.avatar.trim() ? u.avatar : DEFAULT_NEUTRAL_AVATAR,
    bio: u.bio || "",
    learningTrack: u.learningTrack || u.learning_track || "General Studies",
    handle: u.handle || `@${firstName.toLowerCase()}.learns`,
    streak: typeof u.streak === "number" ? u.streak : 1,
    level: typeof u.level === "number" ? u.level : 1,
    levelName: u.levelName || u.level_name || "Explorer",
    xp: typeof u.xp === "number" ? u.xp : 150,
    xpToNext: typeof u.xpToNext === "number" ? u.xpToNext : 1000,
    hoursThisWeek: typeof u.hoursThisWeek === "number" ? u.hoursThisWeek : 2.5,
    joined: u.joined || "November 2026",
    interests: Array.isArray(u.interests) && u.interests.length > 0 ? u.interests : [u.learningTrack || "General Studies", "Learning Science"],
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

interface AppStateValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
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
  const [bookmarks, setBookmarks] = usePersistentState<string[]>(
    "ss.bookmarks",
    bookmarkSeed,
  );
  const [completed, setCompleted] = usePersistentState<Record<string, string[]>>(
    "ss.completed",
    completedSeed,
  );
  const [notes, setNotes] = usePersistentState<Record<string, string>>(
    "ss.notes",
    {
      "c1-m2-l2":
        "Remember: local sensitivities propagate backwards — check the ledger analogy before the lab.",
    },
  );
  const [chatSessions, setChatSessions] = usePersistentState<ChatSession[]>(
    "ss.chats",
    seedChatSessions,
  );
  const [pomodoroTally, setPomodoroTally] = usePersistentState<{
    date: string;
    count: number;
  }>("ss.pomodoros", { date: todayKey(), count: 2 });
  const [quizScores, setQuizScores] = usePersistentState<
    Record<string, QuizScore>
  >("ss.quizScores", quizScoreSeed);
  const [focusTasks, setFocusTasks] = usePersistentState<FocusTask[]>(
    "ss.focusTasks",
    [
      { id: "ft1", text: "Finish 'Computational Graphs' lesson", done: false },
      { id: "ft2", text: "Review 15 AI flashcards", done: true },
      { id: "ft3", text: "Draft flashcards for optimizer chapter", done: false },
    ],
  );
  const [notificationsRead, setNotificationsRead] = usePersistentState(
    "ss.notifsRead",
    false,
  );
  const [storedUser, setStoredUser] = usePersistentState<any>("ss.user", defaultUser);
  const [user, setUserState] = useState<UserProfile>(() => normalizeUser(storedUser));

  // Sync storedUser changes
  useEffect(() => {
    setUserState(normalizeUser(storedUser));
  }, [storedUser]);

  // On initial mount, fetch current authenticated user from backend if token exists
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
    return Boolean(authStorage.getToken() && user && user.id !== "guest");
  }, [user]);

  const login = useCallback(
    (profile: Partial<UserProfile>) => {
      const norm = normalizeUser({ ...user, ...profile });
      setUserState(norm);
      setStoredUser(norm);
    },
    [user, setStoredUser],
  );

  const logout = useCallback(() => {
    authStorage.removeToken();
    const guest = normalizeUser(defaultGuestUser);
    setUserState(guest);
    setStoredUser(guest);
  }, [setStoredUser]);

  const updateUser = useCallback(
    (updates: Partial<UserProfile>) => {
      const norm = normalizeUser({ ...user, ...updates });
      setUserState(norm);
      setStoredUser(norm);
    },
    [user, setStoredUser],
  );

  const toggleSidebar = useCallback(
    () => setSidebarCollapsed((v) => !v),
    [setSidebarCollapsed],
  );

  const toggleBookmark = useCallback(
    (courseId: string) =>
      setBookmarks((prev) =>
        prev.includes(courseId)
          ? prev.filter((id) => id !== courseId)
          : [...prev, courseId],
      ),
    [setBookmarks],
  );

  const markLesson = useCallback(
    (courseId: string, lessonId: string, done: boolean) =>
      setCompleted((prev) => {
        const list = prev[courseId] ?? [];
        return {
          ...prev,
          [courseId]: done
            ? list.includes(lessonId)
              ? list
              : [...list, lessonId]
            : list.filter((id) => id !== lessonId),
        };
      }),
    [setCompleted],
  );

  const toggleLesson = useCallback(
    (courseId: string, lessonId: string) =>
      setCompleted((prev) => {
        const list = prev[courseId] ?? [];
        const done = !list.includes(lessonId);
        return {
          ...prev,
          [courseId]: done
            ? [...list, lessonId]
            : list.filter((id) => id !== lessonId),
        };
      }),
    [setCompleted],
  );

  const courseProgress = useCallback(
    (courseId: string) => {
      const course = getCourse(courseId);
      if (!course) return 0;
      const total = courseLessons(course).length;
      if (total === 0) return 0;
      return Math.round(((completed[courseId] ?? []).length / total) * 100);
    },
    [completed],
  );

  const setNote = useCallback(
    (lessonId: string, text: string) =>
      setNotes((prev) => ({ ...prev, [lessonId]: text })),
    [setNotes],
  );

  const upsertChatSession = useCallback(
    (session: ChatSession) =>
      setChatSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === session.id);
        if (idx === -1) return [session, ...prev];
        const next = [...prev];
        next[idx] = session;
        return next;
      }),
    [setChatSessions],
  );

  const deleteChatSession = useCallback(
    (id: string) =>
      setChatSessions((prev) => prev.filter((s) => s.id !== id)),
    [setChatSessions],
  );

  const incrementPomodoros = useCallback(
    () =>
      setPomodoroTally((prev) =>
        prev.date === todayKey()
          ? { ...prev, count: prev.count + 1 }
          : { date: todayKey(), count: 1 },
      ),
    [setPomodoroTally],
  );

  const recordQuizScore = useCallback(
    (quizId: string, pct: number) =>
      setQuizScores((prev) => {
        const cur = prev[quizId];
        return {
          ...prev,
          [quizId]: {
            best: Math.max(cur?.best ?? 0, pct),
            attempts: (cur?.attempts ?? 0) + 1,
          },
        };
      }),
    [setQuizScores],
  );

  const addFocusTask = useCallback(
    (text: string) =>
      setFocusTasks((prev) => [
        ...prev,
        { id: `ft-${Date.now()}`, text, done: false },
      ]),
    [setFocusTasks],
  );

  const toggleFocusTask = useCallback(
    (id: string) =>
      setFocusTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      ),
    [setFocusTasks],
  );

  const removeFocusTask = useCallback(
    (id: string) => setFocusTasks((prev) => prev.filter((t) => t.id !== id)),
    [setFocusTasks],
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
      bookmarks,
      toggleBookmark,
      completed,
      toggleLesson,
      markLesson,
      courseProgress,
      notes,
      setNote,
      chatSessions,
      upsertChatSession,
      deleteChatSession,
      pomodorosToday:
        pomodoroTally.date === todayKey() ? pomodoroTally.count : 0,
      incrementPomodoros,
      quizScores,
      recordQuizScore,
      focusTasks,
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
      bookmarks,
      toggleBookmark,
      completed,
      toggleLesson,
      markLesson,
      courseProgress,
      notes,
      setNote,
      chatSessions,
      upsertChatSession,
      deleteChatSession,
      pomodoroTally,
      incrementPomodoros,
      quizScores,
      recordQuizScore,
      focusTasks,
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
