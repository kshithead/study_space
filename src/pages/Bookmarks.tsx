import { Bookmark } from "lucide-react";
import { allCourses } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState, PageHeader } from "@/components/shared";
import { Link } from "react-router-dom";

export default function Bookmarks() {
  const { bookmarks, isEnrolled } = useAppState();
  const saved = allCourses.filter((c) => bookmarks.includes(c.id));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bookmarks"
        subtitle="Courses you saved — bookmarks persist in this browser via local storage"
      />
      {saved.length === 0 ? (
        <EmptyState
          testId="bookmarks-empty"
          icon={<Bookmark className="size-6" />}
          title="No bookmarks yet"
          body="Tap the ribbon icon on any course card to save it here for later."
        >
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Explore courses
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((c) => (
            <CourseCard key={c.id} course={c} showProgress={isEnrolled(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
