"use client";

import Link from "next/link";
import type { Anime } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { getEpisodesForAnime } from "@/lib/catalog";

export function HeroBanner({ anime }: { anime: Anime }) {
  const firstEp = getEpisodesForAnime(anime.id)[0];

  return (
    <section className="relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh]">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.bannerUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--sv-bg)] via-[var(--sv-bg)]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--sv-bg)] via-transparent to-transparent" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-12 pt-32 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--sv-orange)]">
          Featured
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black text-white sm:text-4xl lg:text-5xl">
          {anime.title}
        </h1>
        {anime.titleJp && (
          <p className="mt-1 text-zinc-400">{anime.titleJp}</p>
        )}
        <p className="mt-4 max-w-xl line-clamp-3 text-sm text-zinc-300 sm:text-base">
          {anime.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span>★ {anime.rating}</span>
          <span>·</span>
          <span>{anime.year}</span>
          <span>·</span>
          <span className="capitalize">{anime.status}</span>
          <span>·</span>
          <span>{anime.episodeCount} episodes</span>
          {anime.isPremium && (
            <>
              <span>·</span>
              <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/40">
                Premium
              </span>
            </>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {firstEp && (
            <Link href={`/watch/${anime.id}/${firstEp.id}`}>
              <Button size="lg">Watch now</Button>
            </Link>
          )}
          {anime.trailerUrl && (
            <Link href={`/anime/${anime.slug}#trailer`}>
              <Button variant="secondary" size="lg">
                Trailer
              </Button>
            </Link>
          )}
          <Link href={`/anime/${anime.slug}`}>
            <Button variant="outline" size="lg">
              More info
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
