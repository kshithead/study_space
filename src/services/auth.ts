// Authentication Service for StudySpace
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

export const DEFAULT_NEUTRAL_AVATAR = "/images/default-avatar.svg";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "studyspace.auth.token";

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

export async function registerUser(params: {
  email: string;
  password: string;
  fullName: string;
  avatar?: string;
  learningTrack?: string;
}): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      full_name: params.fullName,
      avatar: params.avatar || DEFAULT_NEUTRAL_AVATAR,
      learning_track: params.learningTrack || "General Studies",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Registration failed. Please try again.");
  }

  authStorage.setToken(data.access_token);
  return {
    token: data.access_token,
    user: data.user,
  };
}

export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Invalid email or password.");
  }

  authStorage.setToken(data.access_token);
  return {
    token: data.access_token,
    user: data.user,
  };
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = authStorage.getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
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
  } catch {
    return null;
  }
}

export async function updateUserProfile(params: {
  fullName?: string;
  avatar?: string;
  bio?: string;
  learningTrack?: string;
}): Promise<UserProfile> {
  const token = authStorage.getToken();
  if (!token) throw new Error("Authentication required.");

  const res = await fetch(`${API_BASE}/api/auth/profile`, {
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
}

export async function uploadUserAvatar(file: File): Promise<UserProfile> {
  const token = authStorage.getToken();
  if (!token) throw new Error("Authentication required.");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/auth/avatar/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Failed to upload avatar.");
  }

  return data.user;
}

export async function getOAuthUrl(provider: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/oauth/${provider}/url`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `OAuth for ${provider} failed.`);
  }
  return data.auth_url;
}
