import { allCourses, courseLessons } from "@/data/mockData";
import type { ChatSession } from "@/data/mockData";
import type { UserProfile } from "@/store/appState";

export interface DynamicBadge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  earned: boolean;
  progressText: string;
}

export interface SkillRadarItem {
  skill: string;
  score: number;
}

export interface WeeklyStudyDay {
  day: string;
  hours: number;
}

export interface RecentActivityItem {
  id: string;
  text: string;
  time: string;
  type: "lesson" | "quiz" | "chat" | "account" | "enroll";
}

interface ComputeAnalyticsParams {
  user: UserProfile;
  completed: Record<string, string[]>;
  quizScores: Record<string, { best: number; attempts: number }>;
  enrolledCourses: string[];
  chatSessions: ChatSession[];
  pomodorosToday?: number;
}

export function computeUserBadges(params: ComputeAnalyticsParams): DynamicBadge[] {
  const { user, completed, quizScores, enrolledCourses, chatSessions, pomodorosToday = 0 } = params;

  const totalLessonsDone = Object.values(completed).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );

  const scoresList = Object.values(quizScores);
  const maxScore = scoresList.reduce((max, s) => Math.max(max, s.best), 0);
  const hasHighScoreQuiz = scoresList.some((s) => s.best >= 80);

  // Check if any course is 100% complete
  const hasCourseFinished = enrolledCourses.some((cId) => {
    const course = allCourses.find((c) => c.id === cId);
    if (!course) return false;
    const allL = courseLessons(course);
    if (allL.length === 0) return false;
    const doneL = completed[cId] ?? [];
    return doneL.length >= allL.length;
  });

  const streak = typeof user.streak === "number" ? user.streak : 1;
  const chatCount = chatSessions.length;

  return [
    {
      id: "b1",
      name: "Streak Master",
      desc: "Maintain a 3+ day active study streak",
      icon: "flame",
      earned: streak >= 3,
      progressText: streak >= 3 ? "Unlocked!" : `${streak}/3 days`,
    },
    {
      id: "b2",
      name: "First Step",
      desc: "Complete your first lesson in any course",
      icon: "flag",
      earned: totalLessonsDone >= 1,
      progressText: totalLessonsDone >= 1 ? "Unlocked!" : "0/1 lessons",
    },
    {
      id: "b3",
      name: "Curious Scholar",
      desc: "Ask Socrates AI Tutor a question",
      icon: "cards",
      earned: chatCount >= 1,
      progressText: chatCount >= 1 ? "Unlocked!" : "0/1 questions",
    },
    {
      id: "b4",
      name: "Quiz Sniper",
      desc: "Score 80%+ on any checkpoint quiz",
      icon: "target",
      earned: hasHighScoreQuiz,
      progressText: hasHighScoreQuiz
        ? "Unlocked!"
        : scoresList.length > 0
        ? `Best: ${maxScore}% (need 80%)`
        : "No quizzes taken",
    },
    {
      id: "b5",
      name: "Deep Diver",
      desc: "Complete 10 lessons across your curriculum",
      icon: "dive",
      earned: totalLessonsDone >= 10,
      progressText: totalLessonsDone >= 10 ? "Unlocked!" : `${totalLessonsDone}/10 lessons`,
    },
    {
      id: "b6",
      name: "Focus Monk",
      desc: "Complete at least one Pomodoro session",
      icon: "monk",
      earned: pomodorosToday >= 1,
      progressText: pomodorosToday >= 1 ? "Unlocked!" : "0/1 sessions",
    },
    {
      id: "b7",
      name: "Course Finisher",
      desc: "Complete 100% of an enrolled course",
      icon: "award",
      earned: hasCourseFinished,
      progressText: hasCourseFinished ? "Unlocked!" : "0/1 courses",
    },
  ];
}

export function computeSkillDistribution(
  completed: Record<string, string[]>,
  quizScores: Record<string, { best: number }>
): SkillRadarItem[] {
  const domains = [
    {
      skill: "Python",
      matchWords: ["python", "variables", "oop"],
      courseId: "c-python",
    },
    {
      skill: "AI & ML",
      matchWords: ["neural", "learning", "gradient", "backprop"],
      courseId: "c1",
    },
    {
      skill: "Web Dev",
      matchWords: ["react", "web", "frontend", "hooks", "javascript"],
      courseId: "c2",
    },
    {
      skill: "Algorithms",
      matchWords: ["structures", "search", "sorting", "complexity", "graph"],
      courseId: "c3",
    },
    {
      skill: "Databases",
      matchWords: ["database", "sql", "postgres", "queries", "cloud"],
      courseId: "c10",
    },
  ];

  return domains.map((d) => {
    // Count lessons done in matching course or matching titles
    const doneInCourse = (completed[d.courseId] ?? []).length;
    let quizBonus = 0;
    for (const [qId, q] of Object.entries(quizScores)) {
      if (qId.toLowerCase().includes(d.skill.toLowerCase()) || qId.includes(d.courseId)) {
        quizBonus = Math.max(quizBonus, Math.round(q.best * 0.4));
      }
    }

    // Baseline 10% + 15% per lesson done + quiz bonus, capped at 100
    const rawScore = 10 + doneInCourse * 18 + quizBonus;
    return {
      skill: d.skill,
      score: Math.min(100, rawScore),
    };
  });
}

export function computeWeeklyHours(
  totalLessonsDone: number,
  pomodorosToday: number = 0,
  userHours: number = 0
): WeeklyStudyDay[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  // Monday is index 0
  const jsDay = now.getDay();
  const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;

  // Real calculated study time
  const realHours = Math.round((totalLessonsDone * 0.35 + pomodorosToday * 0.42) * 10) / 10;
  const hoursToDistribute = Math.max(realHours, userHours);

  if (hoursToDistribute <= 0) {
    return days.map((day) => ({ day, hours: 0 }));
  }

  // Allocate across active days up to currentDayIndex
  const activeDaysCount = currentDayIndex + 1;
  const perDay = Math.round((hoursToDistribute / activeDaysCount) * 10) / 10;

  return days.map((day, idx) => {
    if (idx > currentDayIndex) {
      return { day, hours: 0 }; // future days in week
    }
    if (idx === currentDayIndex) {
      // remainder for today
      const previousTotal = perDay * (activeDaysCount - 1);
      const todayHours = Math.max(0.1, Math.round((hoursToDistribute - previousTotal) * 10) / 10);
      return { day, hours: todayHours };
    }
    return { day, hours: Math.max(0.1, perDay) };
  });
}

export function computeRecentActivities(params: ComputeAnalyticsParams): RecentActivityItem[] {
  const { user, completed, quizScores, enrolledCourses, chatSessions } = params;
  const items: RecentActivityItem[] = [];

  // 1. AI Tutor sessions
  chatSessions.slice(0, 3).forEach((s) => {
    items.push({
      id: `act-chat-${s.id}`,
      text: `Asked Socrates AI: "${s.title.slice(0, 48)}"`,
      time: new Date(s.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      type: "chat",
    });
  });

  // 2. Completed lessons
  for (const [courseId, lessonIds] of Object.entries(completed)) {
    if (!lessonIds || lessonIds.length === 0) continue;
    const course = allCourses.find((c) => c.id === courseId);
    const lastLessonId = lessonIds[lessonIds.length - 1];
    const lessonObj = course ? courseLessons(course).find((l) => l.id === lastLessonId) : null;
    const lessonTitle = lessonObj?.title || `Lesson in ${course?.title || courseId}`;
    items.push({
      id: `act-lesson-${lastLessonId}`,
      text: `Completed "${lessonTitle}"`,
      time: "Recent",
      type: "lesson",
    });
  }

  // 3. Quiz scores
  for (const [qId, q] of Object.entries(quizScores)) {
    items.push({
      id: `act-quiz-${qId}`,
      text: `Scored ${q.best}% on checkpoint quiz (${qId})`,
      time: `${q.attempts} attempt${q.attempts > 1 ? "s" : ""}`,
      type: "quiz",
    });
  }

  // 4. Course enrollments
  enrolledCourses.slice(0, 2).forEach((cId) => {
    const course = allCourses.find((c) => c.id === cId);
    if (course) {
      items.push({
        id: `act-enroll-${cId}`,
        text: `Enrolled in "${course.title}"`,
        time: "Active",
        type: "enroll",
      });
    }
  });

  // 5. Account created milestone
  items.push({
    id: "act-account",
    text: `StudySpace account active for ${user.firstName || user.name}`,
    time: user.joined || "November 2026",
    type: "account",
  });

  return items.slice(0, 6);
}
