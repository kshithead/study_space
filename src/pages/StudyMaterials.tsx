import { useState } from "react";
import { BookOpen, Download, FileText, ScrollText, Sheet, Sparkles } from "lucide-react";
import { materialTypeLabels, materials } from "@/data/mockData";
import type { Material, MaterialType } from "@/data/mockData";
import { EmptyState, PageHeader } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const typeIcons: Record<MaterialType, typeof FileText> = {
  summary: Sparkles,
  cheatsheet: Sheet,
  notes: FileText,
  transcript: ScrollText,
};

const filters: Array<{ id: MaterialType | "all"; label: string }> = [
  { id: "all", label: "All materials" },
  { id: "summary", label: "AI summaries" },
  { id: "cheatsheet", label: "Cheat sheets" },
  { id: "notes", label: "Smart notes" },
  { id: "transcript", label: "Transcripts" },
];

export default function StudyMaterials() {
  const [filter, setFilter] = useState<MaterialType | "all">("all");
  const [preview, setPreview] = useState<Material | null>(null);

  const list = materials.filter((m) => filter === "all" || m.type === filter);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Study Materials"
        subtitle="AI-generated summaries, cheat sheets and digests from your courses — generated sample content"
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            data-testid={`materials-filter-${f.id}`}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95",
              filter === f.id
                ? "border-violet-600 bg-violet-600/15 text-violet-200"
                : "border-[#2e2e33] bg-card text-zinc-400 hover:border-[#3f3f46] hover:text-zinc-200",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          testId="materials-empty"
          icon={<FileText className="size-6" />}
          title="No materials in this category"
          body="Generate summaries from any lesson with the AI actions on the course page."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => {
            const Icon = typeIcons[m.type];
            return (
              <div
                key={m.id}
                data-testid={`material-card-${m.id}`}
                className="group flex flex-col rounded-2xl border border-[#27272a] bg-card p-5 transition-all hover:-translate-y-1 hover:border-violet-600/50"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#1f1d2b] text-violet-400">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-[#232326] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                    {materialTypeLabels[m.type]}
                  </span>
                </div>
                <h3 className="mt-3 font-heading line-clamp-2 text-[15px] font-semibold leading-snug">
                  {m.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {m.excerpt}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <BookOpen className="size-3" />
                  {m.course} · {m.readTime} · {m.updated}
                </p>
                <div className="mt-3.5 flex gap-2">
                  <button
                    type="button"
                    data-testid={`material-open-${m.id}`}
                    onClick={() => setPreview(m)}
                    className="flex-1 rounded-full border border-violet-600/50 bg-[#1f1d2b] px-3 py-2 text-xs font-semibold text-violet-200 transition-all hover:bg-[#262239] active:scale-95"
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    data-testid={`material-download-${m.id}`}
                    aria-label={`Download ${m.title}`}
                    onClick={() =>
                      toast.info("Prototype preview", {
                        description: "Exports arrive with the backend stage.",
                      })
                    }
                    className="flex size-9 items-center justify-center rounded-full border border-[#2e2e33] text-zinc-300 transition-all hover:border-violet-600/50 hover:text-white active:scale-90"
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-[#2e2e33] bg-[#181818] sm:max-w-lg">
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading pr-6">{preview.title}</DialogTitle>
                <DialogDescription>
                  {materialTypeLabels[preview.type]} · {preview.course} · {preview.readTime}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
                {preview.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="text-[11px] text-zinc-600">
                AI-generated sample content for the frontend prototype.
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
