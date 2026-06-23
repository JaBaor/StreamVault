"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchRatingStats,
  fetchReviews,
  submitReview,
} from "@/lib/catalog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TrailerPlayer } from "@/components/video/TrailerPlayer";
import { hasPremiumAccess } from "@/lib/access";
import type { Anime, Episode, RatingStats, Review } from "@/lib/types";

export function AnimeDetailClient({
  anime,
  episodes,
}: {
  anime: Anime;
  episodes: Episode[];
}) {
  const { user, role } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useUserData();
  const inList = isInWatchlist(anime.id);
  const canUseWatchlist = hasPremiumAccess(user);
  const canReview = role === "member" || role === "subscriber" || role === "admin";
  const [ratingStats, setRatingStats] = useState<RatingStats>({ average: null, count: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      const [stats, rows] = await Promise.all([
        fetchRatingStats(anime.id),
        fetchReviews(anime.id),
      ]);
      setRatingStats(stats);
      setReviews(rows);
    } catch {
      setRatingStats({ average: null, count: 0 });
      setReviews([]);
    }
  }, [anime.id]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadReviews();
    });
  }, [loadReviews]);

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setMessage("");
    try {
      await submitReview(anime.id, comment.trim(), Number(rating));
      setComment("");
      setMessage("Review submitted.");
      await loadReviews();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit review.");
    }
  };

  return (
    <>
      {anime.trailerUrl && (
        <section id="trailer" className="mt-10 scroll-mt-24">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Trailer</h2>
            <a
              href={anime.trailerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-zinc-400 transition-colors hover:text-[var(--sv-orange)]"
            >
              Open source
            </a>
          </div>
          <TrailerPlayer url={anime.trailerUrl} title={anime.title} />
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Episodes</h2>
          {canUseWatchlist ? (
            <Button
              variant={inList ? "secondary" : "outline"}
              size="sm"
              onClick={() => toggleWatchlist(anime.id)}
            >
              {inList ? "In watchlist" : "Add to watchlist"}
            </Button>
          ) : (
            <Link
              href="/dashboard/subscription"
              className="rounded-lg border border-amber-500/40 px-3 py-1.5 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/10"
            >
              Premium watchlist
            </Link>
          )}
        </div>
        <ul className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {episodes.map((ep, i) => (
            <li key={`${ep.id}:${i}`}>
              <Link
                href={`/watch/${anime.id}/${ep.id}`}
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-zinc-900"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">
                    {ep.number}. {ep.title}
                  </p>
                  <p className="text-xs text-zinc-500">{ep.duration}</p>
                </div>
                {ep.isPremium && <Badge variant="premium">Premium</Badge>}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <h2 className="text-xl font-bold text-white">Reviews</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {ratingStats.average ? `${ratingStats.average}/5 average` : "No ratings yet"} from{" "}
            {ratingStats.count} ratings
          </p>
          <div className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.review_id} className="px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-white">{review.username}</p>
                    {review.rating && (
                      <span className="text-sm text-[var(--sv-orange)]">{review.rating}/5</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{review.comment}</p>
                </article>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-500">No reviews yet.</p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmitReview}
          className="h-fit space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
        >
          <h3 className="font-semibold text-white">Write a review</h3>
          {canReview ? (
            <>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
                Rating
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-[var(--sv-orange)] focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
                Comment
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-[var(--sv-orange)] focus:outline-none"
                  required
                />
              </label>
              {message && <p className="text-sm text-zinc-400">{message}</p>}
              <Button type="submit" fullWidth>
                Submit review
              </Button>
            </>
          ) : (
            <p className="text-sm text-zinc-400">Sign in as a member or subscriber to review.</p>
          )}
        </form>
      </section>
    </>
  );
}
