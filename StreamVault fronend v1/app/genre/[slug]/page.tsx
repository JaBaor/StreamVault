import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoCard } from "@/components/video/VideoCard";
import { fetchCatalogAnime, fetchCatalogGenres } from "@/lib/catalog";

export default async function GenrePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [genres, all] = await Promise.all([
    fetchCatalogGenres(),
    fetchCatalogAnime(),
  ]);
  const genre = genres.find((g) => g.slug === slug || g.id === slug);
  if (!genre) notFound();

  const shows = all.filter((a) => a.genreIds.includes(genre.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">{genre.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-white">{genre.name}</h1>
      {genre.description && (
        <p className="mt-2 max-w-2xl text-zinc-400">{genre.description}</p>
      )}
      <p className="mt-2 text-sm text-zinc-500">{shows.length} shows</p>
      <div className="mt-8 flex flex-wrap gap-4">
        {shows.map((a) => (
          <VideoCard key={a.id} anime={a} />
        ))}
      </div>
      {shows.length === 0 && (
        <p className="mt-12 text-center text-zinc-500">No shows in this genre yet.</p>
      )}
    </div>
  );
}
