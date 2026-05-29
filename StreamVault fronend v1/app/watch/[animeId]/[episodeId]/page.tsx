"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { AccessGate } from "@/components/video/AccessGate";
import { EpisodeNav } from "@/components/video/EpisodeNav";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { canWatchEpisode } from "@/lib/access";
import {
  getAnimeById,
  getEpisode,
  getEpisodesForAnime,
} from "@/lib/catalog";

const VideoPlayer = dynamic(
  () => import("@/components/video/VideoPlayer").then((m) => m.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-zinc-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--sv-orange)] border-t-transparent" />
      </div>
    ),
  }
);

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const animeId = params.animeId as string;
  const episodeId = params.episodeId as string;
  const { user, isSubscriber } = useAuth();
  const { addToHistory, history } = useUserData();

  const anime = getAnimeById(animeId);
  const episode = getEpisode(animeId, episodeId);
  const episodes = useMemo(
    () => (anime ? getEpisodesForAnime(anime.id) : []),
    [anime]
  );

  const historyItem = history.find(
    (h) => h.animeId === animeId && h.episodeId === episodeId
  );

  const access = episode
    ? canWatchEpisode(episode, user, isSubscriber)
    : { allowed: false };

  const handleProgress = useCallback(
    (progress: number) => {
      if (!anime || !episode) return;
      if (progress > 5) {
        addToHistory({ animeId: anime.id, episodeId: episode.id, progress });
      }
    },
    [anime, episode, addToHistory]
  );

  const goNext = useCallback(() => {
    if (!episode || !episodes.length) return;
    const idx = episodes.findIndex((e) => e.id === episode.id);
    const next = episodes[idx + 1];
    if (next) router.push(`/watch/${animeId}/${next.id}`);
  }, [episode, episodes, animeId, router]);

  if (!anime || !episode) {
    return (
      <div className="p-12 text-center">
        <p className="text-zinc-400">Episode not found.</p>
        <Link href="/" className="mt-4 inline-block text-[var(--sv-orange)]">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-zinc-500">
        <Link href={`/anime/${anime.slug}`} className="hover:text-white">
          {anime.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">
          Episode {episode.number}
        </span>
      </nav>

      {!access.allowed && access.reason ? (
        <AccessGate reason={access.reason} animeTitle={anime.title} />
      ) : (
        <VideoPlayer
          episode={episode}
          initialProgress={historyItem?.progress ?? 0}
          onProgress={handleProgress}
          onEnded={goNext}
        />
      )}

      <div className="mt-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">
          {episode.number}. {episode.title}
        </h1>
        <p className="text-sm text-zinc-500">{episode.duration}</p>
      </div>

      <div className="mt-8 max-w-sm">
        <EpisodeNav
          animeId={anime.id}
          episodes={episodes}
          currentId={episode.id}
          canWatch={(ep) => canWatchEpisode(ep, user, isSubscriber).allowed}
        />
      </div>
    </div>
  );
}
