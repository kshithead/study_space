import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Clock, Play, Star, Users } from "lucide-react";
import type { Course } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { ProgressBar } from "@/components/shared";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CourseCard({
  course,
  showProgress,
}: {
  course: Course;
  showProgress?: boolean;
}) {
  const { bookmarks, toggleBookmark, courseProgress, isEnrolled } = useAppState();
  const saved = bookmarks.includes(course.id);
  const enrolled = isEnrolled(course.id);
  const progress = courseProgress(course.id);
  const shouldShowProgress = showProgress !== undefined ? showProgress : enrolled;

  return (
    <Link
      to={`/course/${course.id}`}
      data-testid={`course-card-${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#27272a] bg-card transition-all duration-300 hover:-translate-y-1 hover:border-violet-600/50 hover:shadow-[0_12px_36px_rgba(109,40,217,0.18)]"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-violet-600/90 text-white shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-zinc-100 backdrop-blur">
          <Clock className="size-3" />
          {course.totalDuration}
        </span>
        <button
          type="button"
          data-testid={`bookmark-btn-${course.id}`}
          aria-label={saved ? "Remove bookmark" : "Bookmark course"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(course.id);
            toast(saved ? "Removed from bookmarks" : "Saved to bookmarks", {
              description: course.title,
            });
          }}
          className={cn(
            "absolute right-2 top-2 flex size-8 items-center justify-center rounded-full backdrop-blur transition-all active:scale-90",
            saved
              ? "bg-violet-600 text-white"
              : "bg-black/60 text-zinc-200 hover:bg-black/80",
          )}
        >
          {saved ? (
            <BookmarkCheck className="size-4" />
          ) : (
            <Bookmark className="size-4" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="font-heading line-clamp-2 text-[15px] font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-white">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {course.instructor} · {course.instructorTitle}
        </p>
        <div className="mt-auto flex items-center gap-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-amber-400">
            <Star className="size-3.5 fill-current" />
            {course.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {course.students}
          </span>
          <span className="ml-auto rounded-full bg-[#232326] px-2 py-0.5 text-[11px] font-medium text-zinc-300">
            {course.level}
          </span>
        </div>
        {shouldShowProgress && (enrolled || progress > 0) ? (
          <div className="mt-1 flex items-center gap-2">
            <ProgressBar value={progress} className="h-1" />
            <span className="shrink-0 text-[11px] font-medium text-violet-300">
              {progress}%
            </span>
          </div>
        ) : (
          <div className="mt-1.5 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-violet-400 group-hover:text-violet-300">
              <Play className="size-3 fill-current" /> Watch Lectures
            </span>
            <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
              Add to My Learning &rarr;
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
