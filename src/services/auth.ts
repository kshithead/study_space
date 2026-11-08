// Authentication & Persistent Database Service for StudySpace
import { supabase, isSupabaseConfigured, uploadPdfToSupabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName: string;
  avatar: string;
  bio?: string;
  learningTrack?: string;
  handle: string;
  streak: number;
  level: number;
  levelName: string;
  xp: number;
  xpToNext: number;
  weeklyGoalHours?: number;
  hoursThisWeek?: number;
  joined: string;
  interests: string[];
  authProvider?: string;
}

interface StoredAccount extends UserProfile {
  password: string;
  createdAt: string;
}

export const DEFAULT_NEUTRAL_AVATAR = "/images/default-avatar.svg";

const TOKEN_KEY = "studyspace.auth.token";
const LOCAL_DB_KEY = "studyspace.db.accounts_v1";

function getApiBase(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    // On HTTPS deployments (like Vercel), calling http://127.0.0.1:8000 is blocked by browser mixed-content security
    return "";
  }
  return "http://127.0.0.1:8000";
}

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

// Map a Supabase PostgreSQL row into a UserProfile
function mapSupabaseUser(row: any): UserProfile {
  const name = row.full_name || "Student";
  const firstName = name.split(" ")[0] || "Student";
  return {
    id: row.id,
    email: row.email,
    name,
    firstName,
    avatar: row.avatar || DEFAULT_NEUTRAL_AVATAR,
    bio: row.bio || "",
    learningTrack: row.learning_track || "General Studies",
    handle: `@${firstName.toLowerCase()}.learns`,
    streak: typeof row.streak === "number" ? row.streak : 1,
    level: typeof row.level === "number" ? row.level : 1,
    levelName: row.level_name || "Explorer",
    xp: typeof row.xp === "number" ? row.xp : 150,
    xpToNext: typeof row.xp_to_next === "number" ? row.xp_to_next : 1000,
    weeklyGoalHours: Number(row.weekly_goal_hours || 6),
    hoursThisWeek: Number(row.hours_this_week || 0),
    joined: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "November 2026",
    interests: [row.learning_track || "General Studies", "Learning Science"],
    authProvider: row.auth_provider || "local",
  };
}

// ── Persistent Browser Database Fallback Layer ─────────────────────────────────
const SEED_ACCOUNTS: StoredAccount[] = [
  {
    id: "usr_demo_alex",
    email: "alex.carter@studyspace.app",
    password: "studyspace2026",
    name: "Alex Carter",
    firstName: "Alex",
    avatar: DEFAULT_NEUTRAL_AVATAR,
    bio: "Computer Science senior specializing in AI systems and distributed learning architectures.",
    learningTrack: "Computer Science & AI",
    handle: "@alex.learns",
    streak: 7,
    level: 4,
    levelName: "Scholar",
    xp: 2850,
    xpToNext: 4000,
    weeklyGoalHours: 6,
    hoursThisWeek: 4.5,
    joined: "March 2026",
    interests: ["Computer Science & AI", "Machine Learning", "FastAPI"],
    authProvider: "local",
    createdAt: new Date().toISOString(),
  },
];

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    return parsed;
  } catch {
    return SEED_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error("Failed to save accounts to local database:", e);
  }
}

function toPublicProfile(account: StoredAccount): UserProfile {
  const { password: _, ...profile } = account;
  return profile;
}

// ── Timeout-wrapped fetch helper ───────────────────────────────────────────────
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 2500
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ── Registration ───────────────────────────────────────────────────────────────
export async function registerUser(params: {
  email: string;
  password: string;
  fullName: string;
  avatar?: string;
  learningTrack?: string;
}): Promise<{ token: string; user: UserProfile }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.fullName.trim();
  const apiBase = getApiBase();

  // 1. If backend endpoint is reachable, attempt backend registration first
  if (apiBase) {
    try {
      const res = await fetchWithTimeout(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: params.password,
          full_name: cleanName,
          avatar: params.avatar || DEFAULT_NEUTRAL_AVATAR,
          learning_track: params.learningTrack || "General Studies",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed. Please try again.");
      }

      const token = data.access_token || data.token;
      authStorage.setToken(token);
      return { token, user: data.user };
    } catch (err: any) {
      if (err.message && !err.message.includes("fetch") && !err.message.includes("abort")) {
        throw err;
      }
      console.warn("Backend API unreachable, checking Supabase / local DB:", err);
    }
  }

  // 2. If Supabase PostgreSQL is configured, register directly in Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existing) {
        throw new Error("An account with this email address already exists. Please sign in instead.");
      }

      const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const { data: inserted, error: insErr } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: cleanEmail,
          password_hash: params.password,
          full_name: cleanName,
          avatar: params.avatar || DEFAULT_NEUTRAL_AVATAR,
          learning_track: params.learningTrack || "General Studies",
          bio: `Enrolled in ${params.learningTrack || "General Studies"}.`,
          streak: 1,
          level: 1,
          level_name: "Explorer",
          xp: 150,
          xp_to_next: 1000,
          weekly_goal_hours: 6,
          hours_this_week: 0,
        })
        .select()
        .single();

      if (insErr) {
        throw new Error(insErr.message);
      }

      const token = `sb_auth_${userId}`;
      authStorage.setToken(token);

      return {
        token,
        user: mapSupabaseUser(inserted),
      };
    } catch (sbErr: any) {
      if (sbErr.message && !sbErr.message.includes("fetch")) {
        throw sbErr;
      }
      console.warn("Supabase query failed, falling back to local DB:", sbErr);
    }
  }

  // 3. Persistent Client-Side Database Fallback
  const accounts = getStoredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error("An account with this email address already exists. Please sign in instead.");
  }

  const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const firstName = cleanName.split(" ")[0] || "Student";
  const newAccount: StoredAccount = {
    id: userId,
    email: cleanEmail,
    password: params.password,
    name: cleanName,
    firstName,
    avatar: params.avatar || DEFAULT_NEUTRAL_AVATAR,
    bio: `Enrolled in ${params.learningTrack || "General Studies"}.`,
    learningTrack: params.learningTrack || "General Studies",
    handle: `@${firstName.toLowerCase()}.learns`,
    streak: 1,
    level: 1,
    levelName: "Explorer",
    xp: 150,
    xpToNext: 1000,
    weeklyGoalHours: 6,
    hoursThisWeek: 0,
    joined: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    interests: [params.learningTrack || "General Studies", "Problem Solving", "Learning"],
    authProvider: "local",
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  const localToken = `local_auth_${userId}`;
  authStorage.setToken(localToken);

  return {
    token: localToken,
    user: toPublicProfile(newAccount),
  };
}

// ── Login ──────────────────────────────────────────────────────────────────────
export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ token: string; user: UserProfile }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const apiBase = getApiBase();

  // 1. Backend Login
  if (apiBase) {
    try {
      const res = await fetchWithTimeout(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: params.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid email or password.");
      }

      const token = data.access_token || data.token;
      authStorage.setToken(token);
      return { token, user: data.user };
    } catch (err: any) {
      if (err.message && !err.message.includes("fetch") && !err.message.includes("abort")) {
        throw err;
      }
      console.warn("Backend API unreachable, checking Supabase / local DB:", err);
    }
  }

  // 2. Supabase PostgreSQL Login
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: userRow } = await supabase
        .from("users")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (!userRow || userRow.password_hash !== params.password) {
        throw new Error("Invalid email or password. Please check your credentials.");
      }

      const token = `sb_auth_${userRow.id}`;
      authStorage.setToken(token);

      return {
        token,
        user: mapSupabaseUser(userRow),
      };
    } catch (sbErr: any) {
      if (sbErr.message && !sbErr.message.includes("fetch")) {
        throw sbErr;
      }
      console.warn("Supabase query failed, checking local database:", sbErr);
    }
  }

  // 3. Persistent Client-Side Database Fallback
  const accounts = getStoredAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!account || account.password !== params.password) {
    throw new Error("Invalid email or password. Please check your credentials.");
  }

  const localToken = `local_auth_${account.id}`;
  authStorage.setToken(localToken);

  return {
    token: localToken,
    user: toPublicProfile(account),
  };
}

// ── Get Current Session ────────────────────────────────────────────────────────
export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = authStorage.getToken();
  if (!token) return null;

  // Supabase session
  if (token.startsWith("sb_auth_") && isSupabaseConfigured && supabase) {
    try {
      const userId = token.replace("sb_auth_", "");
      const { data: userRow } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (userRow) return mapSupabaseUser(userRow);
    } catch {
      // Fallback
    }
  }

  // Local persistent DB session
  if (token.startsWith("local_auth_")) {
    const userId = token.replace("local_auth_", "");
    const accounts = getStoredAccounts();
    const account = accounts.find((a) => a.id === userId);
    return account ? toPublicProfile(account) : null;
  }

  const apiBase = getApiBase();
  if (apiBase) {
    try {
      const res = await fetchWithTimeout(`${apiBase}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          authStorage.removeToken();
        }
        return null;
      }

      const data = await res.json();
      return data.user;
    } catch (err) {
      console.warn("Backend /me unreachable:", err);
    }
  }

  return null;
}

// ── Update Profile ─────────────────────────────────────────────────────────────
export async function updateUserProfile(params: {
  fullName?: string;
  avatar?: string;
  bio?: string;
  learningTrack?: string;
}): Promise<UserProfile> {
  const token = authStorage.getToken();
  if (!token) throw new Error("Authentication required.");

  // Supabase update
  if (token.startsWith("sb_auth_") && isSupabaseConfigured && supabase) {
    try {
      const userId = token.replace("sb_auth_", "");
      const updates: any = {};
      if (params.fullName) updates.full_name = params.fullName.trim();
      if (params.avatar !== undefined) updates.avatar = params.avatar;
      if (params.bio !== undefined) updates.bio = params.bio;
      if (params.learningTrack !== undefined) updates.learning_track = params.learningTrack;

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (!error && data) {
        return mapSupabaseUser(data);
      }
    } catch (e) {
      console.warn("Supabase profile update warning:", e);
    }
  }

  const apiBase = getApiBase();
  if (apiBase && !token.startsWith("local_auth_") && !token.startsWith("sb_auth_")) {
    try {
      const res = await fetchWithTimeout(`${apiBase}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: params.fullName,
          avatar: params.avatar,
          bio: params.bio,
          learning_track: params.learningTrack,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update profile.");
      }

      return data.user;
    } catch (err: any) {
      if (err.message && !err.message.includes("fetch") && !err.message.includes("abort")) {
        throw err;
      }
    }
  }

  // Persistent Client-Side Database Fallback
  const accounts = getStoredAccounts();
  const userId = token.replace(/^(local_auth_|sb_auth_)/, "");
  let account = accounts.find((a) => a.id === userId) || accounts[0];

  if (!account) {
    throw new Error("User account not found.");
  }

  if (params.fullName) {
    account.name = params.fullName.trim();
    account.firstName = params.fullName.trim().split(" ")[0];
  }
  if (params.avatar !== undefined) {
    account.avatar = params.avatar;
  }
  if (params.bio !== undefined) {
    account.bio = params.bio;
  }
  if (params.learningTrack !== undefined) {
    account.learningTrack = params.learningTrack;
  }

  saveStoredAccounts(accounts);
  return toPublicProfile(account);
}

// ── Upload Avatar ──────────────────────────────────────────────────────────────
export async function uploadUserAvatar(file: File): Promise<UserProfile> {
  const token = authStorage.getToken();
  if (!token) throw new Error("Authentication required.");

  // If Supabase is configured, upload avatar to Supabase Storage
  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split(".").pop() || "png";
      const filePath = `avatars/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("study-materials").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (!upErr) {
        const { data: pubData } = supabase.storage.from("study-materials").getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return await updateUserProfile({ avatar: pubData.publicUrl });
        }
      }
    } catch (e) {
      console.warn("Supabase avatar upload warning:", e);
    }
  }

  // Fallback to Base64 Data URI
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUri = reader.result as string;
        const updated = await updateUserProfile({ avatar: dataUri });
        resolve(updated);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

// ── Social OAuth URL Provider ──────────────────────────────────────────────────
export async function getOAuthUrl(provider: string): Promise<string> {
  const apiBase = getApiBase();
  if (apiBase) {
    try {
      const res = await fetchWithTimeout(`${apiBase}/api/auth/oauth/${provider}/url`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `OAuth for ${provider} is not configured.`);
      }
      return data.auth_url;
    } catch (err: any) {
      if (err.message && !err.message.includes("fetch") && !err.message.includes("abort")) {
        throw err;
      }
    }
  }
  throw new Error(
    `${provider} OAuth is not configured on this deployment. Please sign in or register with email and password.`
  );
}
