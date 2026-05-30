"use client";

import { useEffect, useState } from "react";
import { fetchAdminStats, type AdminStats } from "@/lib/catalog";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchAdminStats()
      .then(setStats)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load dashboard stats.");
      });
  }, []);

  const values = stats ?? {
    totalUsers: 0,
    totalMovies: 0,
    totalGenres: 0,
    viewsToday: 0,
  };

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={values.totalUsers} />
        <StatCard label="Movies" value={values.totalMovies} />
        <StatCard label="Genres" value={values.totalGenres} />
        <StatCard label="Views today" value={values.viewsToday} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
