"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  allowedRoles = ["member", "subscriber", "admin"],
  redirectTo = "/login",
  fallback,
}: AuthGuardProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !allowedRoles.includes(role)) {
      router.replace(redirectTo);
    }
  }, [user, role, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      fallback ?? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--sv-orange)] border-t-transparent" />
        </div>
      )
    );
  }

  if (!user || !allowedRoles.includes(role)) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["admin"]} redirectTo="/login?admin=1">
      {children}
    </AuthGuard>
  );
}

export function SubscriberGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["member", "subscriber", "admin"]} redirectTo="/login">
      {children}
    </AuthGuard>
  );
}
