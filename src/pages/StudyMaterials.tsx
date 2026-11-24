import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Download,
  FileText,
  ScrollText,
  Sheet,
  Sparkles,
  Upload,
  Loader2,
  Cloud,
  ExternalLink,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { materialTypeLabels, materials as mockMaterials } from "@/data/mockData";
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
import { isSupabaseConfigured, uploadPdfToSupabase, listPdfsFromSupabase } from "@/lib/supabase";
import { useAppState } from "@/store/appState";

export interface DisplayMaterial extends Material {
  url?: string;
  isUploaded?: boolean;
}

const typeIcons: Record<MaterialType, typeof FileText> = {
  summary: Sparkles,
  cheatsheet: Sheet,
  notes: FileText,
  transcript: ScrollText,
};

export default function StudyMaterials() {
  const navigate = useNavigate();
  const { user } = useAppState();
  const [filter, setFilter] = useState<MaterialType | "all" | "uploads">("all");
  const [preview, setPreview] = useState<DisplayMaterial | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getApiBase = () =>
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" && window.location.protocol === "https:"
      ? ""
      : "http://127.0.0.1:8000");

  // Fetch real uploaded documents from both Supabase Cloud Storage and local FastAPI
  const fetchDocs = async () => {
    const docsMap = new Map<string, any>();

    // 1. Fetch from Supabase Cloud Storage
    if (isSupabaseConfigured) {
      try {
        const supaDocs = await listPdfsFromSupabase(user?.email);
        for (const d of supaDocs) {
          docsMap.set(d.name, {
            id: d.id,
            name: d.name,
            title: d.title,
            url: d.url,
            created_at: d.createdAt,
            size: d.size,
            source: "supabase",
          });
        }
      } catch (e) {
        console.warn("Supabase documents list warning:", e);
      }
    }

    // 2. Fetch from local backend (if active)
    try {
      const apiBase = getApiBase();
      if (apiBase || (typeof window !== "undefined" && window.location.protocol !== "https:")) {
        const res = await fetch(`${apiBase}/api/documents`);
        if (res.ok) {
          const backendDocs = await res.json();
          for (const b of backendDocs) {
            const key = b.filename || b.doc_id;
            const existing = docsMap.get(key);
            docsMap.set(key, {
              ...existing,
              ...b,
              id: b.doc_id || existing?.id,
              name: b.filename || existing?.name,
              title: b.title || existing?.title,
              source: existing ? "both" : "backend",
            });
          }
        }
      }
    } catch {
      // Backend offline or unreachable
    }

    setUploadedDocs(Array.from(docsMap.values()));
  };

  useEffect(() => {
    fetchDocs();
  }, [user?.email]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF document.");
      return;
    }

    setIsUploading(true);
    toast.loading("Processing & uploading PDF...", { id: "upload-toast" });

    try {
      let cloudUrl: string | null = null;

      // 1. Upload to Supabase Storage bucket
      if (isSupabaseConfigured) {
        try {
          const sRes = await uploadPdfToSupabase(file, user?.email);
          cloudUrl = sRes.url;
        } catch (sErr: any) {
          console.warn("Supabase Storage upload warning:", sErr);
        }
      }

      // 2. Submit to FastAPI backend for PyPDF extraction & ChromaDB vectorization
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("course", "Academic Study Material");

      const apiBase = getApiBase();
      let indexed = false;
      if (apiBase || (typeof window !== "undefined" && window.location.protocol !== "https:")) {
        try {
          const res = await fetch(`${apiBase}/api/documents/upload`, {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            indexed = true;
            const result = await res.json();
            toast.success(`Indexed "${file.name}"!`, {
              id: "upload-toast",
              description: `${result.total_pages} pages processed (${result.chunks_indexed} semantic chunks). Saved to Cloud.`,
            });
          }
        } catch {
          // Backend offline or unreachable
        }
      }

      if (!indexed) {
        if (cloudUrl) {
          toast.success(`Saved "${file.name}" to Cloud!`, {
            id: "upload-toast",
            description: "PDF safely uploaded to Supabase Storage bucket.",
          });
        } else {
          toast.info(`Received "${file.name}"`, {
            id: "upload-toast",
            description: "PDF uploaded.",
          });
        }
      }

      // Immediately refresh documents list
      await fetchDocs();
    } catch (err: any) {
      toast.error("Upload failed", {
        id: "upload-toast",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Convert uploaded documents into material card format
  const realMaterials: DisplayMaterial[] = uploadedDocs.map((doc) => {
    const sizeStr = doc.size ? `${Math.round(doc.size / 1024)} KB` : doc.chunks ? `${doc.chunks} chunks` : "PDF document";
    return {
      id: doc.id || doc.doc_id || doc.name,
      course: doc.course || "Uploaded Notes",
      courseId: doc.doc_id || "custom-upload",
      title: doc.title || doc.filename || doc.name,
      type: "notes",
      readTime: sizeStr,
      updated: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Cloud Synced",
      excerpt: "Your personal uploaded study document. View the PDF, download, or study with the AI Tutor.",
      body: [
        `Document Name: ${doc.name || doc.filename || doc.title}`,
        doc.url ? `Hosted securely in Supabase Cloud Storage.` : `Stored in local StudySpace backend.`,
        "You can read the full PDF directly in your browser or ask the AI Tutor questions grounded in this material."
      ],
      url: doc.url,
      isUploaded: true,
    };
  });

  const allItems: DisplayMaterial[] = [...realMaterials, ...mockMaterials];

  const filters: Array<{ id: MaterialType | "all" | "uploads"; label: string }> = [
    { id: "all", label: "All materials" },
    { id: "uploads", label: `My Uploads (${realMaterials.length})` },
    { id: "summary", label: "AI summaries" },
    { id: "cheatsheet", label: "Cheat sheets" },
    { id: "notes", label: "Smart notes" },
    { id: "transcript", label: "Transcripts" },
  ];

  const list = allItems.filter((m) => {
    if (filter === "all") return true;
    if (filter === "uploads") return m.isUploaded;
    return m.type === filter;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Study Materials"
        subtitle="Upload your notes or explore AI summaries and lecture digests"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="application/pdf"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Uploading PDF...
            </>
          ) : (
            <>
              <Upload className="size-4" /> Upload Notes (PDF)
            </>
          )}
        </button>
      </PageHeader>

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
          title="No materials found"
          body={filter === "uploads" ? "You haven't uploaded any PDF notes yet. Click 'Upload Notes (PDF)' above!" : "Try selecting another filter or upload your own notes."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m) => {
            const Icon = typeIcons[m.type as MaterialType] || FileText;
            return (
              <div
                key={m.id}
                data-testid={`material-card-${m.id}`}
                className={cn(
                  "group flex flex-col rounded-2xl border bg-card p-5 transition-all hover:-translate-y-1",
                  m.isUploaded
                    ? "border-emerald-500/40 hover:border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.06)]"
                    : "border-[#27272a] hover:border-violet-600/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      m.isUploaded
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-[#1f1d2b] text-violet-400"
                    )}
                  >
                    {m.isUploaded ? <Cloud className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      m.isUploaded
                        ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        : "bg-[#232326] text-zinc-300"
                    )}
                  >
                    {m.isUploaded ? "Uploaded PDF" : materialTypeLabels[m.type as MaterialType] || "Notes"}
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
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid={`material-open-${m.id}`}
                    onClick={() => setPreview(m)}
                    className={cn(
                      "flex-1 min-w-[68px] rounded-full border px-3 py-2 text-xs font-semibold transition-all active:scale-95",
                      m.isUploaded
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                        : "border-violet-600/50 bg-[#1f1d2b] text-violet-200 hover:bg-[#262239]"
                    )}
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    data-testid={`material-ask-ai-${m.id}`}
                    title={`Ask Socrates AI about ${m.title}`}
                    onClick={() =>
                      navigate("/ai-tutor", {
                        state: {
                          documentTitle: m.title,
                          documentUrl: m.url,
                          docId: m.id,
                        },
                      })
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-xs font-semibold transition-all active:scale-95",
                      m.isUploaded
                        ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-500/20"
                        : "border-violet-600/40 bg-violet-600/15 text-violet-200 hover:bg-violet-600/25"
                    )}
                  >
                    <Sparkles className="size-3.5 text-emerald-400" />
                    <span>Ask AI</span>
                  </button>
                  <button
                    type="button"
                    data-testid={`material-quiz-${m.id}`}
                    title={`Generate an adaptive quiz on ${m.title}`}
                    onClick={() =>
                      navigate("/quizzes", {
                        state: {
                          documentTitle: m.title,
                          documentUrl: m.url,
                          docId: m.id,
                          autoGenerate: true,
                        },
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/30 px-2.5 py-2 text-xs font-semibold text-amber-300 transition-all hover:bg-amber-500/20 hover:border-amber-400 active:scale-95"
                  >
                    <HelpCircle className="size-3.5 text-amber-400" />
                    <span>Quiz it!</span>
                  </button>
                  <button
                    type="button"
                    data-testid={`material-download-${m.id}`}
                    aria-label={`Download ${m.title}`}
                    onClick={() => {
                      if (m.url) {
                        window.open(m.url, "_blank");
                        toast.success(`Opening "${m.title}"...`);
                      } else {
                        const blob = new Blob(
                          [
                            `# ${m.title}\n\n**Course:** ${m.course}\n**Estimated Read:** ${m.readTime}\n\n## Notes & Digest\n\n${m.body.join("\n\n")}\n\n---\n*Exported from StudySpace*`,
                          ],
                          { type: "text/markdown;charset=utf-8" }
                        );
                        const downloadUrl = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = downloadUrl;
                        a.download = `${m.title.replace(/[^a-zA-Z0-9]/g, "_")}_notes.md`;
                        a.click();
                        URL.revokeObjectURL(downloadUrl);
                        toast.success(`Exported "${m.title}.md"!`);
                      }
                    }}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border text-zinc-300 transition-all hover:text-white active:scale-90",
                      m.isUploaded
                        ? "border-emerald-500/40 hover:border-emerald-400"
                        : "border-[#2e2e33] hover:border-violet-600/50"
                    )}
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
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto border-[#2e2e33] bg-[#181818]",
          preview?.url ? "sm:max-w-3xl" : "sm:max-w-lg"
        )}>
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading pr-6 flex flex-wrap items-center justify-between gap-3">
                  <span>{preview.title}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const target = preview;
                        setPreview(null);
                        navigate("/quizzes", {
                          state: {
                            documentTitle: target.title,
                            documentUrl: target.url,
                            docId: target.id,
                            autoGenerate: true,
                          },
                        });
                      }}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 transition-colors"
                    >
                      <HelpCircle className="size-3.5 text-amber-300" /> Quiz it!
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const target = preview;
                        setPreview(null);
                        navigate("/ai-tutor", {
                          state: {
                            documentTitle: target.title,
                            documentUrl: target.url,
                            docId: target.id,
                          },
                        });
                      }}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-600/25 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600/40 transition-colors"
                    >
                      <Sparkles className="size-3.5 text-violet-300" /> Ask AI Tutor
                    </button>
                    {preview.url && (
                      <a
                        href={preview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                      >
                        <ExternalLink className="size-3.5" /> Open in New Tab
                      </a>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {preview.isUploaded ? "Uploaded PDF" : materialTypeLabels[preview.type as MaterialType]} · {preview.course} · {preview.readTime}
                </DialogDescription>
              </DialogHeader>

              {preview.url ? (
                <div className="space-y-3 pt-2">
                  <div className="overflow-hidden rounded-xl border border-[#2e2e33] bg-[#0c0c0e]">
                    <iframe
                      src={preview.url}
                      title={preview.title}
                      className="h-[60vh] w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-zinc-400">
                    <span>Cloud Synced PDF document</span>
                    <a
                      href={preview.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Download className="size-3" /> Download original PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
                  {preview.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  <p className="text-[11px] text-zinc-500">
                    Curated study material · StudySpace Course Notes.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
