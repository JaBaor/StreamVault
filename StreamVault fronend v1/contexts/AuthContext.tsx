"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEMO_ACCOUNTS } from "@/lib/mock-data";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getItem<User | null>("user", null));
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (account) {
      setUser(account.user);
      setItem("user", account.user);
      return { ok: true };
    }
    const stored = getItem<User[]>("registered-users", []);
    const found = stored.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    const cred = getItem<Record<string, string>>("passwords", {});
    if (found && cred[found.id] === password) {
      setUser(found);
      setItem("user", found);
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password." };
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const exists =
        DEMO_ACCOUNTS.some((a) => a.email.toLowerCase() === email.toLowerCase()) ||
        getItem<User[]>("registered-users", []).some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
      if (exists) return { ok: false, error: "Email already registered." };
      const newUser: User = {
        id: `u-${Date.now()}`,
        email,
        displayName,
        role: "subscriber",
        subscriptionPlan: "free",
      };
      const users = getItem<User[]>("registered-users", []);
      users.push(newUser);
      setItem("registered-users", users);
      const cred = getItem<Record<string, string>>("passwords", {});
      cred[newUser.id] = password;
      setItem("passwords", cred);
      setUser(newUser);
      setItem("user", newUser);
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
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
      isSubscriber: role === "subscriber" || role === "admin",
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
