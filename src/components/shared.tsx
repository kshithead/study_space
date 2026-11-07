import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function ProgressBar({
  value,
  className,
  glow = false,
}: {
  value: number;
  className?: string;
  glow?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-[#27272a]",
        className,
      )}
      data-testid="progress-bar"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-[width] duration-500",
          glow && "shadow-[0_0_12px_rgba(139,92,246,0.7)]",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionTo,
  icon,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2.5 text-lg font-semibold sm:text-xl">
          {icon ? <span className="text-violet-400">{icon}</span> : null}
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          data-testid={`section-link-${actionLabel.toLowerCase().replace(/\s+/g, "-")}`}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300"
        >
          {actionLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  children,
  testId,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2e2e33] bg-card/50 px-6 py-16 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#1f1d2b] text-violet-400">
        {icon}
      </div>
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
