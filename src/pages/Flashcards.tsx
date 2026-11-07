import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Shuffle,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { decks as seedDecks, generateDeckFromTopic } from "@/data/mockData";
import type { Deck, Flashcard } from "@/data/mockData";
import { ProgressBar, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const srsOptions = [
  { label: "Again", interval: "1m", cls: "bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25" },
  { label: "Hard", interval: "10m", cls: "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25" },
  { label: "Good", interval: "1d", cls: "bg-violet-500/15 text-violet-300 border-violet-500/40 hover:bg-violet-500/25" },
  { label: "Easy", interval: "4d", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25" },
];

export default function Flashcards() {
  const [userDecks, setUserDecks] = useState<Deck[]>(seedDecks);
  const [activeDeckId, setActiveDeckId] = useState(seedDecks[0].id);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [topic, setTopic] = useState("");

  const deck = userDecks.find((d) => d.id === activeDeckId) ?? userDecks[0];
  const card: Flashcard | undefined = deck.cards[cardIdx] ?? deck.cards[0];

  const nextCard = useCallback(
    (fromSrs = false) => {
      if (fromSrs && card) setReviewedIds((prev) => new Set(prev).add(card.id));
      setFlipped(false);
      setCardIdx((i) => (i + 1) % deck.cards.length);
    },
    [card, deck.cards.length],
  );

  const prevCard = useCallback(() => {
    setFlipped(false);
    setCardIdx((i) => (i - 1 + deck.cards.length) % deck.cards.length);
  }, [deck.cards.length]);

  // keyboard: space flips, arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        nextCard();
      } else if (e.key === "ArrowLeft") {
        prevCard();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextCard, prevCard]);

  const shuffleDeck = () => {
    setUserDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deck.id) return d;
        const cards = [...d.cards];
        for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return { ...d, cards };
      }),
    );
    setCardIdx(0);
    setFlipped(false);
    toast.success("Deck shuffled");
  };

  const generateDeck = () => {
    const t = topic.trim();
    if (!t) return;
    const newDeck: Deck = {
      id: `deck-gen-${Date.now()}`,
      title: t.length > 34 ? `${t.slice(0, 34)}…` : t,
      subtitle: "AI generated · just now",
      gradient: "from-violet-600 to-blue-600",
      cards: generateDeckFromTopic(t),
    };
    setUserDecks((prev) => [newDeck, ...prev]);
    setActiveDeckId(newDeck.id);
    setCardIdx(0);
    setFlipped(false);
    setReviewedIds(new Set());
    setGeneratorOpen(false);
    setTopic("");
    toast.success(`AI drafted ${newDeck.cards.length} cards`, {
      description: `“${newDeck.title}” — refine the wording to lock it in. (Prototype generator)`,
    });
  };

  const selectDeck = (id: string) => {
    setActiveDeckId(id);
    setCardIdx(0);
    setFlipped(false);
    setReviewedIds(new Set());
  };

  const masteryPct = Math.round((reviewedIds.size / deck.cards.length) * 100);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Flashcards"
        subtitle="Spaced-repetition review with 3D flip cards — space or click to flip"
      >
        <Button
          data-testid="flashcard-deck-generator-open"
          onClick={() => setGeneratorOpen(true)}
          className="gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90"
        >
          <Wand2 className="size-4" /> Generate deck
        </Button>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* deck list */}
        <aside className="min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {userDecks.map((d) => (
              <button
                key={d.id}
                type="button"
                data-testid={`flashcard-deck-select-${d.id}`}
                onClick={() => selectDeck(d.id)}
                className={cn(
                  "group flex w-52 shrink-0 items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.98] lg:w-full",
                  d.id === deck.id
                    ? "border-violet-600/60 bg-[#1f1d2b]"
                    : "border-[#27272a] bg-card hover:border-[#3f3f46]",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                    d.gradient,
                  )}
                >
                  <Layers className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-100">
                    {d.title}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {d.cards.length} cards · {d.subtitle}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#27272a] bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Today's review
            </p>
            <p className="mt-1.5 text-sm text-zinc-300" data-testid="flashcard-review-progress-text">
              {reviewedIds.size} of {deck.cards.length} cards reviewed
            </p>
            <ProgressBar value={masteryPct} glow className="mt-2" />
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Sparkles className="size-3 text-violet-400" />
              Rate honestly — the schedule depends on it.
            </p>
          </div>
        </aside>

        {/* card stage */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground" data-testid="flashcard-counter">
              Card {cardIdx + 1} of {deck.cards.length} ·{" "}
              <span className="text-zinc-400">{deck.title}</span>
            </p>
            <button
              type="button"
              onClick={shuffleDeck}
              data-testid="flashcard-shuffle-btn"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#2e2e33] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-violet-600/50 hover:text-white active:scale-95"
            >
              <Shuffle className="size-3.5" /> Shuffle
            </button>
          </div>

          {card ? (
            <div className="flip-scene mx-auto h-80 max-w-2xl select-none sm:h-96">
              <div
                data-testid="flashcard-card-active"
                role="button"
                tabIndex={0}
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
                className={cn("flip-inner cursor-pointer", flipped && "flipped")}
              >
                {/* front */}
                <div
                  className={cn(
                    "flip-face flex flex-col rounded-3xl border border-violet-600/40 bg-gradient-to-br from-[#1c1828] to-[#151321] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
                  )}
                >
                  <span className="w-fit rounded-full bg-[#2e1065] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-300">
                    {card.tag}
                  </span>
                  <p className="mt-auto font-heading text-xl font-semibold leading-snug text-zinc-50 sm:text-2xl">
                    {card.front}
                  </p>
                  <p className="mt-auto text-xs text-zinc-500">
                    Click or press Space to reveal the answer
                  </p>
                </div>
                {/* back */}
                <div className="flip-face flip-face-back flex flex-col rounded-3xl border border-blue-600/40 bg-gradient-to-br from-[#131a2a] to-[#12141f] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                  <span className="w-fit rounded-full bg-[#172554] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                    Answer
                  </span>
                  <p className="my-auto text-[15px] leading-relaxed text-zinc-100 sm:text-base">
                    {card.back}
                  </p>
                  <p className="text-xs text-zinc-500">Rate your recall below</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* controls */}
          <div className="mx-auto mt-5 max-w-2xl space-y-3">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                data-testid="flashcard-prev-btn"
                onClick={prevCard}
                aria-label="Previous card"
                className="flex size-11 items-center justify-center rounded-full border border-[#2e2e33] bg-card text-zinc-300 transition-all hover:border-violet-600/50 hover:text-white active:scale-90"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                data-testid="flashcard-flip-btn"
                onClick={() => setFlipped((f) => !f)}
                className="inline-flex items-center gap-2 rounded-full border border-violet-600/60 bg-[#1f1d2b] px-5 py-2.5 text-sm font-medium text-violet-200 transition-all hover:bg-[#262239] active:scale-95"
              >
                <ArrowLeftRight className="size-4" /> Flip card
              </button>
              <button
                type="button"
                data-testid="flashcard-next-btn"
                onClick={() => nextCard()}
                aria-label="Next card"
                className="flex size-11 items-center justify-center rounded-full border border-[#2e2e33] bg-card text-zinc-300 transition-all hover:border-violet-600/50 hover:text-white active:scale-90"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {srsOptions.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  data-testid={`flashcard-srs-${s.label.toLowerCase()}`}
                  onClick={() => {
                    nextCard(true);
                    toast.success(`Scheduled: ${s.interval}`, {
                      description: `${s.label} · ${deck.title} · card returns later`,
                    });
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-center transition-all active:scale-95",
                    s.cls,
                  )}
                >
                  <span className="block text-sm font-semibold">{s.label}</span>
                  <span className="block text-[11px] opacity-75">{s.interval}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* generator dialog */}
      <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
        <DialogContent className="border-[#2e2e33] bg-[#181818] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Wand2 className="size-4 text-violet-400" /> Generate a flashcard deck
            </DialogTitle>
            <DialogDescription>
              Prototype generator: give a topic and STUDYSPACE drafts five atomic starter
              cards you can refine.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              data-testid="flashcard-generator-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Physics, Kubernetes networking…"
              onKeyDown={(e) => e.key === "Enter" && generateDeck()}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                data-testid="flashcard-generator-cancel"
                onClick={() => setGeneratorOpen(false)}
              >
                <X className="mr-1 size-4" /> Cancel
              </Button>
              <Button
                data-testid="flashcard-generator-submit"
                onClick={generateDeck}
                disabled={!topic.trim()}
                className="bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90"
              >
                <Sparkles className="mr-1 size-4" /> Generate 5 cards
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
