import type { Anime } from "@/lib/types";
import { VideoCard } from "./VideoCard";

export function ContentRow({ title, anime }: { title: string; anime: Anime[] }) {
  if (!anime.length) return null;
  return (
    <section className="py-6">
      <h2 className="mb-4 px-4 text-lg font-bold text-white sm:px-6 lg:px-8">{title}</h2>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6 lg:px-8">
        {anime.map((a, i) => (
          <VideoCard key={a.id} anime={a} priority={i < 3} />
        ))}
      </div>
    </section>
  );
}
