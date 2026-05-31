"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, clearAccessToken, setAccessToken } from "@/lib/api";
import { getItem, removeItem, setItem } from "@/lib/storage";
import type { User, UserRole } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isSubscriber: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type BackendUser = {
  id: number | string;
  username?: string;
  email?: string;
  role?: "member" | "subscriber" | "admin" | string;
};

function mapBackendUser(user: BackendUser, fallbackEmail = ""): User {
  const backendRole = String(user.role ?? "").toLowerCase();
  const role: UserRole =
    backendRole === "admin" ? "admin" : backendRole === "subscriber" ? "subscriber" : "member";
  return {
    id: String(user.id),
    email: user.email ?? fallbackEmail,
    displayName: user.username ?? user.email ?? fallbackEmail,
    role,
    subscriptionPlan: role === "admin" ? "premium" : "free",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setUser(getItem<User | null>("user", null));
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      clearAccessToken();
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: email, password }),
      });
      setAccessToken(data.accessToken);
      const nextUser = mapBackendUser(data.user, email);
      setUser(nextUser);
      setItem("user", nextUser);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid username or password.",
      };
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: displayName,
            email,
            password,
            role: "GUEST",
          }),
        });
        return login(email, password);
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Registration failed.",
        };
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    void apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    clearAccessToken();
    setUser(null);
    removeItem("user");
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      setItem("user", next);
      const users = getItem<User[]>("registered-users", []);
      const idx = users.findIndex((u) => u.id === next.id);
      if (idx >= 0) {
        users[idx] = next;
        setItem("registered-users", users);
      }
      return next;
    });
  }, []);

  const role: UserRole = user?.role ?? "guest";

  const value = useMemo(
    () => ({
      user,
      role,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      isSubscriber: role === "member" || role === "subscriber" || role === "admin",
      isAdmin: role === "admin",
    }),
    [user, role, isLoading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
