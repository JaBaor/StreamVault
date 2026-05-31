"use client";

import { AdminGuard } from "@/components/auth/AuthGuard";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
          Admin panel
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">StreamVault Admin</h1>
        <AdminNav />
        {children}
      </div>
    </AdminGuard>
  );
}
