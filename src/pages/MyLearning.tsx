import { Link } from "react-router-dom";
import { Bookmark, GraduationCap, PlayCircle } from "lucide-react";
import { allCourses } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState, PageHeader, ProgressBar } from "@/components/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function MyLearning() {
  const { bookmarks, courseProgress, completed } = useAppState();

  const enrolled = allCourses.filter((c) => c.enrolled);
  const inProgress = enrolled.filter((c) => courseProgress(c.id) < 100);
  const finished = enrolled.filter((c) => courseProgress(c.id) >= 100);
  const saved = allCourses.filter((c) => bookmarks.includes(c.id));
  const lessonsDone = Object.values(completed).reduce((n, list) => n + list.length, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Learning"
        subtitle={`${enrolled.length} enrolled courses · ${lessonsDone} lessons completed · progress lives in your browser`}
      />

      <Tabs defaultValue="progress">
        <TabsList className="bg-[#1b1b1e]">
          <TabsTrigger value="progress" data-testid="my-learning-tab-progress">
            In progress ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="my-learning-tab-completed">
            Completed ({finished.length})
          </TabsTrigger>
          <TabsTrigger value="saved" data-testid="my-learning-tab-saved">
            Saved ({saved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          {inProgress.length === 0 ? (
            <EmptyState
              testId="my-learning-empty-progress"
              icon={<GraduationCap className="size-6" />}
              title="Nothing in progress"
              body="Enroll in any course from Explore and it will appear here with live progress."
            />
          ) : (
            <div className="space-y-3">
              {inProgress.map((c) => (
                <div
                  key={c.id}
                  data-testid={`my-learning-row-${c.id}`}
                  className="flex flex-col gap-4 rounded-2xl border border-[#27272a] bg-card p-4 transition-colors hover:border-violet-600/40 sm:flex-row sm:items-center"
                >
                  <Link
                    to={`/course/${c.id}`}
                    className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-44"
                  >
                    <img src={c.thumbnail} alt="" className="size-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                      <PlayCircle className="size-7 text-white" />
                    </span>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading line-clamp-1 font-semibold">{c.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.instructor} · {c.totalDuration}
                    </p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <ProgressBar value={courseProgress(c.id)} glow />
                      <span className="shrink-0 text-xs font-semibold text-violet-300">
                        {courseProgress(c.id)}%
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/course/${c.id}`}
                    data-testid={`my-learning-continue-${c.id}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  >
                    Continue
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {finished.length === 0 ? (
            <EmptyState
              testId="my-learning-empty-completed"
              icon={<GraduationCap className="size-6" />}
              title="No finished courses yet"
              body="Your first certificate is one syllabus away — keep going!"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {finished.map((c) => (
                <div key={c.id} className="relative">
                  <CourseCard course={c} />
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white">
                    Completed · 100%
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          {saved.length === 0 ? (
            <EmptyState
              testId="my-learning-empty-saved"
              icon={<Bookmark className="size-6" />}
              title="No saved courses"
              body="Bookmark anything from the catalog with the ribbon icon — it lands here and on the Bookmarks page."
            >
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Explore courses
              </Link>
            </EmptyState>
          ) : (
            <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3")}>
              {saved.map((c) => (
                <CourseCard key={c.id} course={c} showProgress={c.enrolled} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
