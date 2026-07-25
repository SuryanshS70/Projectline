// Demo-only session state. Codex will replace this with a real auth context
// backed by JWT + refresh tokens.
import type { Role, User } from "@/data/types";
import { demoClient, demoVendor } from "@/data/users";

const STORAGE_KEY = "pm-demo-session";

export interface DemoSession {
  role: Role;
  userId: string;
}

export function getSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function setSession(role: Role): DemoSession {
  const user = role === "client" ? demoClient : demoVendor;
  const session: DemoSession = { role, userId: user.id };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function currentUser(): User {
  const session = getSession();
  if (!session) return demoClient;
  return session.role === "client" ? demoClient : demoVendor;
}
