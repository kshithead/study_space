// ─────────────────────────────────────────────────────────────────────────────
// STUDYSPACE — frontend prototype mock dataset.
// Stage 1 is frontend-only: every piece of content below is browser-side sample
// data. No backend, database or auth exists behind these objects (yet).
// ─────────────────────────────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  duration: string; // "12:34" for video, "8 min" for reading
  kind: "video" | "quiz" | "reading";
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorTitle: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  rating: number;
  students: string;
  totalDuration: string;
  thumbnail: string;
  description: string;
  tags: string[];
  enrolled: boolean;
  updated: string;
  modules: CourseModule[];
}

// Deterministic lesson ids: `${courseId}-m${moduleNo}-l${lessonNo}`
const lessons = (
  courseId: string,
  moduleNo: number,
  defs: Array<[title: string, duration: string, kind?: Lesson["kind"]]>,
): Lesson[] =>
  defs.map(([title, duration, kind], i) => ({
    id: `${courseId}-m${moduleNo}-l${i + 1}`,
    title,
    duration,
    kind: kind ?? "video",
  }));

const u = (photo: string) =>
  `https://images.unsplash.com/${photo}?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=800&h=450`;

export const allCourses: Course[] = [
  {
    id: "c1",
    title: "Neural Networks & Deep Learning Foundations",
    instructor: "Alex Rivera",
    instructorTitle: "DeepMind Fellow",
    category: "Artificial Intelligence",
    level: "Intermediate",
    rating: 4.9,
    students: "68.2k",
    totalDuration: "9h 40m",
    thumbnail: u("photo-1674027444485-cec3da58eef4"),
    description:
      "Build a rock-solid mental model of how neural networks actually learn. From the single perceptron to backpropagation, optimizers and modern architectures — each concept is paired with a hands-on lab so theory never floats away.",
    tags: ["Deep Learning", "Backpropagation", "CNNs", "Optimizers"],
    enrolled: true,
    updated: "Jan 2026",
    modules: [
      {
        id: "c1-m1",
        title: "Foundations of Neural Computation",
        lessons: lessons("c1", 1, [
          ["The Neuron & the Perceptron", "12:34"],
          ["Activation Functions, Deep Dive", "18:02"],
          ["Gradient Descent Intuition", "15:47"],
          ["Lab: Build a Perceptron from Scratch", "22:10"],
        ]),
      },
      {
        id: "c1-m2",
        title: "Backpropagation & Training",
        lessons: lessons("c1", 2, [
          ["Computational Graphs", "14:21"],
          ["Backpropagation Step by Step", "21:33"],
          ["Loss Functions Compared", "12:08"],
          ["Checkpoint Quiz: Training Dynamics", "10 min", "quiz"],
          ["Optimizers: From SGD to Adam", "19:45"],
        ]),
      },
      {
        id: "c1-m3",
        title: "Modern Architectures",
        lessons: lessons("c1", 3, [
          ["CNNs & Feature Maps", "24:12"],
          ["RNNs and the Road to Attention", "20:31"],
          ["Transfer Learning Playbook", "16:59"],
          ["Final Project Brief", "8 min", "reading"],
        ]),
      },
    ],
  },
  {
    id: "c2",
    title: "LLM Fine-Tuning & Prompt Engineering Mastery",
    instructor: "Kavya Patel",
    instructorTitle: "Lead AI Researcher",
    category: "GenAI & LLMs",
    level: "Advanced",
    rating: 4.9,
    students: "55.1k",
    totalDuration: "7h 15m",
    thumbnail: u("photo-1677442136019-21780ecad995"),
    description:
      "Take large language models from zero-shot to production-grade. LoRA fine-tuning, evaluation harnesses, and prompt patterns that survive real users.",
    tags: ["LLMs", "Prompting", "LoRA", "Evaluation"],
    enrolled: true,
    updated: "Feb 2026",
    modules: [
      {
        id: "c2-m1",
        title: "Prompting as Programming",
        lessons: lessons("c2", 1, [
          ["Anatomy of a Production Prompt", "13:05"],
          ["Few-shot & Chain-of-thought Patterns", "17:40"],
          ["Structured Output & Tool Calls", "15:22"],
        ]),
      },
      {
        id: "c2-m2",
        title: "Fine-Tuning in Practice",
        lessons: lessons("c2", 2, [
          ["When to Fine-tune vs Prompt", "11:48"],
          ["LoRA & QLoRA, Visualized", "21:06"],
          ["Building an Eval Harness", "18:30"],
          ["Capstone: Ship a Domain Assistant", "12:15"],
        ]),
      },
    ],
  },
  {
    id: "c3",
    title: "Full-Stack Modern AI Applications",
    instructor: "Dr. Sarah Chen",
    instructorTitle: "Stanford AI Lab",
    category: "Full-Stack Web Dev",
    level: "Intermediate",
    rating: 4.8,
    students: "42.8k",
    totalDuration: "11h 30m",
    thumbnail: u("photo-1548092372-0d1bd40894a3"),
    description:
      "Design, build and ship AI products end-to-end: typed APIs, streaming UIs, vector search and deployment. The course every product engineer wishes existed.",
    tags: ["TypeScript", "RAG", "Streaming", "Deployment"],
    enrolled: true,
    updated: "Dec 2025",
    modules: [
      {
        id: "c3-m1",
        title: "Foundations",
        lessons: lessons("c3", 1, [
          ["Architecture of an AI App", "14:00"],
          ["Typed API Layer with FastAPI", "19:20"],
          ["Streaming Responses to React", "16:45"],
          ["Lab: First Chat Feature", "20:10"],
        ]),
      },
      {
        id: "c3-m2",
        title: "Retrieval & Memory",
        lessons: lessons("c3", 2, [
          ["Embeddings & Vector Search", "17:30"],
          ["RAG Pipeline from Scratch", "22:05"],
          ["Conversation Memory Patterns", "13:40"],
        ]),
      },
    ],
  },
  {
    id: "c4",
    title: "High-Throughput Distributed Systems",
    instructor: "Marcus Vance",
    instructorTitle: "Ex-Principal Engineer, AWS",
    category: "System Architecture",
    level: "Advanced",
    rating: 4.8,
    students: "31.4k",
    totalDuration: "10h 05m",
    thumbnail: u("photo-1504639725590-34d0984388bd"),
    description:
      "Consensus, sharding, queues and the trade-offs nobody tells you about until 3am. Case studies from systems serving millions of requests per second.",
    tags: ["Consensus", "Sharding", "Kafka", "Latency"],
    enrolled: false,
    updated: "Nov 2025",
    modules: [
      {
        id: "c4-m1",
        title: "Primitives",
        lessons: lessons("c4", 1, [
          ["Replication & Consistency Models", "18:00"],
          ["Leader Election & Raft", "21:15"],
          ["Partitioning Strategies", "16:50"],
        ]),
      },
      {
        id: "c4-m2",
        title: "At Scale",
        lessons: lessons("c4", 2, [
          ["Backpressure & Load Shedding", "14:25"],
          ["Event Sourcing in Anger", "19:35"],
          ["Case Study: A Global Feed", "22:10"],
        ]),
      },
    ],
  },
  {
    id: "c5",
    title: "Data Engineering at Scale with Spark & Kafka",
    instructor: "Elena Rostova",
    instructorTitle: "Chief Data Architect",
    category: "Data Science",
    level: "Intermediate",
    rating: 4.7,
    students: "24.9k",
    totalDuration: "8h 45m",
    thumbnail: u("photo-1640163561331-1b68a6474957"),
    description:
      "Batch and streaming pipelines that don't fall over: Spark internals, Kafka topology, lakehouse patterns and data quality gates.",
    tags: ["Spark", "Kafka", "Lakehouse", "SQL"],
    enrolled: false,
    updated: "Oct 2025",
    modules: [
      {
        id: "c5-m1",
        title: "Batch World",
        lessons: lessons("c5", 1, [
          ["Spark Internals in 20 Minutes", "20:00"],
          ["Optimizing Shuffles & Skew", "17:45"],
          ["Lakehouse Tables Done Right", "15:30"],
        ]),
      },
      {
        id: "c5-m2",
        title: "Streaming World",
        lessons: lessons("c5", 2, [
          ["Kafka Topology Design", "18:20"],
          ["Exactly-once, Honestly", "16:10"],
          ["Project: Realtime Dashboard", "21:00"],
        ]),
      },
    ],
  },
  {
    id: "c6",
    title: "Cognitive Science & Memory Retention",
    instructor: "Prof. David Thorne",
    instructorTitle: "Learning Scientist",
    category: "Neuroscience",
    level: "All Levels",
    rating: 4.9,
    students: "19.3k",
    totalDuration: "6h 20m",
    thumbnail: u("photo-1760612484753-2311a768798a"),
    description:
      "The science behind learning how to learn: spaced repetition, retrieval practice, interleaving and the neuroscience of durable memory.",
    tags: ["Spaced Repetition", "Retrieval", "Habits", "Focus"],
    enrolled: false,
    updated: "Sep 2025",
    modules: [
      {
        id: "c6-m1",
        title: "How Memory Works",
        lessons: lessons("c6", 1, [
          ["Encoding, Storage, Retrieval", "13:15"],
          ["The Forgetting Curve", "11:40"],
          ["Spacing & Interleaving Effects", "15:05"],
        ]),
      },
      {
        id: "c6-m2",
        title: "Learning Systems",
        lessons: lessons("c6", 2, [
          ["Building a Review Habit", "12:30"],
          ["Deep Work & Attention Residue", "14:20"],
          ["Design Your Personal Curriculum", "10:45"],
        ]),
      },
    ],
  },
  {
    id: "c7",
    title: "React 19 Mastery: Hooks to Server Components",
    instructor: "Jonas Weber",
    instructorTitle: "Open Source Maintainer",
    category: "Full-Stack Web Dev",
    level: "Intermediate",
    rating: 4.8,
    students: "37.6k",
    totalDuration: "7h 50m",
    thumbnail: u("photo-1622151834677-70f982c9adef"),
    description:
      "Modern React from first principles: hooks mental models, concurrent rendering, data fetching patterns and the server components shift.",
    tags: ["React", "Hooks", "RSC", "TypeScript"],
    enrolled: false,
    updated: "Jan 2026",
    modules: [
      {
        id: "c7-m1",
        title: "Hooks in Depth",
        lessons: lessons("c7", 1, [
          ["Rendering & Reconciliation", "15:10"],
          ["useState, useReducer, useOptimistic", "18:25"],
          ["Effects Without Tears", "14:55"],
        ]),
      },
      {
        id: "c7-m2",
        title: "The Server Era",
        lessons: lessons("c7", 2, [
          ["Server Components Explained", "17:35"],
          ["Streaming & Suspense Boundaries", "13:20"],
          ["Project: Realtime Board", "19:45"],
        ]),
      },
    ],
  },
  {
    id: "c8",
    title: "Financial Engineering & Quantitative Trading",
    instructor: "Dr. Amara Okafor",
    instructorTitle: "Former Quant, Citadel",
    category: "Financial Engineering",
    level: "Advanced",
    rating: 4.7,
    students: "16.8k",
    totalDuration: "9h 10m",
    thumbnail: u("photo-1619296330981-b882d7e93425"),
    description:
      "From stochastic calculus intuition to backtesting engines. Build a research workflow the way professional desks actually do.",
    tags: ["Python", "Statistics", "Backtesting", "Options"],
    enrolled: false,
    updated: "Aug 2025",
    modules: [
      {
        id: "c8-m1",
        title: "Quant Toolkit",
        lessons: lessons("c8", 1, [
          ["Returns, Risk & Randomness", "16:00"],
          ["Time Series that Matter", "19:30"],
          ["Portfolio Theory Refreshed", "15:45"],
        ]),
      },
      {
        id: "c8-m2",
        title: "Strategy Lab",
        lessons: lessons("c8", 2, [
          ["Backtesting Without Self-Deception", "18:10"],
          ["Options in Practice", "20:25"],
          ["Capstone: Momentum Strategy", "17:00"],
        ]),
      },
    ],
  },
  {
    id: "c9",
    title: "Docker & Kubernetes for Developers",
    instructor: "Priya Nair",
    instructorTitle: "Platform Engineer",
    category: "Cloud Architecture",
    level: "Beginner",
    rating: 4.8,
    students: "48.3k",
    totalDuration: "6h 55m",
    thumbnail: u("photo-1548393488-ae8f117cbc1c"),
    description:
      "Containers without cargo-culting: images, networking, compose, then a gentle but honest path into Kubernetes.",
    tags: ["Docker", "Kubernetes", "CI/CD", "Networking"],
    enrolled: true,
    updated: "Feb 2026",
    modules: [
      {
        id: "c9-m1",
        title: "Containers 101",
        lessons: lessons("c9", 1, [
          ["Images, Layers & Caches", "12:45"],
          ["Volumes & Networking", "14:30"],
          ["Compose for Local Stacks", "11:55"],
        ]),
      },
      {
        id: "c9-m2",
        title: "Kubernetes, Gently",
        lessons: lessons("c9", 2, [
          ["Pods, Deployments, Services", "16:20"],
          ["ConfigMaps & Secrets", "10:40"],
          ["Ship a Real App", "18:05"],
        ]),
      },
    ],
  },
  {
    id: "c10",
    title: "Math for Machine Learning: Linear Algebra",
    instructor: "Dr. Sofia Marchetti",
    instructorTitle: "Applied Mathematician",
    category: "Machine Learning",
    level: "Beginner",
    rating: 4.9,
    students: "29.7k",
    totalDuration: "8h 30m",
    thumbnail: u("photo-1622295023825-6e319464b810"),
    description:
      "Vectors, matrices and eigen-things — taught visually, with every idea tied to the ML algorithm where it earns its keep.",
    tags: ["Linear Algebra", "Eigenvectors", "SVD", "Intuition"],
    enrolled: false,
    updated: "Jul 2025",
    modules: [
      {
        id: "c10-m1",
        title: "Vectors & Matrices",
        lessons: lessons("c10", 1, [
          ["Vectors as Data", "13:35"],
          ["Matrices as Transformations", "17:15"],
          ["Dot Products & Similarity", "12:50"],
        ]),
      },
      {
        id: "c10-m2",
        title: "The Good Stuff",
        lessons: lessons("c10", 2, [
          ["Eigenvalues, Intuitively", "15:55"],
          ["SVD & Compression", "18:40"],
          ["Project: PCA by Hand", "16:25"],
        ]),
      },
    ],
  },
  {
    id: "c11",
    title: "Generative Image Models: Diffusion Explained",
    instructor: "Leo Tanaka",
    instructorTitle: "Creative ML Engineer",
    category: "GenAI & LLMs",
    level: "Intermediate",
    rating: 4.6,
    students: "21.5k",
    totalDuration: "5h 45m",
    thumbnail: u("photo-1504639725590-34d0984388bd"),
    description:
      "How stable diffusion actually works: latents, schedulers, conditioning — plus hands-on image generation labs and control techniques.",
    tags: ["Diffusion", "Latent Space", "ControlNet", "Labs"],
    enrolled: false,
    updated: "Jun 2025",
    modules: [
      {
        id: "c11-m1",
        title: "Diffusion Basics",
        lessons: lessons("c11", 1, [
          ["Noise, Denoise, Repeat", "14:20"],
          ["Latents & Autoencoders", "16:35"],
          ["Schedulers Compared", "12:15"],
        ]),
      },
      {
        id: "c11-m2",
        title: "Control & Craft",
        lessons: lessons("c11", 2, [
          ["Prompting & Conditioning", "13:55"],
          ["ControlNet & Layout Control", "17:25"],
          ["Lab: Style Pipeline", "15:45"],
        ]),
      },
    ],
  },
  {
    id: "c12",
    title: "Rust Programming Essentials",
    instructor: "Nadia Hussein",
    instructorTitle: "Systems Engineer",
    category: "System Architecture",
    level: "Beginner",
    rating: 4.8,
    students: "26.1k",
    totalDuration: "7h 35m",
    thumbnail: u("photo-1619296330981-b882d7e93425"),
    description:
      "Ownership, borrowing and lifetimes without the fear. Build real CLI tools and learn why Rust code compiles like it does.",
    tags: ["Rust", "Ownership", "CLI", "Concurrency"],
    enrolled: false,
    updated: "May 2025",
    modules: [
      {
        id: "c12-m1",
        title: "The Borrow Checker is Your Friend",
        lessons: lessons("c12", 1, [
          ["Ownership Rules that Stick", "14:40"],
          ["Borrowing & Lifetimes", "18:55"],
          ["Structs, Enums, Pattern Matching", "15:35"],
        ]),
      },
      {
        id: "c12-m2",
        title: "Real Programs",
        lessons: lessons("c12", 2, [
          ["Error Handling that Scales", "13:25"],
          ["Fearless Concurrency", "17:45"],
          ["Project: Fast CLI Grep", "19:15"],
        ]),
      },
    ],
  },
];

export const getCourse = (id: string) => allCourses.find((c) => c.id === id);

export const courseLessons = (course: Course): Lesson[] =>
  course.modules.flatMap((m) => m.lessons);

export const lessonSeconds = (duration: string): number => {
  if (!duration.includes(":")) return 0;
  const [m, s] = duration.split(":").map(Number);
  return m * 60 + s;
};

export const fmtSeconds = (total: number): string => {
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

/** Lessons already completed when a user first opens the prototype. */
export const completedSeed: Record<string, string[]> = {
  c1: [
    "c1-m1-l1", "c1-m1-l2", "c1-m1-l3", "c1-m1-l4",
    "c1-m2-l1", "c1-m2-l2", "c1-m2-l3",
  ],
  c2: ["c2-m1-l1", "c2-m1-l2"],
  c3: ["c3-m1-l1", "c3-m1-l2", "c3-m1-l3", "c3-m1-l4", "c3-m2-l1", "c3-m2-l2"],
  c9: [
    "c9-m1-l1", "c9-m1-l2", "c9-m1-l3",
    "c9-m2-l1", "c9-m2-l2", "c9-m2-l3",
  ],
};

export const bookmarkSeed: string[] = ["c4", "c6", "c10"];

export const quizScoreSeed: Record<string, { best: number; attempts: number }> = {
  q1: { best: 80, attempts: 2 },
};

// ── Course player extras ─────────────────────────────────────────────────────

export interface TranscriptLine {
  time: string;
  seconds: number;
  text: string;
}

export const sampleTranscript: TranscriptLine[] = [
  { time: "00:00", seconds: 0, text: "Welcome back. Before we dive in, let's place this idea on the map of what we've built so far." },
  { time: "00:42", seconds: 42, text: "At its core, today's concept is a trade-off: we exchange a little precision for a lot of tractability." },
  { time: "01:58", seconds: 118, text: "Notice how the update rule only ever looks local — that's the whole trick, and it's why this scales." },
  { time: "03:26", seconds: 206, text: "Let's write it down concretely. If you pause here and derive it yourself first, the next section will feel inevitable." },
  { time: "05:11", seconds: 311, text: "A common misconception: this is not magic, it's just repeated bookkeeping. Keep the ledger in your head." },
  { time: "07:03", seconds: 423, text: "Now watch what happens when we change one assumption — the entire behaviour flips, which is exactly what we want." },
  { time: "09:37", seconds: 577, text: "In the lab you'll implement this from scratch. Expect it to break twice; that's where the learning lives." },
  { time: "11:20", seconds: 680, text: "Summing up: one local rule, applied relentlessly, produces global structure. See you in the next lesson." },
];

export interface DiscussionComment {
  id: string;
  author: string;
  avatarSeed: string;
  at: string;
  text: string;
  likes: number;
}

export const sampleDiscussion: DiscussionComment[] = [
  {
    id: "d1",
    author: "Maya K.",
    avatarSeed: "MK",
    at: "2 days ago",
    text: "The ledger analogy finally made backprop click for me. Re-deriving it on paper before the lab was absolutely worth it.",
    likes: 47,
  },
  {
    id: "d2",
    author: "Tomás R.",
    avatarSeed: "TR",
    at: "5 days ago",
    text: "Question: at 05:11, why does changing the assumption flip the behaviour rather than just degrade it gracefully?",
    likes: 18,
  },
  {
    id: "d3",
    author: "Ines W.",
    avatarSeed: "IW",
    at: "1 week ago",
    text: "If you're struggling with the lab, print the intermediate values. Watching them settle is weirdly satisfying.",
    likes: 31,
  },
];

// ── AI Tutor ─────────────────────────────────────────────────────────────────

export const tutorModes = [
  "Socratic Mentor",
  "Code Reviewer",
  "ELI5 Simplifier",
  "Exam Drill Sergeant",
] as const;
export type TutorMode = (typeof tutorModes)[number];

export interface ChatMessage {
  id: string;
  role: "user" | "tutor";
  content: string;
  mode: TutorMode;
  at: number;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

const now = Date.now();
const min = 60_000;

export const seedChatSessions: ChatSession[] = [
  {
    id: "s1",
    title: "Backpropagation, intuitively",
    updatedAt: now - 22 * min,
    messages: [
      {
        id: "s1-m1",
        role: "user",
        content: "Explain backpropagation with an analogy",
        mode: "Socratic Mentor",
        at: now - 24 * min,
      },
      {
        id: "s1-m2",
        role: "tutor",
        content: `Great question — and let's earn the answer together rather than hand it over.

**Backpropagation is a company-wide blame-assignment algorithm.** Imagine a factory that ships thousands of products a day. At the end of the line, QA reports: *"the output is 0.8 too sweet."*

- **The loss** is that QA report — a single number describing how wrong the product is.
- **The forward pass** is production: raw materials (inputs) flow through stations (layers) and become the product.
- **Backpropagation** walks the line *backwards*. Each station asks: "If I had adjusted my knob a little, how much would the final sweetness have changed?" That local sensitivity is the **gradient**.
- **The optimizer** (SGD, Adam) is the manager who actually turns each knob, a tiny bit, in the direction that reduces the complaint.

One subtlety people miss: each station only needs *local* information plus the memo passed to it from downstream. Nobody needs a global picture — that's why it scales to billions of knobs.

**Quick check before you go:** in this analogy, what would a *learning rate* of 5.0 correspond to physically?`,
        mode: "Socratic Mentor",
        at: now - 22 * min,
      },
    ],
  },
  {
    id: "s2",
    title: "Docker practice questions",
    updatedAt: now - 26 * 60 * 60 * 1000,
    messages: [
      {
        id: "s2-m1",
        role: "user",
        content: "Generate 5 practice MCQs on Docker",
        mode: "Exam Drill Sergeant",
        at: now - 26 * 60 * 60 * 1000 - 2 * min,
      },
      {
        id: "s2-m2",
        role: "tutor",
        content: `Five rounds, no mercy. Answers at the bottom.

1. **What does a Dockerfile instruction \`COPY . .\` do on rebuild?**
   a) Reuses the cache unconditionally  b) Invalidates when file checksums change  c) Copies only changed layers

2. **Which is true about image layers?**
   a) They are mutable  b) Each is a full filesystem copy  c) They are shared between images

3. **\`docker run -p 8080:80\` means:**
   a) container:80 → host:8080  b) host:80 → container:8080  c) both directions

4. **A volume differs from a bind mount because it:**
   a) is managed by Docker in its storage area  b) is faster by definition  c) cannot be backed up

5. **Multi-stage builds mainly exist to:**
   a) run tests twice  b) keep build tools out of the final image  c) support ARM

**Answers:** 1-b, 2-c, 3-a, 4-a, 5-b. Score 4+ and you've earned the next lesson; 3 or less — rewatch "Images, Layers & Caches".`,
        mode: "Exam Drill Sergeant",
        at: now - 26 * 60 * 60 * 1000,
      },
    ],
  },
];

export const suggestedPrompts: Array<{ id: string; label: string; prompt: string }> = [
  {
    id: "p1",
    label: "Explain Backpropagation with an analogy",
    prompt: "Explain backpropagation with an analogy",
  },
  {
    id: "p2",
    label: "Generate 5 practice MCQs on Docker",
    prompt: "Generate 5 practice MCQs on Docker",
  },
  {
    id: "p3",
    label: "Summarize transformer attention",
    prompt: "Summarize how transformer attention works",
  },
  {
    id: "p4",
    label: "Debug my React Hook snippet",
    prompt: "Debug this React hook: my useEffect refetches forever",
  },
];

/** Keyword-routed canned replies — clearly a prototype, no model behind it. */
export function simulatedTutorResponse(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("backprop") || p.includes("gradient")) {
    return `Here's the cleanest way I know to see it.

**One sentence:** backpropagation is the chain rule, applied backwards through the graph of your computation, to ask every parameter *"how much were you responsible for the error?"*

The mechanics:

- The **forward pass** stores every intermediate value — no recomputation later.
- The **loss** produces the first gradient at the output.
- Each node multiplies incoming gradient by its **local derivative** and passes it upstream.
- The **optimizer** nudges parameters opposite to the gradient.

\`\`\`python
# the entire idea, in five lines
def backward(loss_fn, params, x, y, eps=1e-5):
    for p in params:
        loss_hi, loss_lo = loss_fn(x, y, p + eps), loss_fn(x, y, p - eps)
        p.grad = (loss_hi - loss_lo) / (2 * eps)   # chain rule, numerically
\`\`\`

Want to lock it in? Say **"quiz me on backprop"** and I'll drill you on it.`;
  }

  if (p.includes("quiz") || p.includes("mcq") || p.includes("practice question")) {
    return `Three warm-ups, escalating in difficulty:

1. **Concept** — In a 3-layer network, which gradient is computed first and why?
2. **Trap** — A learning rate of 0.5 in an unnormalized loss landscape usually causes what failure mode?
3. **Applied** — Your validation loss plateaus after epoch 2 while training loss keeps dropping. Name two likely causes and one fix for each.

Take your time. When you reply with your answers, I'll grade them and generate five more at exactly your level. (For a full timed test, the **Quizzes** room has a Backpropagation checkpoint with instant explanations.)`;
  }

  if (p.includes("attention") || p.includes("transformer") || p.includes("summar")) {
    return `**Attention in one breath:** every token asks a question (query), every token offers a label (key) and content (value); matching questions to labels decides whose content you read.

- **Softmax(QKᵀ/√d)** — the matching score. The √d keeps gradients from saturating.
- **Weighted sum of V** — the reading. Each token becomes a blend of what it attended to.
- **Multi-head** — several parallel matchings, so one head can track syntax while another tracks position.

Why it won over RNNs: every pair of tokens is one matrix multiply apart — no recurrence, so training parallelizes, and long-range dependencies cost nothing extra.`;
  }

  if (p.includes("react") || p.includes("hook") || p.includes("useeffect") || p.includes("debug")) {
    return `Classic symptom — an effect that refetches forever almost always has an **unstable dependency**. Let's audit it:

\`\`\`tsx
// ❌ refetches forever: options is a new object every render
useEffect(() => {
  fetch(\`/api/items?sort=\${options.sort}\`).then(setItems);
}, [options]);
\`\`\`

Fixes, in order of preference:

1. ** Depend on primitives** — \`[options.sort]\` if that's all you use.
2. **Hoist the constant** — define \`options\` outside the component when static.
3. **Reach for a data library** — TanStack Query keys by value and handles this for you.

Ask yourself the reviewer's question: *"which value changes identity every render?"* That's your bug, 95% of the time.`;
  }

  if (p.includes("docker") || p.includes("kubernetes") || p.includes("k8s")) {
    return `Let's get hands-on. The three Docker ideas that pay rent immediately:

- **Layers are cached by instruction order** — put the rarely-changing step (\`npm ci\`) *before* the frequently-changing one (\`COPY . .\`).
- **Images are immutable templates; containers are live instances** — debug with \`docker exec -it <c> sh\`, not by hacking the image.
- **Bind mounts for dev, volumes for data** — the first gives you hot reload, the second survives \`docker compose down\`.

\`\`\`bash
# rebuild fast: cache keeps the dependency layer
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
\`\`\`

Want five drill-sergeant MCQs on this? Just say the word.`;
  }

  if (p.includes("flashcard") || p.includes("deck") || p.includes("spaced")) {
    return `Deck-building is a skill. Three rules from the learning-science literature:

- **Minimum information principle** — one atomic fact per card. "What does QKᵀ compute?" beats "explain attention".
- **Write cards in your own words** — copying textbook phrasing feels productive and produces recognition, not recall.
- **Route through spaced repetition** — the Flashcards room schedules Again/Hard/Good/Easy intervals for you.

Give me any topic or paste lecture notes and I'll draft a first deck — then prune it ruthlessly.`;
  }

  return `Good question — here's how I'd unpack it.

- **Start from the definition.** Write the concept in one sentence without jargon; if you can't, that's the real gap to attack first.
- **Find the mechanism.** Most "hard" topics are one simple rule applied repeatedly — look for that rule before memorizing consequences.
- **Test the edges.** What breaks it? When would you *not* use it? Experts are defined by their exception-handling.

You can also attach a PDF or a screenshot of your notes with the 📎 button — I'll extract the key ideas and turn them into a study plan. And remember: this is the **frontend prototype** stage, so my replies here are canned demos of the full experience.`;
}

// ── Flashcards ───────────────────────────────────────────────────────────────

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag: string;
}

export interface Deck {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  cards: Flashcard[];
}

export const decks: Deck[] = [
  {
    id: "deck-ai",
    title: "AI & Neural Networks",
    subtitle: "From c1 · Foundations",
    gradient: "from-violet-600 to-indigo-600",
    cards: [
      { id: "ai1", front: "What does an activation function contribute to a network?", back: "Non-linearity. Without it, any stack of layers collapses into a single linear map — depth would buy you nothing.", tag: "Foundations" },
      { id: "ai2", front: "In one sentence, what does backpropagation compute?", back: "The gradient of the loss with respect to every parameter, via the chain rule applied backwards through the computation graph.", tag: "Training" },
      { id: "ai3", front: "Why divide by √d in attention scores?", back: "Dot products of high-dimensional vectors have large variance; scaling by √d keeps the softmax out of its saturated (near one-hot) regime.", tag: "Architectures" },
      { id: "ai4", front: "What problem do residual connections solve?", back: "Degradation in very deep nets: skip paths give gradients a short route to early layers, making 100+ layer training feasible.", tag: "Architectures" },
      { id: "ai5", front: "SGD vs Adam — when would you pick each?", back: "SGD(+momentum) often generalizes slightly better on vision; Adam converges faster and is more forgiving with sparse gradients and transformers.", tag: "Optimizers" },
      { id: "ai6", front: "What does dropout simulate?", back: "Training an implicit ensemble of subnetworks — each step drops units at random, so no single neuron can be relied on exclusively.", tag: "Regularization" },
      { id: "ai7", front: "Define overfitting and one proven remedy.", back: "The model memorizes training noise, so validation error rises while training error falls. Remedies: more data, augmentation, weight decay, early stopping.", tag: "Training" },
      { id: "ai8", front: "What is transfer learning in one line?", back: "Reuse representations learned on a large source task by fine-tuning them on a small target task.", tag: "Practice" },
    ],
  },
  {
    id: "deck-ds",
    title: "Data Structures",
    subtitle: "Interview core · 42 reviews",
    gradient: "from-blue-600 to-cyan-600",
    cards: [
      { id: "ds1", front: "Average and worst-case lookup in a hash map?", back: "Average O(1); worst O(n) when every key collides into one bucket. Good hashing keeps you near the average.", tag: "Hashing" },
      { id: "ds2", front: "When is a linked list preferable to an array?", back: "When you need O(1) insertion/removal at a known node and don't need index-based access or cache-friendly scans.", tag: "Lists" },
      { id: "ds3", front: "Heap invariant?", back: "A complete binary tree where each parent is ≤ (min-heap) or ≥ (max-heap) its children — extrema in O(1), insert/extract in O(log n).", tag: "Heaps" },
      { id: "ds4", front: "BFS vs DFS — what does each guarantee?", back: "BFS explores by distance and finds shortest unweighted paths; DFS dives deep first and is the backbone of cycle/topological algorithms.", tag: "Graphs" },
      { id: "ds5", front: "What property makes a binary search tree useful?", back: "Total ordering: left < node < right, so lookup/insert/delete are O(h) — O(log n) when balanced.", tag: "Trees" },
      { id: "ds6", front: "What does a prefix sum buy you?", back: "O(1) range-sum queries after an O(n) preprocessing pass — the classic time-space trade.", tag: "Tricks" },
    ],
  },
  {
    id: "deck-sys",
    title: "System Design",
    subtitle: "From c4 · At Scale",
    gradient: "from-fuchsia-600 to-violet-600",
    cards: [
      { id: "sys1", front: "CAP in one line each?", back: "Under a network partition you must choose: serve possibly-stale data (availability) or refuse requests (consistency).", tag: "Theory" },
      { id: "sys2", front: "What is backpressure?", back: "Propagating overload signals upstream so producers slow down instead of queuing unboundedly and failing late.", tag: "Reliability" },
      { id: "sys3", front: "When does event sourcing shine?", back: "When the audit log is the product: every state change is an immutable event, and current state is a replay/projection of it.", tag: "Patterns" },
      { id: "sys4", front: "Read-through vs write-through caches?", back: "Read-through fills the cache on miss; write-through updates cache and store on every write — simpler consistency, higher write latency.", tag: "Caching" },
      { id: "sys5", front: "Why do leaders exist in consensus protocols?", back: "They serialize writes through one order, turning a hard multi-party agreement into a replicated log clients can follow.", tag: "Consensus" },
      { id: "sys6", front: "Define idempotency and why APIs need it.", back: "Same request applied twice has the same effect as once — required for safe retries in any network that can duplicate or delay.", tag: "APIs" },
    ],
  },
  {
    id: "deck-mem",
    title: "Neuroscience of Memory",
    subtitle: "From c6 · Learning Systems",
    gradient: "from-emerald-600 to-teal-600",
    cards: [
      { id: "mem1", front: "What is the forgetting curve?", back: "Ebbinghaus's finding that retention decays roughly exponentially after learning — and each successful review flattens the curve.", tag: "Encoding" },
      { id: "mem2", front: "Why is retrieval practice stronger than rereading?", back: "Reconstruction strengthens retrieval routes and exposes gaps; rereading builds recognition, which feels good but transfers poorly.", tag: "Practice" },
      { id: "mem3", front: "What does interleaving do?", back: "Mixes problem types within a session, forcing strategy *selection*, which is what real exams (and real work) demand.", tag: "Practice" },
      { id: "mem4", front: "Define attention residue.", back: "The cognitive carry-over from an unfinished task that degrades focus on the next one — the cost of context switching.", tag: "Focus" },
      { id: "mem5", front: "What makes spacing work?", back: "Slight forgetting between reviews makes retrieval effortful, and that desirable difficulty is what consolidates memory.", tag: "Scheduling" },
    ],
  },
];

export function generateDeckFromTopic(topic: string): Flashcard[] {
  const t = topic.trim() || "New Topic";
  const fronts: Array<[string, string, string]> = [
    [`What is ${t} in one sentence?`, `A crisp definition you can recall under pressure — state *what it is*, then *what problem it solves*. (Prototype card — refine with your own words.)`, "Definition"],
    [`What problem does ${t} solve, and what did people do before it?`, `Anchor ${t} against the pain that preceded it; contrast is what makes definitions stick.`, "Context"],
    [`Walk through ${t} with a concrete example.`, `Pick the smallest example that still exercises the moving parts, and narrate each step aloud.`, "Example"],
    [`What is a common misconception about ${t}?`, `Name the wrong belief, then the correction that defuses it — misconceptions make excellent flashcards.`, "Traps"],
    [`When would you NOT use ${t}?`, `Experts are defined by exceptions. State the boundary conditions and the nearest alternative.`, "Edges"],
  ];
  return fronts.map(([front, back, tag], i) => ({
    id: `gen-${Date.now()}-${i}`,
    front,
    back,
    tag,
  }));
}

// ── Quizzes ──────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  type: "single" | "multi" | "code";
  prompt: string;
  code?: string;
  options: string[];
  answer: number[]; // indices of correct options
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  course: string;
  difficulty: "Easy" | "Medium" | "Hard";
  durationMin: number;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  {
    id: "q1",
    title: "Backpropagation Checkpoint",
    course: "Neural Networks & Deep Learning Foundations",
    difficulty: "Medium",
    durationMin: 8,
    questions: [
      {
        id: "q1-1",
        type: "single",
        prompt: "Backpropagation computes gradients by applying…",
        options: [
          "the chain rule backwards through the computation graph",
          "finite differences at every parameter",
          "the product rule across the forward pass only",
        ],
        answer: [0],
        explanation: "Each node multiplies the incoming gradient by its local derivative — the chain rule, evaluated in reverse topological order.",
      },
      {
        id: "q1-2",
        type: "single",
        prompt: "Why does the forward pass store intermediate values?",
        options: [
          "So they can be reused when computing local derivatives in the backward pass",
          "Because GPU memory must be fully allocated",
          "To allow the learning rate to be tuned later",
        ],
        answer: [0],
        explanation: "The backward pass needs each node's cached output to evaluate its local derivative — recomputing would double the work.",
      },
      {
        id: "q1-3",
        type: "multi",
        prompt: "Select EVERY sign that your learning rate is too high.",
        options: [
          "Loss oscillates or explodes instead of decreasing",
          "Training loss is much lower than validation loss",
          "The model gets stuck bouncing around a minimum",
          "Loss decreases extremely slowly and smoothly",
        ],
        answer: [0, 2],
        explanation: "Explosion/oscillation and bouncing around a minimum both indicate overshooting steps. (Training-vs-validation gap is overfitting; smooth slow descent suggests the rate is too low.)",
      },
      {
        id: "q1-4",
        type: "code",
        prompt: "What does this optimizer step do?",
        code: "theta -= lr * grad\nm = beta * m + (1 - beta) * grad\n# next iteration uses m as the update direction",
        options: [
          "Momentum: smooths the gradient direction with an exponential moving average",
          "Adaptive per-parameter learning rates",
          "Gradient clipping to avoid explosion",
        ],
        answer: [0],
        explanation: "An EMA of past gradients is exactly classical momentum — later, per-parameter scaling turns this into Adam.",
      },
      {
        id: "q1-5",
        type: "single",
        prompt: "You add one more layer and gradients in early layers vanish. The most direct fix is…",
        options: [
          "residual (skip) connections and better initialization",
          "increasing the batch size",
          "lowering the learning rate",
        ],
        answer: [0],
        explanation: "Skip paths give gradients a short route to early layers; careful init (He/Glorot) keeps signal variance stable with depth.",
      },
    ],
  },
  {
    id: "q2",
    title: "React Hooks Challenge",
    course: "React 19 Mastery: Hooks to Server Components",
    difficulty: "Medium",
    durationMin: 6,
    questions: [
      {
        id: "q2-1",
        type: "single",
        prompt: "An effect refetches on every render. The most likely cause is…",
        options: [
          "a dependency whose identity changes every render (object/function)",
          "missing cleanup in the effect",
          "StrictMode double-mounting",
        ],
        answer: [0],
        explanation: "New object/function identities change every render, so the effect's dependency comparison always fails.",
      },
      {
        id: "q2-2",
        type: "single",
        prompt: "useMemo exists primarily to…",
        options: [
          "skip recomputing an expensive value between renders",
          "cache fetched data across pages",
          "prevent a component from re-rendering",
        ],
        answer: [0],
        explanation: "It memoizes a *value*. Data fetching belongs to a query library; preventing renders needs memo on the component.",
      },
      {
        id: "q2-3",
        type: "multi",
        prompt: "Which of these are legal React (hooks rules)? Select all.",
        options: [
          "calling useState at the top level of a component",
          "calling useEffect inside an if branch",
          "calling a custom hook inside another custom hook",
          "calling setState inside useEffect's cleanup",
        ],
        answer: [0, 2, 3],
        explanation: "Hooks must run in a stable order — unconditional top-level calls — but custom hooks compose freely and cleanup may call setState safely.",
      },
      {
        id: "q2-4",
        type: "code",
        prompt: "What renders after clicking the button once?",
        code: "const [n, setN] = useState(0);\nfunction onClick() {\n  setN(n + 1);\n  setN(n + 1);\n}\n<button onClick={onClick}>{n}</button>",
        options: ["1 — state updates batch, both see the same n", "2 — each setN applies immediately", "0 — updates inside handlers are ignored"],
        answer: [0],
        explanation: "Both calls read the same snapshot of n and batch together — n + 1 twice with the same n yields 1. Use the updater form setN(v => v + 1) for +2.",
      },
      {
        id: "q2-5",
        type: "single",
        prompt: "The cleanest way to fetch shared, cacheable data in modern React is…",
        options: [
          "a query library (TanStack Query) driven by useQuery",
          "fetch inside useEffect with a loading flag",
          "useMemo around a fetch call",
        ],
        answer: [0],
        explanation: "Query libraries own the cache, deduping and invalidation — effects can't do that sanely on their own.",
      },
    ],
  },
  {
    id: "q3",
    title: "Docker Fundamentals Sprint",
    course: "Docker & Kubernetes for Developers",
    difficulty: "Easy",
    durationMin: 5,
    questions: [
      {
        id: "q3-1",
        type: "single",
        prompt: "docker run -p 8080:80 maps…",
        options: ["host port 8080 → container port 80", "container port 8080 → host port 80", "both directions simultaneously"],
        answer: [0],
        explanation: "The syntax is host:container — traffic arriving on host 8080 is forwarded to container port 80.",
      },
      {
        id: "q3-2",
        type: "single",
        prompt: "Image layers are…",
        options: ["immutable and shareable between images", "mutable per container", "full filesystem copies each"],
        answer: [0],
        explanation: "Layers are cached, immutable and shared — that's why ordered Dockerfiles build fast.",
      },
      {
        id: "q3-3",
        type: "multi",
        prompt: "Which keep builds fast in a Dockerfile? Select all.",
        options: [
          "copying lockfiles and installing deps before copying source",
          "using a .dockerignore for node_modules",
          "running yarn install after COPY . .",
          "multi-stage builds to slim the final image",
        ],
        answer: [0, 1, 3],
        explanation: "Cache-friendly ordering, ignoring churn, and multi-stage builds all help; installing deps after copying source busts the cache every edit.",
      },
      {
        id: "q3-4",
        type: "single",
        prompt: "A named volume differs from a bind mount because it…",
        options: [
          "is managed by Docker in its own storage area",
          "is always faster",
          "cannot be inspected or backed up",
        ],
        answer: [0],
        explanation: "Volumes live under Docker's management (durable across compose down); bind mounts map an arbitrary host path.",
      },
      {
        id: "q3-5",
        type: "single",
        prompt: "Multi-stage builds primarily produce…",
        options: [
          "smaller final images without build tooling",
          "faster container startup by prewarming",
          "automatic vulnerability scanning",
        ],
        answer: [0],
        explanation: "Compile in a builder stage, copy artifacts into a clean runtime stage — build tools never ship.",
      },
    ],
  },
];

export const getQuiz = (id: string) => quizzes.find((q) => q.id === id);

// ── Study materials ──────────────────────────────────────────────────────────

export type MaterialType = "summary" | "cheatsheet" | "notes" | "transcript";

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  course: string;
  courseId: string;
  readTime: string;
  updated: string;
  excerpt: string;
  body: string[];
}

export const materials: Material[] = [
  {
    id: "mat1",
    title: "Backpropagation — The Complete Summary",
    type: "summary",
    course: "Neural Networks & Deep Learning Foundations",
    courseId: "c1",
    readTime: "6 min read",
    updated: "2 days ago",
    excerpt: "The chain rule, blame assignment and the ledger analogy — everything from module 2 distilled into one page.",
    body: [
      "Backpropagation answers one question for every parameter: how much were you responsible for the error?",
      "The forward pass stores intermediates; the loss produces the first gradient; each node multiplies the incoming gradient by its local derivative and passes it upstream; the optimizer applies the update.",
      "Key exam trap: vanishing gradients are a product of many small multiplicative factors — skip connections and careful initialization are the structural fixes.",
    ],
  },
  {
    id: "mat2",
    title: "Optimizers Cheat Sheet: SGD → Adam",
    type: "cheatsheet",
    course: "Neural Networks & Deep Learning Foundations",
    courseId: "c1",
    readTime: "3 min scan",
    updated: "3 days ago",
    excerpt: "Update rules, hyper-parameters and when each optimizer wins — one screen, no fluff.",
    body: [
      "SGD: θ -= lr·g. Baseline; sometimes the best generalization on vision tasks.",
      "Momentum: keep an EMA of g; dampens oscillation through ravines.",
      "Adam: momentum + per-parameter scaling by a second EMA of g². Forgiving default for transformers; lr = 1e-3 to start.",
      "Rule of thumb: Adam for fast iteration, SGD+momentum for the last 1% of accuracy.",
    ],
  },
  {
    id: "mat3",
    title: "Prompt Patterns Field Notes",
    type: "notes",
    course: "LLM Fine-Tuning & Prompt Engineering Mastery",
    courseId: "c2",
    readTime: "8 min read",
    updated: "1 week ago",
    excerpt: "Role prompting, few-shot scaffolds, structured output contracts and anti-patterns observed in production.",
    body: [
      "Pattern 1 — Role + goal + constraints: 'You are a code reviewer. Goal: catch correctness bugs only. Constraint: quote the offending line.'",
      "Pattern 2 — Few-shot with diverse coverage: examples must span the input space, not the easy 80%.",
      "Pattern 3 — Structured contracts: demand JSON with a schema and exemplars of failure modes.",
      "Anti-pattern: hiding the failure mode you most fear from the model. Name it explicitly instead.",
    ],
  },
  {
    id: "mat4",
    title: "Attention Mechanism — Transcript Digest",
    type: "transcript",
    course: "Neural Networks & Deep Learning Foundations",
    courseId: "c1",
    readTime: "5 min read",
    updated: "1 week ago",
    excerpt: "Auto-generated digest of 'RNNs and the Road to Attention' with timestamps and key equations.",
    body: [
      "[00:00] Why recurrence limits parallelism: token t needs token t-1's hidden state.",
      "[04:12] Attention replaces sequential passing with direct lookup: softmax(QKᵀ/√d)V.",
      "[09:40] Multi-head = parallel matchings; heads specialize (syntax, position, semantics).",
      "[14:05] Why √d: keeps softmax out of saturation, preserving gradients.",
    ],
  },
  {
    id: "mat5",
    title: "RAG Pipeline Blueprint",
    type: "summary",
    course: "Full-Stack Modern AI Applications",
    courseId: "c3",
    readTime: "7 min read",
    updated: "2 weeks ago",
    excerpt: "Chunking strategies, embedding choices, hybrid retrieval and re-ranking — the architecture that actually ships.",
    body: [
      "Chunk by structure first (headings, paragraphs), size second: 300–800 tokens with overlap.",
      "Hybrid retrieval: dense embeddings + BM25, fused with reciprocal rank fusion.",
      "Re-rank the top 50 with a cross-encoder; prompt with the top 5.",
      "Evaluate retrieval separately from generation — a chat UI hides retrieval failures until it's too late.",
    ],
  },
  {
    id: "mat6",
    title: "Docker Layers & Caches — Quick Reference",
    type: "cheatsheet",
    course: "Docker & Kubernetes for Developers",
    courseId: "c9",
    readTime: "2 min scan",
    updated: "2 weeks ago",
    excerpt: "Layer order rules, .dockerignore essentials and the compose commands you type weekly.",
    body: [
      "Order: OS deps → language runtime → lockfiles+install → source → build. Most-changed last.",
      "docker compose up -d --build · exec -it <c> sh · logs -f <c> · down -v (nukes volumes!).",
      "Cache-busting trap: a bare COPY . . before the install step invalidates everything below it.",
    ],
  },
  {
    id: "mat7",
    title: "Spaced Repetition Setup Guide",
    type: "notes",
    course: "Cognitive Science & Memory Retention",
    courseId: "c6",
    readTime: "6 min read",
    updated: "3 weeks ago",
    excerpt: "How to run the Flashcards room properly: card writing rules, interval intuition and the daily review habit.",
    body: [
      "One fact per card, written in your own words; delete cards you fail three times and rewrite them instead.",
      "Again/Hard/Good/Easy are honesty buttons — gaming Good converts review into recognition.",
      "Anchor reviews to an existing habit (morning coffee) — consistency beats volume.",
    ],
  },
  {
    id: "mat8",
    title: "Vector Search Explained",
    type: "summary",
    course: "Full-Stack Modern AI Applications",
    courseId: "c3",
    readTime: "5 min read",
    updated: "1 month ago",
    excerpt: "Embeddings, cosine similarity, ANN indexes and why exact search dies at a million rows.",
    body: [
      "Embeddings map text to vectors where closeness ≈ semantic similarity; cosine is the default yardstick.",
      "Exact search is O(n) per query; ANN indexes (HNSW, IVF) trade a little recall for orders-of-magnitude speed.",
      "Always sanity-check with known pairs — garbage embeddings are silent until users are gone.",
    ],
  },
];

export const materialTypeLabels: Record<MaterialType, string> = {
  summary: "AI Summary",
  cheatsheet: "Cheat Sheet",
  notes: "Smart Notes",
  transcript: "Transcript",
};

// ── Home feed extras ─────────────────────────────────────────────────────────

export const trendingTopics: Array<{ id: string; name: string; posts: string }> = [
  { id: "t1", name: "Machine Learning & AI", posts: "12.4k learners today" },
  { id: "t2", name: "System Architecture", posts: "6.1k learners today" },
  { id: "t3", name: "Prompt Engineering", posts: "5.8k learners today" },
  { id: "t4", name: "Neuroscience of Learning", posts: "3.3k learners today" },
  { id: "t5", name: "Full-Stack Web Dev", posts: "8.9k learners today" },
  { id: "t6", name: "Financial Engineering", posts: "2.2k learners today" },
];

export const learningPaths = [
  {
    id: "lp1",
    title: "From Zero to LLM Engineer",
    weeks: 12,
    courses: 5,
    learners: "31.2k",
    gradient: "from-violet-600 via-purple-600 to-blue-600",
    blurb: "Foundations → prompting → RAG → fine-tuning → shipping a domain assistant.",
  },
  {
    id: "lp2",
    title: "Backend Systems Architect",
    weeks: 10,
    courses: 4,
    learners: "18.7k",
    gradient: "from-blue-600 via-sky-600 to-cyan-600",
    blurb: "Databases → Docker & K8s → distributed systems → a capstone design review.",
  },
  {
    id: "lp3",
    title: "Learning Science Black Belt",
    weeks: 4,
    courses: 3,
    learners: "9.4k",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    blurb: "Memory science → spaced repetition systems → deep focus that compounds.",
  },
];

export const aiQuickActions = [
  { id: "a1", title: "Explain a complex concept", desc: "Socratic explanations with analogies", target: "/ai-tutor", icon: "bot" },
  { id: "a2", title: "Generate a quiz", desc: "Adaptive MCQs with instant feedback", target: "/quizzes", icon: "quiz" },
  { id: "a3", title: "Summarize study material", desc: "Digest PDFs, transcripts and notes", target: "/study-materials", icon: "sum" },
  { id: "a4", title: "Create a flashcard deck", desc: "Atomic cards with spaced review", target: "/flashcards", icon: "cards" },
];

// ── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "course" | "quiz" | "streak" | "material";
}

export const notifications: AppNotification[] = [
  {
    id: "n1",
    title: "Streak at risk 🔥",
    body: "You're one 10-minute session away from keeping your 14-day streak alive.",
    time: "2h ago",
    kind: "streak",
  },
  {
    id: "n2",
    title: "New lesson unlocked",
    body: "Optimizers: From SGD to Adam is ready in Neural Networks & Deep Learning.",
    time: "5h ago",
    kind: "course",
  },
  {
    id: "n3",
    title: "Quiz graded",
    body: "You scored 80% on Backpropagation Checkpoint — review question 3 for a quick win.",
    time: "1d ago",
    kind: "quiz",
  },
  {
    id: "n4",
    title: "AI summary ready",
    body: "Your transcript digest of 'RNNs and the Road to Attention' was generated.",
    time: "2d ago",
    kind: "material",
  },
];

// ── Analytics ────────────────────────────────────────────────────────────────

export const weeklyHours = [
  { day: "Mon", hours: 0.4 },
  { day: "Tue", hours: 0.8 },
  { day: "Wed", hours: 0.3 },
  { day: "Thu", hours: 0.7 },
  { day: "Fri", hours: 0.9 },
  { day: "Sat", hours: 0.2 },
  { day: "Sun", hours: 0.9 },
];

export const skillRadar = [
  { skill: "ML & AI", score: 82 },
  { skill: "Web Dev", score: 74 },
  { skill: "Systems", score: 58 },
  { skill: "Data", score: 66 },
  { skill: "Math", score: 61 },
  { skill: "Learning", score: 88 },
];

export const accuracyTrend = [
  { week: "W1", accuracy: 58 },
  { week: "W2", accuracy: 64 },
  { week: "W3", accuracy: 61 },
  { week: "W4", accuracy: 70 },
  { week: "W5", accuracy: 68 },
  { week: "W6", accuracy: 76 },
  { week: "W7", accuracy: 74 },
  { week: "W8", accuracy: 82 },
];

export const focusTrend = [
  { week: "W1", sessions: 6 },
  { week: "W2", sessions: 9 },
  { week: "W3", sessions: 8 },
  { week: "W4", sessions: 12 },
  { week: "W5", sessions: 14 },
  { week: "W6", sessions: 13 },
  { week: "W7", sessions: 17 },
  { week: "W8", sessions: 19 },
];

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  earned: boolean;
}

export const badges: Badge[] = [
  { id: "b1", name: "14-Day Streak", desc: "Two weeks of daily learning", icon: "flame", earned: true },
  { id: "b2", name: "Deep Diver", desc: "100 lessons completed", icon: "dive", earned: true },
  { id: "b3", name: "Quiz Sniper", desc: "Score 80%+ on 5 quizzes", icon: "target", earned: true },
  { id: "b4", name: "Card Shark", desc: "Review 500 flashcards", icon: "cards", earned: true },
  { id: "b5", name: "Focus Monk", desc: "50 pomodoro sessions", icon: "monk", earned: false },
  { id: "b6", name: "Course Finisher", desc: "Complete your first course", icon: "flag", earned: true },
];

export const recentActivity = [
  { id: "r1", text: "Completed 'Backpropagation Step by Step' with note", time: "25 min ago" },
  { id: "r2", text: "Reviewed 18 flashcards in AI & Neural Networks", time: "1h ago" },
  { id: "r3", text: "Finished pomodoro session #3 in Focus Room", time: "3h ago" },
  { id: "r4", text: "Scored 80% on Backpropagation Checkpoint", time: "1d ago" },
  { id: "r5", text: "AI generated 'Optimizers Cheat Sheet' from your notes", time: "3d ago" },
];

// ── User ─────────────────────────────────────────────────────────────────────

export const user = {
  name: "Alex Carter",
  firstName: "Alex",
  handle: "@alex.studies",
  email: "alex.carter@studyspace.app",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=200&h=200",
  level: 12,
  levelName: "Trailblazer",
  xp: 8640,
  xpToNext: 10000,
  streak: 14,
  weeklyGoalHours: 6,
  hoursThisWeek: 4.2,
  joined: "March 2025",
  interests: ["Machine Learning", "Full-Stack", "Learning Science", "System Design"],
};

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
