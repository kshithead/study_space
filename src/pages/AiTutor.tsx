import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen, Bot, FileText, Globe, History, Plus, Send, Sparkles, Trash2, User, Zap } from "lucide-react";
import {
  suggestedPrompts,
  tutorModes,
} from "@/data/mockData";
import type { ChatSession, TutorMode } from "@/data/mockData";
import { useAppState } from "@/store/appState";
import { generateTutorReply } from "@/services/ai";
import type { GroundingScope } from "@/services/ai";
import { extractPdfText, getCachedPdfText } from "@/lib/pdfTextExtractor";
import { isSupabaseConfigured, listPdfsFromSupabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ── tiny rich-text renderer for canned tutor replies ─────────────────────────

function renderInline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={`${keyBase}-${i}`}
          className="rounded-md bg-[#09090b] px-1.5 py-0.5 font-mono text-[0.85em] text-violet-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    return <span key={`${keyBase}-${i}`}>{part}</span>;
  });
}

function RichContent({ content }: { content: string }) {
  const blocks = useMemo(() => content.split(/```/g), [content]);
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, bi) => {
        if (bi % 2 === 1) {
          // code fence: optional language on the first line
          const lines = block.split("\n");
          const lang = /^[a-z]+$/i.test(lines[0].trim()) ? lines[0].trim() : "";
          const code = (lang ? lines.slice(1) : lines).join("\n").replace(/\n$/, "");
          return (
            <div key={`code-${bi}`} className="overflow-hidden rounded-xl border border-[#2e2e33]">
              <div className="flex items-center justify-between bg-[#0d0d11] px-3.5 py-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  {lang || "code"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(code).catch(() => undefined);
                    toast.success("Copied to clipboard");
                  }}
                  className="text-[11px] font-medium text-violet-400 transition-colors hover:text-violet-300"
                >
                  Copy
                </button>
              </div>
              <pre className="overflow-x-auto bg-[#09090b] px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-zinc-200">
                {code}
              </pre>
            </div>
          );
        }
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        const out: ReactNode[] = [];
        let list: string[] = [];
        const flush = (key: string) => {
          if (list.length > 0) {
            out.push(
              <ul key={`ul-${key}`} className="ml-1 list-none space-y-1.5">
                {list.map((li, li2) => (
                  <li key={`${key}-${li2}`} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                    <span>{renderInline(li, `${key}-${li2}`)}</span>
                  </li>
                ))}
              </ul>,
            );
            list = [];
          }
        };
        lines.forEach((line, li) => {
          if (line.startsWith("- ")) {
            list.push(line.slice(2));
            return;
          }
          flush(`b${bi}-l${li}`);
          if (line.startsWith("### ")) {
            out.push(
              <h4 key={`h-${bi}-${li}`} className="pt-1 font-heading text-[15px] font-semibold text-white">
                {renderInline(line.slice(4), `h-${bi}-${li}`)}
              </h4>,
            );
          } else if (/^\d+\./.test(line)) {
            out.push(
              <p key={`p-${bi}-${li}`}>{renderInline(line, `p-${bi}-${li}`)}</p>,
            );
          } else {
            out.push(<p key={`p-${bi}-${li}`}>{renderInline(line, `p-${bi}-${li}`)}</p>);
          }
        });
        flush(`b${bi}-end`);
        return <div key={`txt-${bi}`}>{out}</div>;
      })}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

const streamInterval = 24;

export default function AiTutor() {
  const { chatSessions, upsertChatSession, deleteChatSession, user } = useAppState();
  const location = useLocation();
  const locationState = location.state as {
    documentTitle?: string;
    documentUrl?: string;
    docId?: string;
  } | null;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<TutorMode>("Socratic Mentor");
  const [model, setModel] = useState("tutor");
  const [groundingScope, setGroundingScope] = useState<GroundingScope>(() => {
    return (localStorage.getItem("study_grounding_scope") as GroundingScope) || "doc-only";
  });
  const [input, setInput] = useState("");
  const [streamText, setStreamText] = useState<string | null>(null);
  const [extractedDocText, setExtractedDocText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSetGroundingScope = (scope: GroundingScope) => {
    setGroundingScope(scope);
    try {
      localStorage.setItem("study_grounding_scope", scope);
    } catch {}
    toast.info(
      scope === "doc-only"
        ? "Switched to 'Document Only': AI will strictly use uploaded document text."
        : "Switched to 'Doc + General AI': AI is anchored in document, but free to explain and use general knowledge."
    );
  };

  // Automatically start or select grounded document chat if navigated from Study Materials
  useEffect(() => {
    if (locationState?.documentTitle) {
      const docTitle = locationState.documentTitle;
      const targetSessionTitle = `Study: ${docTitle}`;
      const existing = chatSessions.find((s) => s.title === targetSessionTitle);
      if (existing) {
        setActiveId(existing.id);
        if (locationState.documentUrl && !existing.documentUrl) {
          upsertChatSession({ ...existing, documentUrl: locationState.documentUrl });
        }
      } else {
        const now = Date.now();
        const sessionId = `doc-chat-${now}`;
        const newSession: ChatSession = {
          id: sessionId,
          title: targetSessionTitle,
          documentTitle: docTitle,
          documentUrl: locationState.documentUrl,
          updatedAt: now,
          messages: [
            {
              id: `m-init-${now}`,
              role: "tutor",
              content: `Hello! I've loaded your document **"${docTitle}"**. 📄\n\nWhat would you like to explore? I can:\n- **Summarize** the main takeaways\n- **Explain** difficult sections or formulas\n- **Quiz you** to test your retention\n\nAsk me anything about this material!`,
              mode: "Socratic Mentor",
              at: now,
            },
          ],
        };
        upsertChatSession(newSession);
        setActiveId(sessionId);
      }
    }
  }, [locationState?.documentTitle, locationState?.documentUrl]);

  const active = chatSessions.find((s) => s.id === activeId) ?? null;

  // Sync and extract text for active grounded document session
  useEffect(() => {
    if (!active?.title.startsWith("Study: ")) {
      setExtractedDocText("");
      return;
    }

    const docTitle = active.title.replace("Study: ", "").trim();

    // 1. If active session already has stored text, use it immediately
    if (active.docText && active.docText.trim().length > 50) {
      setExtractedDocText(active.docText);
      return;
    }

    // 2. Check in-memory or sessionStorage cache
    const cached =
      getCachedPdfText(docTitle) ||
      (active.documentUrl ? getCachedPdfText(active.documentUrl) : "") ||
      (locationState?.documentUrl ? getCachedPdfText(locationState.documentUrl) : "");

    if (cached) {
      setExtractedDocText(cached);
      if (!active.docText) {
        upsertChatSession({ ...active, docText: cached });
      }
      return;
    }

    // 3. Resolve document URL (from active session, locationState, or query Supabase)
    const resolveAndExtract = async () => {
      let targetUrl = active.documentUrl || locationState?.documentUrl;

      if (!targetUrl && isSupabaseConfigured) {
        try {
          const files = await listPdfsFromSupabase(user?.email);
          const cleanSearch = docTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
          const match = files.find((f) => {
            const fTitle = f.title.toLowerCase().replace(/[^a-z0-9]/g, "");
            const fName = f.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return (
              fTitle.includes(cleanSearch) ||
              cleanSearch.includes(fTitle) ||
              fName.includes(cleanSearch) ||
              cleanSearch.includes(fName)
            );
          });
          if (match?.url) {
            targetUrl = match.url;
          }
        } catch (e) {
          console.warn("Error finding document in Supabase:", e);
        }
      }

      if (targetUrl) {
        setIsExtracting(true);
        try {
          const text = await extractPdfText(targetUrl);
          if (text) {
            setExtractedDocText(text);
            try {
              sessionStorage.setItem(`ss.pdfText.${encodeURIComponent(docTitle)}`, text.slice(0, 60000));
            } catch {}
            upsertChatSession({
              ...active,
              documentTitle: docTitle,
              documentUrl: targetUrl,
              docText: text,
            });
            toast.success(`Indexed "${docTitle}" for AI Tutoring!`, {
              description: `${text.length.toLocaleString()} characters ready for deep grounding.`,
            });
          }
        } catch (err) {
          console.warn("Failed to extract PDF text:", err);
        } finally {
          setIsExtracting(false);
        }
      }
    };

    void resolveAndExtract();
  }, [active?.id, active?.title, active?.docText, active?.documentUrl, locationState?.documentUrl, user?.email]);
  const sortedSessions = useMemo(
    () => [...chatSessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [chatSessions],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages.length, streamText]);

  // Reset activeId when chatSessions change or when user account switches
  useEffect(() => {
    if (activeId && !chatSessions.some((s) => s.id === activeId)) {
      setActiveId(chatSessions[0]?.id ?? null);
    }
  }, [chatSessions, activeId]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || streamText !== null) return;
    setInput("");

    const now = Date.now();
    const sessionId = activeId ?? `chat-${now}`;
    const base = active ?? {
      id: sessionId,
      title: text.slice(0, 44) + (text.length > 44 ? "…" : ""),
      updatedAt: now,
      messages: [],
    };
    const userMsg = { id: `m-${now}-u`, role: "user" as const, content: text, mode, at: now };
    const tutorMsg = { id: `m-${now}-t`, role: "tutor" as const, content: "", mode, at: now + 1 };
    upsertChatSession({
      ...base,
      updatedAt: now,
      messages: [...base.messages, userMsg, tutorMsg],
    });
    setActiveId(sessionId);
    const isGroq = model === "groq-120b" || model === "groq-qwen";
    setStreamText(isGroq ? "Thinking with Groq Cloud AI..." : "Thinking with Gemini AI...");

    const isDocSession = base.title.startsWith("Study: ");
    const docTitle = isDocSession ? base.title.replace("Study: ", "").trim() : undefined;
    const docText = isDocSession
      ? (extractedDocText || base.docText || (docTitle ? getCachedPdfText(docTitle) : "") || (locationState?.documentUrl ? getCachedPdfText(locationState.documentUrl) : ""))
      : undefined;

    try {
      const result = await generateTutorReply({
        query: text,
        mode,
        docId: locationState?.docId,
        documentTitle: docTitle,
        documentText: docText,
        selectedModel: model,
        groundingScope,
        history: base.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          at: m.at,
        })),
      });

      let full = result.answer;
      if (result.sources && result.sources.length > 0) {
        full +=
          "\n\n**Sources & Citations:**\n" +
          result.sources
            .map((s) => `- ${s.title || s.filename} (Page ${s.page})`)
            .join("\n");
      }

      // Smooth streaming typewriter output
      const words = full.split(" ");
      let i = 0;
      const timer = window.setInterval(() => {
        i += 3;
        setStreamText(words.slice(0, i).join(" "));
        if (i >= words.length) {
          window.clearInterval(timer);
          upsertChatSession({
            ...base,
            updatedAt: Date.now(),
            messages: [...base.messages, userMsg, { ...tutorMsg, content: full }],
          });
          setStreamText(null);
        }
      }, 35);
    } catch (err) {
      console.error("AI Tutor error:", err);
      const fallbackMsg = "I encountered a momentary connection issue. Please try your message again!";
      upsertChatSession({
        ...base,
        updatedAt: Date.now(),
        messages: [...base.messages, userMsg, { ...tutorMsg, content: fallbackMsg }],
      });
      setStreamText(null);
    }
  };

  const newChat = () => {
    if (streamText !== null) return;
    setActiveId(null);
    setInput("");
    setExtractedDocText("");
  };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const groups: Array<{ label: string; sessions: ChatSession[] }> = [
    {
      label: "Today",
      sessions: sortedSessions.filter((s) => s.updatedAt >= startOfDay.getTime()),
    },
    {
      label: "Previous 7 days",
      sessions: sortedSessions.filter(
        (s) => s.updatedAt < startOfDay.getTime() && s.updatedAt >= weekAgo,
      ),
    },
    {
      label: "Older",
      sessions: sortedSessions.filter((s) => s.updatedAt < weekAgo),
    },
  ];

  const messages = active?.messages ?? [];
  const lastMsg = messages[messages.length - 1];
  const streamingIntoLast = streamText !== null && lastMsg?.role === "tutor";

  return (
    <div className="flex h-[calc(100svh-7.5rem)] overflow-hidden rounded-3xl border border-[#27272a] bg-[#131316] animate-fade-up">
      {/* history sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#232327] bg-[#121214] lg:flex">
        <div className="p-3">
          <button
            type="button"
            data-testid="ai-tutor-new-chat-button"
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="size-4" /> New tutoring session
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          <History className="size-3.5" /> History
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {sortedSessions.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-zinc-500">
              <p>No previous sessions.</p>
              <p className="mt-1 text-[11px] text-zinc-600">Your AI chat history will appear here.</p>
            </div>
          ) : (
            groups.map(
              (g) =>
                g.sessions.length > 0 && (
                  <div key={g.label} className="mb-3">
                  <p className="px-2 py-1 text-[11px] font-medium text-zinc-600">
                    {g.label}
                  </p>
                  <ul className="space-y-0.5">
                    {g.sessions.map((s) => (
                      <li key={s.id} className="group/row relative">
                        <button
                          type="button"
                          data-testid={`ai-tutor-session-item-${s.id}`}
                          onClick={() => {
                            if (streamText === null) setActiveId(s.id);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 pr-8 text-left text-[13px] transition-colors",
                            s.id === activeId
                              ? "bg-[#1f1d2b] text-violet-200"
                              : "text-zinc-400 hover:bg-[#1b1b1e] hover:text-zinc-200",
                          )}
                        >
                          <span className="truncate">{s.title}</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${s.title}`}
                          data-testid={`ai-tutor-session-delete-${s.id}`}
                          onClick={() => {
                            deleteChatSession(s.id);
                            if (s.id === activeId) setActiveId(null);
                          }}
                          className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded-md p-1 text-zinc-500 transition-colors hover:bg-[#2a2a30] hover:text-red-400 group-hover/row:block"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )
          )}
        </div>
      </aside>

      {/* chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* header */}
        <div className="flex items-center gap-2 border-b border-[#232327] bg-[#131316]/90 px-4 py-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-500">
            <Bot className="size-4 text-white" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold">Socrates — AI Tutor</p>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {model === "groq-120b"
                ? "Groq Cloud 120B AI"
                : model === "groq-qwen"
                ? "Groq Cloud Qwen AI"
                : "Google Gemini Cloud AI"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Select value={mode} onValueChange={(v: string) => setMode(v as TutorMode)}>
              <SelectTrigger data-testid="ai-tutor-mode-select" size="sm" className="w-44 border-[#2e2e33] bg-[#181818] text-xs">
                <SelectValue>{(v: string | null) => v ?? "Socratic Mentor"}</SelectValue>
              </SelectTrigger>
              <SelectContent className="border-[#2e2e33] bg-popover">
                {tutorModes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={model} onValueChange={(v: string) => setModel(v)}>
              <SelectTrigger data-testid="ai-tutor-model-select" size="sm" className="hidden w-56 border-[#2e2e33] bg-[#181818] text-xs sm:flex">
                <SelectValue>
                  {(v: string | null) => {
                    if (v === "groq-120b") return "⚡ Groq 120B (Ultra-fast)";
                    if (v === "groq-qwen") return "🚀 Groq Qwen 27B (Instant)";
                    return "✨ Google Gemini 3.5";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border-[#2e2e33] bg-popover">
                <SelectItem value="tutor">✨ Google Gemini 3.5 Flash</SelectItem>
                <SelectItem value="groq-120b">⚡ Groq GPT-OSS 120B (Ultra-fast)</SelectItem>
                <SelectItem value="groq-qwen">🚀 Groq Qwen 27B (Instant 120ms)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Document grounding banner or general chat indicator */}
        {active?.title.startsWith("Study: ") ? (
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-emerald-500/25 bg-emerald-950/20 px-4 py-2 text-xs text-emerald-300">
            <span className="flex items-center gap-2 font-medium">
              <FileText className="size-3.5 text-emerald-400" />
              <span>
                Grounded Document: <strong className="text-white">{active.title.replace("Study: ", "")}</strong>
              </span>
              {isExtracting ? (
                <span className="text-[11px] text-amber-300 animate-pulse font-normal">(Reading entire PDF text...)</span>
              ) : (extractedDocText || active.docText) ? (
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-mono font-semibold">
                  {Math.round(((extractedDocText || active.docText || "").length) / 1000)}k chars indexed
                </span>
              ) : null}
            </span>

            {/* Option A: Segmented Pill Switcher (Document Only vs Doc + General AI) */}
            <div className="flex items-center rounded-lg border border-[#2e2e33] bg-[#141418] p-0.5 text-[11px] shadow-sm">
              <button
                type="button"
                data-testid="ai-tutor-mode-doc-only"
                onClick={() => handleSetGroundingScope("doc-only")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all active:scale-95",
                  groundingScope === "doc-only"
                    ? "bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1f1f25]"
                )}
                title="Strict Document Mode: AI answers strictly based on the text of your uploaded document without outside extrapolation."
              >
                <BookOpen className="size-3 text-emerald-400" />
                <span>Document Only</span>
              </button>
              <button
                type="button"
                data-testid="ai-tutor-mode-hybrid"
                onClick={() => handleSetGroundingScope("hybrid")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all active:scale-95",
                  groundingScope === "hybrid"
                    ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1f1f25]"
                )}
                title="Hybrid Mode: Grounded in this document, but free to use general AI intelligence for code examples, analogies, and broader explanations."
              >
                <Globe className="size-3 text-violet-400" />
                <span>Doc + General AI</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-500/20 bg-violet-950/15 px-4 py-1.5 text-xs text-violet-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="size-3.5 text-violet-400" />
              <span>General Academic AI Mode (Freeform Chat)</span>
            </span>
            <div className="flex items-center gap-2">
              {chatSessions.find((s) => s.title.startsWith("Study: ")) ? (
                <button
                  type="button"
                  onClick={() => {
                    const docSession = chatSessions.find((s) => s.title.startsWith("Study: "));
                    if (docSession) setActiveId(docSession.id);
                  }}
                  className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-900/50 hover:text-white"
                  title="Switch to your uploaded PDF study session to use Document Only or Doc + General AI grounding"
                >
                  <FileText className="size-3 text-emerald-400" />
                  <span>Switch to Grounded Document Chat ➔</span>
                </button>
              ) : null}
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                General AI (No Doc Attached)
              </span>
            </div>
          </div>
        )}

        {/* thread */}
        <div ref={scrollRef} data-testid="ai-tutor-thread" className="flex-1 overflow-y-auto px-4 py-5">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center pt-10 text-center sm:pt-16">
              <span className="glow-ring mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500">
                <Bot className="size-7 text-white" />
              </span>
              <h1 className="font-heading text-xl font-bold sm:text-2xl">
                What shall we learn today, {user.firstName}?
              </h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Ask questions, explore concepts, prepare for exams, or get guided problem-solving. Powered by Google Gemini AI.
              </p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    data-testid={`ai-tutor-prompt-chip-${i}`}
                    onClick={() => send(p.prompt)}
                    className="flex items-center gap-2.5 rounded-xl border border-[#4c1d95]/60 bg-[#1c1929] px-4 py-3 text-left text-sm text-zinc-200 transition-all hover:border-violet-500 hover:bg-[#241f33] active:scale-[0.98]"
                  >
                    <Sparkles className="size-4 shrink-0 text-violet-400" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                const isStreamingBubble = i === messages.length - 1 && streamingIntoLast;
                const empty = isStreamingBubble ? false : m.role === "tutor" && m.content === "";
                return (
                  <div
                    key={m.id}
                    data-testid={isUser ? "ai-tutor-user-message" : "ai-tutor-tutor-message"}
                    className={cn("flex gap-3", isUser && "flex-row-reverse")}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isUser
                          ? "bg-[#2e1065] text-violet-200"
                          : "bg-gradient-to-br from-violet-600 to-blue-500 text-white",
                      )}
                    >
                      {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                    </span>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%]",
                        isUser
                          ? "rounded-tr-sm bg-[#2e1065] text-violet-50"
                          : "rounded-tl-sm border border-[#26262b] bg-[#1e1e24]",
                      )}
                    >
                      {!isUser ? (
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                          {m.mode}
                        </p>
                      ) : null}
                      {empty ? (
                        <span className="inline-flex gap-1 py-1" data-testid="ai-tutor-thinking">
                          <span className="size-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                          <span className="size-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:120ms]" />
                          <span className="size-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:240ms]" />
                        </span>
                      ) : isStreamingBubble ? (
                        <div data-testid="ai-tutor-streaming">
                          <RichContent content={streamText ?? ""} />
                          <span className="caret-blink ml-0.5 inline-block h-4 w-1.5 rounded-sm bg-violet-400 align-middle" />
                        </div>
                      ) : isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                      ) : (
                        <RichContent content={m.content} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* prompt chips + input */}
        <div className="border-t border-[#232327] bg-[#131316] px-4 pb-4 pt-3">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2.5 flex items-center justify-between gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              <div className="flex gap-2 shrink-0">
                {(active?.title.startsWith("Study: ")
                  ? [
                      {
                        id: "dp1",
                        label: "📄 Summarize document",
                        prompt: `Can you give me a structured summary of the key takeaways from "${active.title.replace("Study: ", "")}"?`,
                      },
                      {
                        id: "dp2",
                        label: "💡 Explain key concepts",
                        prompt: `What are the core technical concepts, equations, and definitions in "${active.title.replace("Study: ", "")}"?`,
                      },
                      {
                        id: "dp3",
                        label: "📝 Quiz me (3 MCQs)",
                        prompt: `Create a 3-question conceptual multiple-choice quiz with explanations based on "${active.title.replace("Study: ", "")}".`,
                      },
                      {
                        id: "dp4",
                        label: "🎯 Potential exam questions",
                        prompt: `What are the top 3 exam questions likely to be asked from "${active.title.replace("Study: ", "")}"?`,
                      },
                    ]
                  : suggestedPrompts
                ).map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    data-testid={`ai-tutor-suggested-chip-${i}`}
                    onClick={() => send(p.prompt)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-all active:scale-95",
                      active?.title.startsWith("Study: ")
                        ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400 hover:text-white"
                        : "border-[#4c1d95]/50 bg-[#1c1929] text-zinc-300 hover:border-violet-500 hover:text-white"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {active?.title.startsWith("Study: ") && (
                <div className="ml-auto hidden sm:flex items-center gap-1.5 shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSetGroundingScope(groundingScope === "doc-only" ? "hybrid" : "doc-only")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95",
                      groundingScope === "doc-only"
                        ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400"
                        : "border-violet-500/40 bg-violet-950/40 text-violet-300 hover:border-violet-400"
                    )}
                    title="Click to toggle between Document Only and Doc + General AI"
                  >
                    {groundingScope === "doc-only" ? (
                      <>
                        <BookOpen className="size-3 text-emerald-400" />
                        <span>Document Only</span>
                      </>
                    ) : (
                      <>
                        <Globe className="size-3 text-violet-400" />
                        <span>Doc + General AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 rounded-2xl border border-[#2e2e33] bg-[#181818] p-2 transition-colors focus-within:border-violet-600"
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    toast.info(`Extracting text from "${f.name}"...`);
                    try {
                      const text = await extractPdfText(f);
                      if (text) {
                        setExtractedDocText(text);
                        try {
                          sessionStorage.setItem(`ss.pdfText.${encodeURIComponent(f.name)}`, text.slice(0, 40000));
                        } catch {}
                        toast.success(`Attached & Indexed "${f.name}"`, {
                          description: `${text.length.toLocaleString()} characters indexed for Socrates.`,
                        });
                        setInput((prev) =>
                          prev
                            ? `${prev}\n\nCan you give me an overview and explain "${f.name}"?`
                            : `I've uploaded "${f.name}". Can you give me a structured overview and explain its core architecture and concepts?`
                        );
                      } else {
                        toast.success(`Attached "${f.name}"`);
                        setInput((prev) =>
                          prev
                            ? `${prev}\n\n[Attached notes from "${f.name}"]`
                            : `Can you explain the main concepts from "${f.name}"?`
                        );
                      }
                    } catch {
                      toast.success(`Attached "${f.name}"`);
                    }
                  }
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                data-testid="ai-tutor-attach-button"
                aria-label="Attach a file"
                onClick={(e) =>
                  (e.currentTarget.previousElementSibling as HTMLInputElement)?.click()
                }
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-[#26262b] hover:text-violet-300"
              >
                <FileText className="size-5" />
              </button>
              <textarea
                data-testid="ai-tutor-message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={
                  active?.title.startsWith("Study: ")
                    ? groundingScope === "doc-only"
                      ? `Ask anything strictly from "${active.title.replace("Study: ", "")}"...`
                      : `Ask about "${active.title.replace("Study: ", "")}" or broader tech concepts...`
                    : "Ask Socrates anything — explain, summarize, or quiz me…"
                }
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-zinc-100 outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                data-testid="ai-tutor-send-button"
                disabled={!input.trim() || streamText !== null}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                <Send className="size-4.5" />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-zinc-500">
              Live AI inference powered by {model.startsWith("groq") ? "Groq Cloud" : "Google Gemini"} · {active?.title.startsWith("Study: ") ? (groundingScope === "doc-only" ? "Strict Document Grounding" : "Hybrid Document + General AI") : "Freeform AI Learning"}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
