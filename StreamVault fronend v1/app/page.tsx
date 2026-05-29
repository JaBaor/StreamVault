import { ContentRow } from "@/components/video/ContentRow";
import { HeroBanner } from "@/components/video/HeroBanner";
import { getCatalogAnime } from "@/lib/catalog";
import { genres } from "@/lib/mock-data";
import Link from "next/link";

export default function HomePage() {
  const all = getCatalogAnime();
  const featured = all.filter((a) => a.featured);
  const hero = featured[0] ?? all[0];
  const trending = [...all].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const newReleases = all.filter((a) => a.status === "ongoing");
  const premium = all.filter((a) => a.isPremium);

  return (
    <div className="pb-12">
      {hero && <HeroBanner anime={hero} />}
      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-8 sm:px-6 lg:px-8">
        <section>
          <h2 className="mb-4 text-lg font-bold text-white">Browse by genre</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Link
                key={g.id}
                href={`/genre/${g.slug}`}
                className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:border-[var(--sv-orange)] hover:text-[var(--sv-orange)]"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </section>
        <ContentRow title="Trending now" anime={trending} />
        <ContentRow title="New episodes" anime={newReleases} />
        <ContentRow title="Premium picks" anime={premium} />
        <ContentRow title="All shows" anime={all} />
      </div>
    </div>
  );
}
