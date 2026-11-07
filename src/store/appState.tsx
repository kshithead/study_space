import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import {
  bookmarkSeed,
  completedSeed,
  quizScoreSeed,
  seedChatSessions,
} from "@/data/mockData";
import type { ChatSession } from "@/data/mockData";
import { usePersistentState } from "@/hooks/usePersistentState";
import { getCourse, courseLessons } from "@/data/mockData";

export interface FocusTask {
  id: string;
  text: string;
  done: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  avatar?: string;
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
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
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
}

const AppStateContext = createContext<AppStateValue | null>(null);

const todayKey = () => new Date().toISOString().slice(0, 10);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = usePersistentState<AuthUser | null>("ss.auth.user", {
    id: "u-1",
    name: "Kshitij Rathod",
    email: "kshitij@vu.edu.in",
    studentId: "3124045020169",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=200&h=200",
  });

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

  const login = useCallback(
    (userData: AuthUser) => setUser(userData),
    [setUser],
  );

  const logout = useCallback(
    () => setUser(null),
    [setUser],
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
      user,
      login,
      logout,
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
    }),
    [
      user,
      login,
      logout,
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
