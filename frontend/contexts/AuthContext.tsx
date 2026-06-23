"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, clearAccessToken, getAccessToken, setAccessToken } from "@/lib/api";
import { hasPremiumAccess } from "@/lib/access";
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
  updateProfile: (data: Partial<User>) => Promise<{ ok: boolean; error?: string }>;
  isSubscriber: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type BackendUser = {
  id: number | string;
  username?: string;
  email?: string;
  role?: "member" | "subscriber" | "admin" | string;
  avatar_url?: string | null;
};

function mapBackendUser(user: BackendUser, fallbackEmail = ""): User {
  const backendRole = String(user.role ?? "").toLowerCase();
  const role: UserRole =
    backendRole === "admin" ? "admin" : backendRole === "subscriber" ? "subscriber" : "member";
  return {
    id: String(user.id),
    email: user.email ?? fallbackEmail,
    displayName: user.username ?? user.email ?? fallbackEmail,
    avatarUrl: user.avatar_url || undefined,
    role,
    subscriptionPlan: role === "subscriber" || role === "admin" ? "premium" : "free",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const token = getAccessToken();
      if (token) {
        try {
          const data = await apiFetch("/users/me");
          const nextUser = mapBackendUser(data);
          setUser(nextUser);
          setItem("user", nextUser);
        } catch {
          clearAccessToken();
          removeItem("user");
          setUser(null);
        }
      } else {
        setUser(getItem<User | null>("user", null));
      }
      setIsLoading(false);
    }
    init();
    const onSessionExpired = () => {
      clearAccessToken();
      setUser(null);
      removeItem("user");
      const isLoginPage = window.location.pathname.startsWith("/login");
      if (!isLoginPage) {
        router.replace("/login");
      }
    };
    window.addEventListener("streamvault:session-expired", onSessionExpired);
    return () => window.removeEventListener("streamvault:session-expired", onSessionExpired);
  }, [router]);

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
    void apiFetch("/auth/logout", { method: "POST", _silent: true }).catch(() => undefined);
    clearAccessToken();
    setUser(null);
    removeItem("user");
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const payload: Record<string, string> = {};
      if (data.displayName) payload.display_name = data.displayName;
      if (data.avatarUrl) payload.avatar_url = data.avatarUrl;
      if (Object.keys(payload).length > 0) {
        await apiFetch("/users/me", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (data.displayName !== undefined) next.displayName = data.displayName;
        if (data.avatarUrl !== undefined) next.avatarUrl = data.avatarUrl;
        if (data.subscriptionPlan !== undefined) next.subscriptionPlan = data.subscriptionPlan;
        if (data.subscriptionExpires !== undefined) next.subscriptionExpires = data.subscriptionExpires;
        setItem("user", next);
        const users = getItem<User[]>("registered-users", []);
        const idx = users.findIndex((u) => u.id === next.id);
        if (idx >= 0) {
          users[idx] = next;
          setItem("registered-users", users);
        }
        return next;
      });
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Update failed",
      };
    }
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
      isSubscriber: hasPremiumAccess(user),
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
