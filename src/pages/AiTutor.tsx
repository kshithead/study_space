import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, FileText, History, Plus, Send, Sparkles, Trash2, User } from "lucide-react";
import {
  suggestedPrompts,
  simulatedTutorResponse,
  tutorModes,
  user as mockUser,
} from "@/data/mockData";
import type { ChatSession, TutorMode } from "@/data/mockData";
import { useAppState } from "@/store/appState";
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
  const { chatSessions, upsertChatSession, deleteChatSession, user: currentUser } = useAppState();
  const user = currentUser ?? mockUser;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<TutorMode>("Socratic Mentor");
  const [model, setModel] = useState("tutor");
  const [input, setInput] = useState("");
  const [streamText, setStreamText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = chatSessions.find((s) => s.id === activeId) ?? null;
  const sortedSessions = useMemo(
    () => [...chatSessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [chatSessions],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages.length, streamText]);

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
    setStreamText("Thinking and retrieving relevant notes...");

    try {
      const apiBase =
        import.meta.env.VITE_API_URL ||
        (typeof window !== "undefined" && window.location.protocol === "https:"
          ? ""
          : "http://127.0.0.1:8000");

      let response: Response | null = null;
      if (apiBase || window.location.protocol !== "https:") {
        response = await fetch(`${apiBase}/api/study/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text }),
        });
      }
      
      let full = "";
      if (response && response.ok) {
        const data = await response.json();
        full = data.answer || "No response received from tutor.";
        if (data.sources && data.sources.length > 0) {
          full += "\n\n**Sources & Citations:**\n" + data.sources.map((s: any) => `- ${s.title || s.filename} (Page ${s.page})`).join("\n");
        }
      } else {
        full = simulatedTutorResponse(text);
      }

      const words = full.split(" ");
      let i = 0;
      const timer = window.setInterval(() => {
        i += 2;
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
      }, streamInterval);

    } catch (err) {
      console.warn("Backend unavailable, falling back to simulated prototype:", err);
      const full = simulatedTutorResponse(text);
      upsertChatSession({
        ...base,
        updatedAt: Date.now(),
        messages: [...base.messages, userMsg, { ...tutorMsg, content: full }],
      });
      setStreamText(null);
    }
  };

  const newChat = () => {
    if (streamText !== null) return;
    setActiveId(null);
    setInput("");
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
          {groups.map(
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
            <p className="text-[11px] text-zinc-500">Prototype mode · replies are simulated</p>
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
              <SelectTrigger data-testid="ai-tutor-model-select" size="sm" className="hidden w-40 border-[#2e2e33] bg-[#181818] text-xs sm:flex">
                <SelectValue>
                  {(v: string | null) => (v === "research" ? "Deep Research (demo)" : "Studyspace Tutor")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border-[#2e2e33] bg-popover">
                <SelectItem value="tutor">Studyspace Tutor</SelectItem>
                <SelectItem value="research">Deep Research (demo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
                Ask anything, attach your notes, or start from one of the suggestions.
                This is the frontend prototype — responses are canned demos.
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
            <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  data-testid={`ai-tutor-suggested-chip-${i}`}
                  onClick={() => send(p.prompt)}
                  className="shrink-0 rounded-full border border-[#4c1d95]/50 bg-[#1c1929] px-3 py-1.5 text-xs text-zinc-300 transition-all hover:border-violet-500 hover:text-white active:scale-95"
                >
                  {p.label}
                </button>
              ))}
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
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f)
                    toast.info("Attachments are a prototype preview", {
                      description: `“${f.name}” noted — file parsing arrives with the backend stage.`,
                    });
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
                placeholder="Ask Socrates anything — explain, summarize, or quiz me…"
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
            <p className="mt-2 text-center text-[11px] text-zinc-600">
              Simulated responses for the frontend prototype — no model calls, everything stays in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
