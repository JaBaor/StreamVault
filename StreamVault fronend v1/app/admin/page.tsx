"use client";

import { getCatalogAnime, getCatalogGenres } from "@/lib/catalog";
import { DEMO_ACCOUNTS } from "@/lib/mock-data";
import { getItem } from "@/lib/storage";
import type { User } from "@/lib/types";

export default function AdminDashboardPage() {
  const anime = getCatalogAnime();
  const genres = getCatalogGenres();
  const registered = getItem<User[]>("registered-users", []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Anime titles" value={anime.length} />
      <StatCard label="Genres" value={genres.length} />
      <StatCard
        label="Users"
        value={DEMO_ACCOUNTS.length + registered.length}
      />
      <StatCard label="Premium shows" value={anime.filter((a) => a.isPremium).length} />
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
