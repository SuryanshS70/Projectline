import { useSyncExternalStore } from "react";

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  setUnauthorizedHandler,
  type AuthUser,
} from "@/lib/api";
import { clearStoredToken, getStoredToken, storeToken } from "@/lib/session";

export interface AuthSnapshot {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const serverSnapshot: AuthSnapshot = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

class AuthStore {
  private snapshot: AuthSnapshot = serverSnapshot;
  private listeners = new Set<() => void>();
  private initialized = false;
  private restorePromise: Promise<void> | null = null;

  constructor() {
    setUnauthorizedHandler(() => this.clear());
  }

  getSnapshot = (): AuthSnapshot => this.snapshot;

  getServerSnapshot = (): AuthSnapshot => serverSnapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  async restore(): Promise<void> {
    if (this.initialized) return;
    if (this.restorePromise) return this.restorePromise;

    this.restorePromise = this.restoreSession();
    await this.restorePromise;
    this.restorePromise = null;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    this.update({ ...this.snapshot, isLoading: true });
    try {
      const result = await loginRequest(email, password);
      storeToken(result.token);
      this.initialized = true;
      this.update({
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
      });
      return result.user;
    } catch (error) {
      this.update({ ...this.snapshot, isLoading: false });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (getStoredToken()) await logoutRequest();
    } finally {
      this.clear();
    }
  }

  clear(): void {
    clearStoredToken();
    this.initialized = true;
    this.restorePromise = null;
    this.update({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }

  reset(): void {
    clearStoredToken();
    this.initialized = false;
    this.restorePromise = null;
    this.update(serverSnapshot);
  }

  private async restoreSession(): Promise<void> {
    const token = getStoredToken();
    if (!token) {
      this.initialized = true;
      this.update({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }

    this.update({ ...this.snapshot, isLoading: true });
    try {
      const user = await getCurrentUser();
      this.initialized = true;
      this.update({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      this.clear();
    }
  }

  private update(snapshot: AuthSnapshot): void {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}

export const authStore = new AuthStore();

export function useAuth(): AuthSnapshot {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot,
  );
}
