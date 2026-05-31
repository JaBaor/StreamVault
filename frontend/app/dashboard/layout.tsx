"use client";

import { SubscriberGuard } from "@/components/auth/AuthGuard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriberGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white">My dashboard</h1>
        <DashboardNav />
        <div className="mt-8">{children}</div>
      </div>
    </SubscriberGuard>
  );
}
