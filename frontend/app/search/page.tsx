"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VideoCard } from "@/components/video/VideoCard";
import { fetchCatalogAnime, fetchCatalogGenres, getCatalogAnime, getCatalogGenres } from "@/lib/catalog";
import { genres as defaultGenres } from "@/lib/mock-data";
import type { Anime, Genre } from "@/lib/types";

function SearchContent() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState<"" | "ongoing" | "completed">("");
  const [sort, setSort] = useState<"rating" | "year" | "title">("rating");
  const [all, setAll] = useState<Anime[]>(() => getCatalogAnime());
  const [genreList, setGenreList] = useState<Genre[]>(() => {
    const local = getCatalogGenres();
    return local.length ? local : defaultGenres;
  });

  useEffect(() => {
    void fetchCatalogAnime().then(setAll).catch(() => undefined);
    void fetchCatalogGenres().then(setGenreList).catch(() => undefined);
  }, []);

  const results = useMemo(() => {
    let list = [...all];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.titleJp?.toLowerCase().includes(q)
      );
    }
    if (genre) {
      const g = genreList.find((x) => x.slug === genre);
      if (g) list = list.filter((a) => a.genreIds.includes(g.id));
    }
    if (status) list = list.filter((a) => a.status === status);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "year") list.sort((a, b) => b.year - a.year);
    else list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [all, query, genre, status, sort, genreList]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">Browse & search</h1>
      <div className="mt-6 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          placeholder="Search titles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:border-[var(--sv-orange)] focus:outline-none lg:col-span-2"
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        >
          <option value="">All genres</option>
          {genreList.map((g) => (
            <option key={g.id} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
        >
          <option value="">Any status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white sm:col-span-2 lg:col-span-1"
        >
          <option value="rating">Top rated</option>
          <option value="year">Newest year</option>
          <option value="title">A–Z</option>
        </select>
      </div>
      <p className="mt-4 text-sm text-zinc-500">{results.length} results</p>
      <div className="mt-6 flex flex-wrap gap-4">
        {results.map((a) => (
          <VideoCard key={a.id} anime={a} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="mt-12 text-center text-zinc-500">No shows match your filters.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
