import Link from "next/link";
import type { Episode } from "@/lib/types";

export function EpisodeNav({
  animeId,
  episodes,
  currentId,
  canWatch,
}: {
  animeId: string;
  episodes: Episode[];
  currentId: string;
  canWatch: (ep: Episode) => boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-2 text-sm font-semibold text-zinc-400">Episodes</h3>
      <div className="max-h-[400px] overflow-y-auto rounded-lg border border-zinc-800">
        {episodes.map((ep) => {
          const active = ep.id === currentId;
          const locked = !canWatch(ep);
          const content = (
            <div
              className={`flex items-center gap-3 border-b border-zinc-800/50 px-3 py-2.5 text-sm transition-colors last:border-0 ${
                active
                  ? "bg-[var(--sv-orange)]/15 text-[var(--sv-orange)]"
                  : locked
                    ? "text-zinc-600"
                    : "text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-800 text-xs font-bold">
                {locked ? "🔒" : ep.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{ep.title}</p>
                <p className="text-xs text-zinc-500">{ep.duration}</p>
              </div>
              {ep.isPremium && (
                <span className="shrink-0 text-[10px] font-bold uppercase text-amber-500">
                  Premium
                </span>
              )}
            </div>
          );

          if (locked) {
            return <div key={ep.id}>{content}</div>;
          }

          return (
            <Link key={ep.id} href={`/watch/${animeId}/${ep.id}`}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
