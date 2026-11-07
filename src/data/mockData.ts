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
  youtubeId?: string;
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
  defs: Array<[title: string, duration: string, kind?: Lesson["kind"], youtubeId?: string]>,
): Lesson[] =>
  defs.map(([title, duration, kind, youtubeId], i) => ({
    id: `${courseId}-m${moduleNo}-l${i + 1}`,
    title,
    duration,
    kind: kind ?? "video",
    youtubeId,
  }));

const u = (photo: string) =>
  `https://images.unsplash.com/${photo}?crop=entropy&cs=srgb&fm=jpg&q=80&auto=format&fit=crop&w=800&h=450`;

export const allCourses: Course[] = [
  {
    id: "c-python",
    title: "Complete Python Programming Masterclass",
    instructor: "Shradha Khapra",
    instructorTitle: "Ex-Microsoft, Apna College",
    category: "Programming & Python",
    level: "Beginner",
    rating: 4.9,
    students: "1.2M",
    totalDuration: "12h 15m",
    thumbnail: "https://img.youtube.com/vi/t2_Q2BRzeEE/hqdefault.jpg",
    description:
      "A complete from-scratch guide to modern Python. Master variables, control flow, functions, file I/O and object-oriented programming (OOP) through clean code examples and hands-on practice.",
    tags: ["Python", "Variables", "OOP", "Functions", "Data Structures"],
    enrolled: true,
    updated: "2026",
    modules: [
      {
        id: "cp-m1",
        title: "Python Basics & Core Types",
        lessons: lessons("c-python", 1, [
          ["Variables & Data Types", "42:15", "video", "t2_Q2BRzeEE"],
          ["Strings & Conditional Statements", "38:40", "video", "lIId8IDP6TU"],
          ["Lists & Tuples in Depth", "45:10", "video", "qVyvmzFxF_o"],
          ["Dictionaries & Sets", "36:20", "video", "078tYSD7K8E"],
        ]),
      },
      {
        id: "cp-m2",
        title: "Control Flow & Modular Code",
        lessons: lessons("c-python", 2, [
          ["Loops: While & For Loops", "51:05", "video", "S73thl0AyFU"],
          ["Functions & Recursion", "48:30", "video", "OvTH-7ESoRA"],
          ["File Input & Output (I/O)", "39:15", "video", "jU0cndZziO0"],
        ]),
      },
      {
        id: "cp-m3",
        title: "Object-Oriented Programming (OOP)",
        lessons: lessons("c-python", 3, [
          ["OOPS in Python — Classes & Objects", "54:20", "video", "HeW-D6KpDwY"],
          ["OOPS in Python — Inheritance & Polymorphism", "58:45", "video", "bAwmZVJeO5s"],
          ["Checkpoint Quiz: Python Mastery", "15 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c1",
    title: "Neural Networks & Deep Learning Foundations",
    instructor: "Grant Sanderson",
    instructorTitle: "Founder, 3Blue1Brown",
    category: "Artificial Intelligence",
    level: "Intermediate",
    rating: 4.95,
    students: "1.4M",
    totalDuration: "3h 45m",
    thumbnail: "https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg",
    description:
      "Build a rock-solid mental model of how neural networks actually learn. From the single perceptron to backpropagation calculus, gradient descent, transformers and modern LLM architectures.",
    tags: ["Deep Learning", "Neural Networks", "Backpropagation", "Math", "AI"],
    enrolled: true,
    updated: "2026",
    modules: [
      {
        id: "c1-m1",
        title: "Foundations of Neural Computation",
        lessons: lessons("c1", 1, [
          ["But what is a neural network? | Chapter 1", "19:13", "video", "aircAruvnKk"],
          ["Gradient descent, how neural networks learn | Chapter 2", "21:01", "video", "IHZwWFHWa-w"],
          ["What is backpropagation really doing? | Chapter 3", "13:54", "video", "Ilg3gGewQ5U"],
          ["Backpropagation calculus | Chapter 4", "10:17", "video", "tIeHLnjs5U8"],
        ]),
      },
      {
        id: "c1-m2",
        title: "Attention & Large Language Models",
        lessons: lessons("c1", 2, [
          ["Visualizing Attention and Transformers | Chapter 5", "26:45", "video", "eMlx5fFNoYc"],
          ["How Large Language Models Work | Chapter 6", "27:18", "video", "wjZofJX0v4U"],
          ["Checkpoint Quiz: Neural Network Dynamics", "15 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c2",
    title: "Data Structures & Algorithms Masterclass",
    instructor: "Abdul Bari",
    instructorTitle: "Distinguished Educator & Computer Scientist",
    category: "Computer Science & DSA",
    level: "Intermediate",
    rating: 4.93,
    students: "850k",
    totalDuration: "6h 30m",
    thumbnail: "https://img.youtube.com/vi/__vX2sjlpXU/hqdefault.jpg",
    description:
      "Master the fundamental data structures and algorithmic paradigms that power modern software. In-depth analysis of asymptotic notations, divide-and-conquer, sorting, and graph traversals.",
    tags: ["Algorithms", "Data Structures", "Big-O", "Graphs", "Sorting"],
    enrolled: true,
    updated: "2026",
    modules: [
      {
        id: "c2-m1",
        title: "Algorithm Analysis & Divide and Conquer",
        lessons: lessons("c2", 1, [
          ["Introduction to Algorithms & Time Complexity", "20:15", "video", "__vX2sjlpXU"],
          ["Asymptotic Notations (Big-O, Omega, Theta)", "18:42", "video", "A03oI0znAoc"],
          ["Divide and Conquer Strategy", "15:30", "video", "2Rr2tW9zv30"],
          ["Binary Search Algorithm & Recurrence", "19:10", "video", "C2apEw9pgtw"],
        ]),
      },
      {
        id: "c2-m2",
        title: "Sorting, Trees & Graph Traversals",
        lessons: lessons("c2", 2, [
          ["Quick Sort Algorithm & Step-by-Step Analysis", "24:50", "video", "QN9hnmAgmOc"],
          ["Merge Sort Algorithm & Space Complexity", "22:15", "video", "mB5HXBb_HY8"],
          ["Graph Traversals: BFS & DFS Explained", "27:40", "video", "pcKY4hjMrMQ"],
          ["Dijkstra's Shortest Path Algorithm", "25:35", "video", "XB4MIexjvY0"],
          ["Checkpoint Quiz: Algorithmic Complexities", "15 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c3",
    title: "Modern React 19 & Full-Stack Web Development",
    instructor: "Bob Ziroll",
    instructorTitle: "Head of Education, Scrimba",
    category: "Full-Stack Web Dev",
    level: "Beginner",
    rating: 4.88,
    students: "620k",
    totalDuration: "8h 45m",
    thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg",
    description:
      "A comprehensive guide to building reactive web applications using modern React. Learn JSX, state hooks, effect lifecycles, controlled forms, custom hooks, and full-stack integration.",
    tags: ["React", "TypeScript", "Hooks", "Frontend", "Full-Stack"],
    enrolled: true,
    updated: "2026",
    modules: [
      {
        id: "c3-m1",
        title: "React Fundamentals & State",
        lessons: lessons("c3", 1, [
          ["React Basics, Components & JSX", "45:20", "video", "bMknfKXIFA8"],
          ["State Management with useState", "38:15", "video", "x4rFhThSX04"],
          ["Handling Side Effects with useEffect", "41:30", "video", "DLX62G4lc44"],
        ]),
      },
      {
        id: "c3-m2",
        title: "Advanced React & Full-Stack Architecture",
        lessons: lessons("c3", 2, [
          ["Conditional Rendering & Form Control", "35:10", "video", "b9eMGE7QtTk"],
          ["Custom Hooks & Logic Reusability", "29:45", "video", "6ThXsUwLWvc"],
          ["Building a Complete Production App", "52:18", "video", "w7ejDZ8SWv8"],
          ["Checkpoint Quiz: React Core Patterns", "15 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c4",
    title: "Database Design & SQL Complete Course",
    instructor: "Mike Dane",
    instructorTitle: "Senior Database Instructor, freeCodeCamp",
    category: "Databases & SQL",
    level: "Beginner",
    rating: 4.89,
    students: "910k",
    totalDuration: "5h 20m",
    thumbnail: "https://img.youtube.com/vi/HXV3zeQKqGY/hqdefault.jpg",
    description:
      "Master relational database design, query writing, indexing, and normalization from scratch. Covers primary/foreign keys, joins, aggregations, triggers, and transactions.",
    tags: ["SQL", "PostgreSQL", "Database Design", "Normalization", "Backend"],
    enrolled: false,
    updated: "2026",
    modules: [
      {
        id: "c4-m1",
        title: "Relational Foundations & Schema",
        lessons: lessons("c4", 1, [
          ["Introduction to Databases & Relational Model", "35:40", "video", "HXV3zeQKqGY"],
          ["Creating Tables, Constraints & Primary Keys", "28:15", "video", "7S_tz1z_5bA"],
          ["SQL Queries, WHERE & Filtering Data", "32:50", "video", "znPS24zSmCc"],
        ]),
      },
      {
        id: "c4-m2",
        title: "Advanced SQL Queries & Normalization",
        lessons: lessons("c4", 2, [
          ["SQL Aggregations & GROUP BY Clause", "31:20", "video", "xT0lRXYy6mA"],
          ["Inner, Left, Right & Full Outer Joins", "40:15", "video", "9yeOJ0ZMUYw"],
          ["Database Normalization (1NF, 2NF, 3NF, BCNF)", "37:45", "video", "UrYLYV7WSHM"],
          ["Checkpoint Quiz: SQL & Database Design", "15 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c5",
    title: "Machine Learning Specialization",
    instructor: "Dr. Andrew Ng",
    instructorTitle: "Stanford University & DeepLearning.AI",
    category: "Machine Learning",
    level: "Intermediate",
    rating: 4.96,
    students: "1.8M",
    totalDuration: "7h 10m",
    thumbnail: "https://img.youtube.com/vi/jGwO_UgTS7I/hqdefault.jpg",
    description:
      "The definitive course on machine learning. Understand supervised learning, linear and logistic regression, gradient descent optimization, cost functions, decision trees, and regularization.",
    tags: ["Machine Learning", "Andrew Ng", "Regression", "Classification", "AI"],
    enrolled: false,
    updated: "2026",
    modules: [
      {
        id: "c5-m1",
        title: "Supervised Learning & Regression",
        lessons: lessons("c5", 1, [
          ["Supervised vs Unsupervised Learning Overview", "22:15", "video", "jGwO_UgTS7I"],
          ["Linear Regression & Cost Function Formulation", "26:40", "video", "4b4MUYve_U8"],
          ["Gradient Descent in Machine Learning", "24:10", "video", "EACxJvXo_g0"],
          ["Logistic Regression for Classification", "29:30", "video", "W0q85cEsmz4"],
        ]),
      },
      {
        id: "c5-m2",
        title: "Regularization & Decision Trees",
        lessons: lessons("c5", 2, [
          ["Regularization & Preventing Model Overfitting", "21:45", "video", "u73PU6Qwl1I"],
          ["Decision Trees & Tree Ensembles", "28:50", "video", "wr9gUr-eWdA"],
          ["Checkpoint Quiz: Supervised Learning Models", "15 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c6",
    title: "Operating Systems Fundamentals",
    instructor: "Neso Academy",
    instructorTitle: "Computer Science Educators",
    category: "System Architecture",
    level: "Intermediate",
    rating: 4.91,
    students: "480k",
    totalDuration: "4h 50m",
    thumbnail: "https://img.youtube.com/vi/vBURTt97EkA/hqdefault.jpg",
    description:
      "Core operating system concepts: process states, context switching, CPU scheduling algorithms, inter-process communication, semaphores, deadlocks, and virtual memory paging.",
    tags: ["Operating Systems", "Processes", "Concurrency", "Scheduling", "Memory"],
    enrolled: false,
    updated: "2026",
    modules: [
      {
        id: "c6-m1",
        title: "Processes & CPU Scheduling",
        lessons: lessons("c6", 1, [
          ["Introduction to Operating Systems Architecture", "24:12", "video", "vBURTt97EkA"],
          ["Process Management & State Diagrams", "21:30", "video", "26QPDBe-NB8"],
          ["CPU Scheduling: FCFS, SJF & Round Robin", "28:45", "video", "RozoeWzT7lA"],
        ]),
      },
      {
        id: "c6-m2",
        title: "Synchronization, Deadlocks & Memory",
        lessons: lessons("c6", 2, [
          ["Process Synchronization & Critical Section", "26:10", "video", "ph2A4pUe2b8"],
          ["Deadlock Detection, Prevention & Avoidance", "25:40", "video", "rWFH6kn_Tcg"],
          ["Virtual Memory, Paging & Page Replacement", "30:15", "video", "6n3_Pwh6F5A"],
          ["Checkpoint Quiz: Operating Systems", "15 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c7",
    title: "Git & GitHub for Software Engineers",
    instructor: "freeCodeCamp",
    instructorTitle: "Open Source Learning",
    category: "Developer Tools",
    level: "Beginner",
    rating: 4.88,
    students: "740k",
    totalDuration: "3h 15m",
    thumbnail: "https://img.youtube.com/vi/RGOj5yH7evk/hqdefault.jpg",
    description:
      "Master modern version control with Git and GitHub. Branching, merging, rebasing, pull requests, resolving merge conflicts, and team collaboration workflows.",
    tags: ["Git", "GitHub", "DevOps", "Version Control", "Workflow"],
    enrolled: false,
    updated: "2026",
    modules: [
      {
        id: "c7-m1",
        title: "Git Core & Branching",
        lessons: lessons("c7", 1, [
          ["Git Fundamentals: Architecture, Commits & History", "35:10", "video", "RGOj5yH7evk"],
          ["Branching, Merging & Fast-Forward Workflows", "32:45", "video", "apGV9Kg7ics"],
        ]),
      },
      {
        id: "c7-m2",
        title: "GitHub & Team Workflows",
        lessons: lessons("c7", 2, [
          ["Remote Repositories, Push/Pull & Pull Requests", "34:20", "video", "DVRQ749j_tY"],
          ["Resolving Conflicts, Stashing & Interactive Rebase", "31:15", "video", "Uszj_k0DGsg"],
          ["Checkpoint Quiz: Git Workflow", "10 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c8",
    title: "Computer Networking & Cyber Security",
    instructor: "NetworkChuck",
    instructorTitle: "Network Engineer & Security Instructor",
    category: "Networking & Security",
    level: "Beginner",
    rating: 4.92,
    students: "530k",
    totalDuration: "4h 10m",
    thumbnail: "https://img.youtube.com/vi/IPvYjXCsTg8/hqdefault.jpg",
    description:
      "Demystify networking from the ground up: routers, switches, IP addressing, subnets, the OSI 7-layer model, TCP vs UDP handshakes, DNS resolution, and firewall configurations.",
    tags: ["Networking", "Cybersecurity", "TCP/IP", "DNS", "OSI Model"],
    enrolled: false,
    updated: "2026",
    modules: [
      {
        id: "c8-m1",
        title: "Networking Foundations & OSI Model",
        lessons: lessons("c8", 1, [
          ["How Does the Internet Work? Routers & Switches", "21:30", "video", "IPvYjXCsTg8"],
          ["The OSI 7-Layer Model Step-by-Step", "25:40", "video", "vv4y_uOneC0"],
          ["TCP vs UDP: Handshakes, Packets & Sockets", "24:15", "video", "Vdc8TCESDlg"],
        ]),
      },
      {
        id: "c8-m2",
        title: "Protocols & Network Security",
        lessons: lessons("c8", 2, [
          ["DNS Explained: How Domain Lookup Works", "19:50", "video", "27r4Bzuj5OI"],
          ["Firewalls, Ports & Network Defense", "23:45", "video", "KD4Qc7GvK9o"],
          ["Checkpoint Quiz: Networking Essentials", "12 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c9",
    title: "Docker & Containerization Crash Course",
    instructor: "Nana Janashia",
    instructorTitle: "DevOps Specialist, TechWorld with Nana",
    category: "Cloud & DevOps",
    level: "Beginner",
    rating: 4.94,
    students: "670k",
    totalDuration: "3h 50m",
    thumbnail: "https://img.youtube.com/vi/pg19Z8LLK4w/hqdefault.jpg",
    description:
      "Learn containerization with Docker. Build custom Dockerfiles, manage multi-container applications with Docker Compose, handle volume persistence, and configure virtual networks.",
    tags: ["Docker", "DevOps", "Containers", "Docker Compose", "Cloud"],
    enrolled: true,
    updated: "2026",
    modules: [
      {
        id: "c9-m1",
        title: "Docker Primitives & Images",
        lessons: lessons("c9", 1, [
          ["What is Docker and Why Do We Need It?", "20:30", "video", "pg19Z8LLK4w"],
          ["Docker Architecture: Images, Containers & Daemon", "24:15", "video", "3c-iBn73dDE"],
          ["Writing Dockerfiles & Optimizing Layer Caching", "26:50", "video", "LQjaJINkQXY"],
        ]),
      },
      {
        id: "c9-m2",
        title: "Docker Compose & Orchestration",
        lessons: lessons("c9", 2, [
          ["Docker Compose for Multi-Container Systems", "27:40", "video", "HG6yLvV5dQ8"],
          ["Docker Volumes, Networks & Deployment", "25:10", "video", "bKFMS5C4CG0"],
          ["Checkpoint Quiz: Containers & Docker", "10 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c10",
    title: "Large Language Models & Deep AI",
    instructor: "Andrej Karpathy",
    instructorTitle: "Ex-Director of AI, Tesla & OpenAI Co-founder",
    category: "GenAI & LLMs",
    level: "Advanced",
    rating: 4.98,
    students: "980k",
    totalDuration: "8h 15m",
    thumbnail: "https://img.youtube.com/vi/kCc8FmEb1nY/hqdefault.jpg",
    description:
      "Deep dive into modern Generative AI and Large Language Models. Build GPT from scratch in raw Python and PyTorch, understand backpropagation step-by-step, tokenization, and RLHF.",
    tags: ["LLMs", "Transformers", "GPT", "Karpathy", "PyTorch"],
    enrolled: true,
    updated: "2026",
    modules: [
      {
        id: "c10-m1",
        title: "Building Neural Nets & GPT From Scratch",
        lessons: lessons("c10", 1, [
          ["Let's build GPT: from scratch, in code, spelled out", "116:00", "video", "kCc8FmEb1nY"],
          ["The spelled-out intro to neural networks and backprop", "145:00", "video", "VMj-3S1tku0"],
        ]),
      },
      {
        id: "c10-m2",
        title: "Language Modeling & Modern AI",
        lessons: lessons("c10", 2, [
          ["Building makemore: Language Modeling with Micrograd", "74:00", "video", "PaCmpygFfXo"],
          ["State of GPT: Pretraining, SFT, RLHF & Beyond", "42:00", "video", "zjkBMFhNj_g"],
          ["Checkpoint Quiz: LLM Architectures", "15 min", "quiz"],
        ]),
      },
    ],
  },
  {
    id: "c11",
    title: "Rust Systems Programming Essentials",
    instructor: "Trevor Sullivan",
    instructorTitle: "Cloud & Systems Architect, freeCodeCamp",
    category: "System Architecture",
    level: "Intermediate",
    rating: 4.87,
    students: "310k",
    totalDuration: "5h 10m",
    thumbnail: "https://img.youtube.com/vi/5C_HPTJg5ek/hqdefault.jpg",
    description:
      "Learn the Rust programming language from the fundamentals. Master ownership, borrowing rules, lifetimes, structs, enums, error handling with Result/Option, and multi-threaded concurrency.",
    tags: ["Rust", "Systems Programming", "Memory Safety", "Concurrency", "CLI"],
    enrolled: false,
    updated: "2026",
    modules: [
      {
        id: "c11-m1",
        title: "Rust Core & Memory Safety",
        lessons: lessons("c11", 1, [
          ["Rust Crash Course: Setup, Cargo & Toolchain", "32:15", "video", "5C_HPTJg5ek"],
          ["Memory Safety, Ownership & Borrow Checker", "38:40", "video", "VFIOSWy93LE"],
        ]),
      },
      {
        id: "c11-m2",
        title: "Structs, Enums & Concurrency",
        lessons: lessons("c11", 2, [
          ["Structs, Enums & Exhaustive Pattern Matching", "34:20", "video", "msLmtCEe0gM"],
          ["Error Handling & Concurrency with Threads", "39:50", "video", "k_kH_JzNlE8"],
          ["Checkpoint Quiz: Rust Fundamentals", "10 min", "quiz"],
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
  "c-python": ["c-python-m1-l1", "c-python-m1-l2"],
  c1: ["c1-m1-l1", "c1-m1-l2", "c1-m1-l3"],
  c2: ["c2-m1-l1", "c2-m1-l2"],
  c3: ["c3-m1-l1", "c3-m1-l2"],
  c9: ["c9-m1-l1", "c9-m1-l2"],
  c10: ["c10-m1-l1"],
};

export const bookmarkSeed: string[] = ["c-python", "c2", "c4", "c10"];

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
    id: "mat0",
    title: "Python Core Cheat Sheet: Types, Loops & OOP",
    type: "cheatsheet",
    course: "Complete Python Programming Masterclass",
    courseId: "c-python",
    readTime: "4 min scan",
    updated: "Yesterday",
    excerpt: "Quick-reference syntax for lists, tuples, dict comprehensions, functions and class inheritance.",
    body: [
      "Data types: mutable (lists, dicts, sets) vs immutable (strings, tuples, ints, floats).",
      "List comprehensions: [x**2 for x in nums if x % 2 == 0]. Clean, idiomatic Python.",
      "OOP: __init__(self) constructor, super() for inheritance, @classmethod and @staticmethod decorators.",
      "File I/O: always use 'with open(path, 'r') as f:' to ensure automatic buffer flushing and resource cleanup.",
    ],
  },
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
    title: "Large Language Model Architecture Notes",
    type: "notes",
    course: "Large Language Models & Deep AI",
    courseId: "c10",
    readTime: "8 min read",
    updated: "1 week ago",
    excerpt: "Self-attention mechanism, multi-head projections, causal masking and training dynamics from scratch.",
    body: [
      "Self-attention: queries and keys interact via dot-product to produce affinity weights normalized by softmax.",
      "Causal masking: autoregressive LLMs forbid looking at future tokens using lower-triangular attention masks.",
      "Feed-forward layers: expand dimension (typically 4x) with non-linear activations (GELU/SwiGLU) for knowledge capacity.",
      "Residual connections and LayerNorm/RMSNorm stabilize deep backpropagation across dozens of layers.",
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
    excerpt: "Auto-generated digest of 'Attention and Transformers' with timestamps and key equations.",
    body: [
      "[00:00] Why recurrence limits parallelism: token t needs token t-1's hidden state.",
      "[04:12] Attention replaces sequential passing with direct lookup: softmax(QKᵀ/√d)V.",
      "[09:40] Multi-head = parallel matchings; heads specialize (syntax, position, semantics).",
      "[14:05] Why √d: keeps softmax out of saturation, preserving gradients.",
    ],
  },
  {
    id: "mat5",
    title: "Modern React State & Hooks Blueprint",
    type: "summary",
    course: "Modern React 19 & Full-Stack Web Development",
    courseId: "c3",
    readTime: "7 min read",
    updated: "2 weeks ago",
    excerpt: "Component lifecycles, custom hooks patterns, and full-stack API integration that actually ships.",
    body: [
      "React 19 Actions: simplify async transitions with useActionState and useOptimistic.",
      "Custom hooks: extract stateful logic into pure, reusable functions prefix with 'use'.",
      "Effect hygiene: keep useEffect for synchronizing with external systems, not for computing derived state.",
      "Rendering optimization: leverage useMemo and useCallback judiciously when passing callbacks to memoized children.",
    ],
  },
  {
    id: "mat6",
    title: "Docker Layers & Caches — Quick Reference",
    type: "cheatsheet",
    course: "Docker & Containerization Crash Course",
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
    title: "Divide & Conquer and Asymptotics Guide",
    type: "notes",
    course: "Data Structures & Algorithms Masterclass",
    courseId: "c2",
    readTime: "6 min read",
    updated: "3 weeks ago",
    excerpt: "Master Theorem formulas, recurrence relations, and quick-sort partitioning nuances.",
    body: [
      "Master Theorem: T(n) = aT(n/b) + f(n). Compare f(n) with n^(log_b a) to instantly determine asymptotic bounds.",
      "Quick sort vs Merge sort: Quick sort is in-place O(1) space with O(n log n) expected; Merge sort is stable but requires O(n) auxiliary space.",
      "Graph traversals: BFS uses a queue (FIFO) and finds shortest unweighted paths; DFS uses a stack/recursion for cycle detection and topological sorting.",
    ],
  },
  {
    id: "mat8",
    title: "SQL Joins & Normalization Explained",
    type: "summary",
    course: "Database Design & SQL Complete Course",
    courseId: "c4",
    readTime: "5 min read",
    updated: "1 month ago",
    excerpt: "Relational integrity, JOIN variations, and eliminating anomalies through 1NF, 2NF and 3NF.",
    body: [
      "INNER JOIN returns matching rows in both tables; LEFT JOIN keeps all rows from the left table.",
      "1NF: Atomic values only. 2NF: No partial dependency on a composite key. 3NF: No transitive dependency.",
      "Indexes (B-Trees): dramatically speed up WHERE filtering and JOIN performance at the cost of slight write overhead.",
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
