import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { allCourses } from "@/data/mockData";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState } from "@/components/shared";
import { useAppState } from "@/store/appState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const parseStudents = (s: string) =>
  s.endsWith("k") ? parseFloat(s) * 1000 : parseFloat(s);

const categories = ["All Topics", ...new Set(allCourses.map((c) => c.category))];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const sortOptions: Record<string, string> = {
  popular: "Most popular",
  rating: "Highest rated",
  az: "A – Z",
};

export default function Explore() {
  const { isEnrolled } = useAppState();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [category, setCategory] = useState("All Topics");
  const [level, setLevel] = useState("All Levels");
  const [sort, setSort] = useState("popular");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = allCourses.filter((c) => {
      const matchesQ =
        query.length === 0 ||
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query));
      const matchesCat = category === "All Topics" || c.category === category;
      const matchesLevel = level === "All Levels" || c.level === level;
      return matchesQ && matchesCat && matchesLevel;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else list = [...list].sort((a, b) => parseStudents(b.students) - parseStudents(a.students));
    return list;
  }, [q, category, level, sort]);

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold sm:text-3xl">Course Catalog & Video Lectures</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {results.length} course{results.length === 1 ? "" : "s"} ready to watch &bull; Select any course to begin watching lectures and track progress in My Learning
          {q.trim() ? (
            <>
              {" "}for “<span className="text-violet-300">{q.trim()}</span>”
              <button
                type="button"
                data-testid="explore-clear-search"
                onClick={() => setParams({})}
                className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#232326] px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-[#2e2e33]"
              >
                <X className="size-3" /> Clear search
              </button>
            </>
          ) : (
            " across every topic"
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-[#27272a] bg-card p-3.5 animate-fade-up-1">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-full border border-[#2e2e33] bg-[#181818] px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              data-testid="explore-search-input"
              value={q}
              onChange={(e) => {
                const next = e.target.value;
                setParams(next.trim() ? { q: next } : {});
              }}
              placeholder="Search the full catalog…"
              className="h-full w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <Select value={level} onValueChange={(v: string) => setLevel(v)}>
              <SelectTrigger data-testid="explore-level-select" className="h-10 w-40 rounded-full border-[#2e2e33] bg-[#181818] text-sm">
                <SelectValue>{(v: string | null) => (v === "All Levels" ? "All levels" : (v ?? "All levels"))}</SelectValue>
              </SelectTrigger>
              <SelectContent className="border-[#2e2e33] bg-popover">
                {levels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l === "All Levels" ? "All levels" : l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v: string) => setSort(v)}>
              <SelectTrigger data-testid="explore-sort-select" className="h-10 w-44 rounded-full border-[#2e2e33] bg-[#181818] text-sm">
                <SelectValue>{(v: string | null) => sortOptions[v ?? "popular"]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="border-[#2e2e33] bg-popover">
                {Object.entries(sortOptions).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              data-testid={`explore-category-chip-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95",
                category === cat
                  ? "border-violet-600 bg-violet-600/15 text-violet-200"
                  : "border-[#2e2e33] bg-[#181818] text-zinc-400 hover:border-[#3f3f46] hover:text-zinc-200",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          testId="explore-empty-state"
          icon={<Search className="size-6" />}
          title="Nothing matches those filters"
          body="Try a different keyword, or clear the level and topic filters to see the full catalog."
        />
      ) : (
        <div
          data-testid="explore-results-grid"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {results.map((c) => (
            <CourseCard key={c.id} course={c} showProgress={isEnrolled(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
