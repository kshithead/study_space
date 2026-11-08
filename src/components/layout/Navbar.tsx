import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Flame,
  GraduationCap,
  Layers,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  BarChart3,
  FileText,
  LogIn,
} from "lucide-react";
import {
  allCourses,
  decks,
  materials,
  notifications,
  user as mockUser,
} from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { DEFAULT_NEUTRAL_AVATAR } from "@/services/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SearchHit {
  kind: "Course" | "Material" | "Flashcard deck";
  id: string;
  title: string;
  meta: string;
  to: string;
}

function searchEverything(q: string): SearchHit[] {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const c of allCourses) {
    if (
      c.title.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.instructor.toLowerCase().includes(query) ||
      c.tags.some((t) => t.toLowerCase().includes(query))
    ) {
      hits.push({
        kind: "Course",
        id: c.id,
        title: c.title,
        meta: `${c.category} · ${c.instructor}`,
        to: `/course/${c.id}`,
      });
    }
  }
  for (const m of materials) {
    if (m.title.toLowerCase().includes(query)) {
      hits.push({
        kind: "Material",
        id: m.id,
        title: m.title,
        meta: m.course,
        to: "/study-materials",
      });
    }
  }
  for (const d of decks) {
    if (d.title.toLowerCase().includes(query)) {
      hits.push({
        kind: "Flashcard deck",
        id: d.id,
        title: d.title,
        meta: `${d.cards.length} cards`,
        to: "/flashcards",
      });
    }
  }
  return hits.slice(0, 7);
}

const kindIcon = {
  Course: BookOpen,
  Material: FileText,
  "Flashcard deck": Layers,
};

export default function Navbar() {
  const navigate = useNavigate();
  const {
    toggleSidebar,
    setMobileNavOpen,
    notificationsRead,
    markNotificationsRead,
    user: currentUser,
    isAuthenticated,
    logout,
  } = useAppState();
  const user = currentUser ?? mockUser;
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hits = searchEverything(query);
  const unread = !notificationsRead;

  // ⌘K / Ctrl+K focuses the search bar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setFocused(false);
    navigate(to);
  };

  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50 h-16 border-b border-[#27272a]">
      <div className="flex h-full items-center gap-3 px-4 sm:gap-4">
        {/* mobile menu + sidebar collapse */}
        <button
          type="button"
          data-testid="sidebar-toggle-button"
          aria-label="Toggle navigation"
          onClick={() => {
            // below lg the sidebar is a drawer, above lg it collapses
            if (window.innerWidth < 1024) setMobileNavOpen(true);
            else toggleSidebar();
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-[#232326] hover:text-white active:scale-95"
        >
          <Menu className="size-5" />
        </button>

        {/* logo */}
        <Link
          to="/"
          data-testid="brand-logo"
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-[0_0_24px_rgba(124,58,237,0.45)]">
            <GraduationCap className="size-5 text-white" />
          </span>
          <span className="hidden font-heading text-lg font-bold tracking-tight sm:block">
            Study<span className="text-gradient">Space</span>
          </span>
        </Link>

        {/* search */}
        <div className="relative mx-auto hidden w-full max-w-xl md:block">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) go(`/explore?q=${encodeURIComponent(query.trim())}`);
            }}
            data-testid="global-search-form"
          >
            <div
              className={cn(
                "flex h-10 items-center gap-2 rounded-full border bg-[#181818] px-4 transition-all",
                focused
                  ? "border-violet-600 shadow-[0_0_0_3px_rgba(124,58,237,0.18)]"
                  : "border-[#2e2e33] hover:border-[#3f3f46]",
              )}
            >
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                data-testid="global-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => window.setTimeout(() => setFocused(false), 150)}
                placeholder="Search courses, materials, decks…"
                className="h-full w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden shrink-0 rounded-md border border-[#2e2e33] bg-[#232326] px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 lg:block">
                ⌘K
              </kbd>
            </div>
          </form>

          {focused && query.trim().length >= 2 ? (
            <div
              data-testid="search-results-dropdown"
              className="absolute inset-x-0 top-12 overflow-hidden rounded-2xl border border-[#2e2e33] bg-popover shadow-2xl shadow-black/60"
            >
              {hits.length === 0 ? (
                <p className="px-4 py-3.5 text-sm text-muted-foreground">
                  No matches for “{query}”.
                </p>
              ) : (
                <ul className="max-h-80 overflow-y-auto py-1.5">
                  {hits.map((h) => {
                    const Icon = kindIcon[h.kind];
                    return (
                      <li key={`${h.kind}-${h.id}`}>
                        <button
                          type="button"
                          data-testid={`search-result-${h.id}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => go(h.to)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#26262b]"
                        >
                          <Icon className="size-4 shrink-0 text-violet-400" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-zinc-100">
                              {h.title}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {h.meta}
                            </span>
                          </span>
                          <span className="ml-auto shrink-0 rounded-full bg-[#232326] px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                            {h.kind}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(`/explore?q=${encodeURIComponent(query.trim())}`)}
                className="w-full border-t border-[#27272a] px-4 py-2.5 text-left text-sm font-medium text-violet-400 transition-colors hover:bg-[#26262b]"
              >
                See all results for “{query.trim()}”
              </button>
            </div>
          ) : null}
        </div>

        {/* mobile search shortcut */}
        <button
          type="button"
          aria-label="Search"
          onClick={() => go("/explore")}
          className="ml-auto flex size-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-[#232326] md:hidden"
        >
          <Search className="size-5" />
        </button>

        {/* right cluster */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 md:ml-0">
          <Link
            to="/ai-tutor"
            data-testid="nav-ai-tutor-quick"
            className="glow-ring mr-1 hidden items-center gap-2 rounded-full border border-violet-600/60 bg-[#1f1d2b] px-3.5 py-2 text-sm font-medium text-violet-200 transition-all hover:bg-[#262239] active:scale-95 lg:inline-flex"
          >
            <Sparkles className="size-4 text-violet-400" />
            AI Tutor
          </Link>

          <span
            data-testid="streak-counter"
            title="Daily learning streak"
            className="hidden items-center gap-1.5 rounded-full bg-[#1f1d2b] px-3 py-2 text-sm font-semibold text-orange-400 sm:inline-flex"
          >
            <Flame className="size-4" />
            {user.streak}
          </span>

          <Popover>
            <PopoverTrigger
              data-testid="notifications-popover-trigger"
              className="relative flex size-10 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-[#232326] hover:text-white"
            >
              <Bell className="size-5" />
              {unread ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-violet-500 ring-2 ring-[#0f0f0f]" />
              ) : null}
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-80 border-[#2e2e33] bg-popover p-0"
            >
              <div className="flex items-center justify-between border-b border-[#27272a] px-4 py-3">
                <p className="font-heading text-sm font-semibold">Notifications</p>
                <button
                  type="button"
                  data-testid="notifications-mark-read"
                  onClick={markNotificationsRead}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300"
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    data-testid={`notification-${n.id}`}
                    className="flex gap-3 border-b border-[#232326] px-4 py-3 last:border-0"
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        unread ? "bg-violet-500" : "bg-[#3f3f46]",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-100">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-500">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          {/* Direct Profile navigation icon */}
          <Link
            to="/profile"
            data-testid="user-profile-menu-trigger"
            aria-label="Student Profile"
            title={`View profile for ${user.name || "Student"}`}
            className="group relative flex items-center gap-2 rounded-full p-1 transition-all hover:bg-white/5 hover:ring-2 hover:ring-violet-500/50 focus:outline-none active:scale-95"
          >
            <div className="relative">
              <img
                src={user.avatar || DEFAULT_NEUTRAL_AVATAR}
                alt={user.name || "Student"}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_NEUTRAL_AVATAR;
                }}
                className="size-9 rounded-full bg-[#18152e] object-cover border border-white/10 shadow-sm transition-transform group-hover:scale-105"
              />
              {isAuthenticated && (
                <span
                  title="Authenticated Database Session"
                  className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0f0f12]"
                />
              )}
            </div>
            <span className="hidden pr-1.5 text-xs font-semibold text-zinc-200 group-hover:text-violet-300 sm:inline-block">
              {user.firstName || "Profile"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
