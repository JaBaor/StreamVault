import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimeDetailClient } from "./AnimeDetailClient";
import { getAnimeBySlug, getEpisodesForAnime } from "@/lib/catalog";
import { genres } from "@/lib/mock-data";

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const anime = getAnimeBySlug(slug);
  if (!anime) notFound();

  const eps = getEpisodesForAnime(anime.id);
  const animeGenres = genres.filter((g) => anime.genreIds.includes(g.id));
  const firstEp = eps[0];

  return (
    <div className="pb-12">
      <div className="relative h-[40vh] min-h-[240px] max-h-[480px] w-full overflow-hidden sm:h-[50vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.bannerUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--sv-bg)] via-[var(--sv-bg)]/60 to-transparent" />
        <div className="absolute bottom-0 mx-auto flex w-full max-w-7xl gap-4 px-4 pb-6 sm:gap-6 sm:px-6 lg:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={anime.posterUrl}
            alt={anime.title}
            className="hidden h-40 w-28 shrink-0 rounded-lg object-cover shadow-2xl sm:block md:h-52 md:w-36"
            width={144}
            height={208}
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-white sm:text-4xl">{anime.title}</h1>
            {anime.titleJp && (
              <p className="text-sm text-zinc-400 sm:text-base">{anime.titleJp}</p>
            )}
            <p className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-400">
              <span>★ {anime.rating}</span>
              <span>·</span>
              <span>{anime.year}</span>
              <span>·</span>
              <span className="capitalize">{anime.status}</span>
              <span>·</span>
              <span>{eps.length} episodes</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {animeGenres.map((g) => (
                <Link
                  key={g.id}
                  href={`/genre/${g.slug}`}
                  className="rounded-full bg-zinc-800 px-3 py-0.5 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  {g.name}
                </Link>
              ))}
            </div>
            {firstEp && (
              <Link
                href={`/watch/${anime.id}/${firstEp.id}`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--sv-orange)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--sv-orange-hover)]"
              >
                ▶ Watch now
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mt-6 max-w-3xl leading-relaxed text-zinc-300">{anime.description}</p>
        <AnimeDetailClient anime={anime} episodes={eps} />
      </div>
    </div>
  );
}
