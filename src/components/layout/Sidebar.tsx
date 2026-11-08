import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  BookOpen,
  Bot,
  Compass,
  FileText,
  GraduationCap,
  Home,
  Layers,
  ListChecks,
  Settings,
  Timer,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppState } from "@/store/appState";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: "Discover",
    items: [
      { id: "home", label: "Home", to: "/", icon: Home },
      { id: "explore", label: "Courses", to: "/explore", icon: BookOpen },
    ],
  },
  {
    title: "Learning",
    items: [
      { id: "my-learning", label: "My Learning", to: "/my-learning", icon: GraduationCap },
      { id: "study-materials", label: "Study Materials", to: "/study-materials", icon: FileText },
    ],
  },
  {
    title: "AI Suite",
    items: [
      { id: "ai-tutor", label: "AI Tutor", to: "/ai-tutor", icon: Bot, },
      { id: "flashcards", label: "Flashcards", to: "/flashcards", icon: Layers },
      { id: "quizzes", label: "Quizzes", to: "/quizzes", icon: ListChecks },
    ],
  },
  {
    title: "Productivity",
    items: [
      { id: "focus-room", label: "Focus Room", to: "/focus-room", icon: Timer },
      { id: "bookmarks", label: "Bookmarks", to: "/bookmarks", icon: Bookmark },
      { id: "analytics", label: "Learning Analytics", to: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "settings", label: "Settings", to: "/settings", icon: Settings },
      { id: "profile", label: "Profile", to: "/profile", icon: User },
    ],
  },
];

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex h-full flex-col overflow-y-auto overflow-x-hidden px-3 py-4" data-testid="sidebar-nav">
      {navGroups.map((group) => (
        <div key={group.title} className="mb-4 last:mb-0">
          {collapsed ? (
            <div className="mx-auto mb-2 mt-1 h-px w-8 bg-[#232327]" role="separator" />
          ) : (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {group.title}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    data-testid={`sidebar-nav-link-${item.id}`}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                      collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                      active
                        ? "bg-[#1f1d2b] text-white"
                        : "text-zinc-400 hover:bg-[#1b1b1e] hover:text-zinc-100",
                    )}
                  >
                    {active ? (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                    ) : null}
                    <Icon
                      className={cn(
                        "size-5 shrink-0 transition-colors",
                        active
                          ? "text-violet-400"
                          : "text-zinc-500 group-hover:text-zinc-300",
                      )}
                    />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {!collapsed ? (
        <div className="mt-auto rounded-2xl border border-violet-600/30 bg-gradient-to-br from-[#1f1d2b] to-[#171526] p-4">
          <p className="font-heading text-sm font-semibold text-violet-200">
            Studyspace Pro
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Unlimited AI tutoring, adaptive quizzes and priority explanations.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          >
            Upgrade — coming soon
          </button>
        </div>
      ) : null}
    </nav>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed, mobileNavOpen, setMobileNavOpen } = useAppState();
  const location = useLocation();

  // close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileNavOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on route change only
  }, [location.pathname]);

  return (
    <>
      {/* desktop */}
      <aside
        data-testid="sidebar-desktop"
        className={cn(
          "fixed bottom-0 left-0 top-16 z-40 hidden border-r border-[#232327] bg-[#121212] transition-[width] duration-300 ease-out lg:block",
          sidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        <SidebarBody collapsed={sidebarCollapsed} />
      </aside>

      {/* mobile drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden" data-testid="sidebar-mobile-drawer">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <aside className="absolute bottom-0 left-0 top-0 w-72 border-r border-[#232327] bg-[#121212] shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-[#232327] px-4">
              <span className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-500">
                  <GraduationCap className="size-4 text-white" />
                </span>
                <span className="font-heading font-bold">
                  Study<span className="text-gradient">Space</span>
                </span>
              </span>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileNavOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-zinc-400 hover:bg-[#232326] hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="h-[calc(100%-4rem)]">
              <SidebarBody collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
