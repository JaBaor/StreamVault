import Link from "next/link";
import type { Anime } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export function VideoCard({ anime, priority }: { anime: Anime; priority?: boolean }) {
  return (
    <Link
      href={`/anime/${anime.slug}`}
      className="group block shrink-0 w-[140px] sm:w-[160px] md:w-[180px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800 shadow-lg transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-orange-900/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anime.posterUrl}
          alt={anime.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
          width={180}
          height={270}
        />
        {anime.isPremium && (
          <span className="absolute left-2 top-2">
            <Badge variant="premium">Premium</Badge>
          </span>
        )}
        {anime.status === "ongoing" && (
          <span className="absolute right-2 top-2">
            <Badge variant="live">New</Badge>
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="line-clamp-2 text-xs font-medium text-white">{anime.description}</p>
        </div>
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-white group-hover:text-[var(--sv-orange)]">
        {anime.title}
      </h3>
      <p className="text-xs text-zinc-500">
        ★ {anime.rating} · {anime.year}
      </p>
    </Link>
  );
}
