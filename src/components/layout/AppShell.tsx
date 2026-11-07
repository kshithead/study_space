import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAppState } from "@/store/appState";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export default function AppShell() {
  const { sidebarCollapsed } = useAppState();

  return (
    <div className="min-h-svh bg-background text-foreground">
      <Navbar />
      <Sidebar />
      <main
        data-testid="app-main"
        className={cn(
          "min-h-svh pt-16 transition-[padding] duration-300 ease-out",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
