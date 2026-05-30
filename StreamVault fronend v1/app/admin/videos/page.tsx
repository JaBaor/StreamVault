"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createMovie,
  deleteMovie,
  fetchCatalogAnime,
  fetchCatalogGenres,
  updateMovie,
  type MoviePayload,
} from "@/lib/catalog";
import type { Anime, Genre } from "@/lib/types";

type MovieForm = MoviePayload & { id?: string };

const emptyForm: MovieForm = {
  title: "",
  description: "",
  release_year: new Date().getFullYear(),
  duration: 90,
  poster_url: "",
  trailer_url: "",
  video_url: "",
  access_level: "free",
};

export default function AdminVideosPage() {
  const [list, setList] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [editing, setEditing] = useState<MovieForm | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const [movies, genreRows] = await Promise.all([
      fetchCatalogAnime(),
      fetchCatalogGenres(),
    ]);
    setList(movies);
    setGenres(genreRows);
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadData().catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load movies.");
      });
    });
  }, []);

  const genreById = useMemo(
    () => new Map(genres.map((genre) => [genre.id, genre.name])),
    [genres]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this title?")) return;
    setError("");
    try {
      await deleteMovie(id);
      setList((current) => current.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete movie.");
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing?.title.trim()) return;
    setIsSaving(true);
    setError("");

    const payload: MoviePayload = {
      title: editing.title.trim(),
      description: editing.description?.trim() || undefined,
      release_year: editing.release_year ? Number(editing.release_year) : undefined,
      duration: editing.duration ? Number(editing.duration) : undefined,
      poster_url: editing.poster_url?.trim() || undefined,
      trailer_url: editing.trailer_url?.trim() || undefined,
      video_url: editing.video_url?.trim() || undefined,
      access_level: editing.access_level,
      genre_id: editing.genre_id ? Number(editing.genre_id) : undefined,
    };

    try {
      const saved = editing.id
        ? await updateMovie(editing.id, payload)
        : await createMovie(payload);
      setList((current) => {
        const exists = current.some((a) => a.id === saved.id);
        return exists
          ? current.map((a) => (a.id === saved.id ? saved : a))
          : [saved, ...current];
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save movie.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (anime: Anime) => {
    setEditing({
      id: anime.id,
      title: anime.title,
      description: anime.description,
      release_year: anime.year,
      duration: undefined,
      poster_url: anime.posterUrl,
      trailer_url: "",
      video_url: "",
      access_level: anime.isPremium ? "premium" : "free",
      genre_id: anime.genreIds[0] ? Number(anime.genreIds[0]) : undefined,
    });
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Movie management</h2>
          <p className="mt-1 text-sm text-zinc-500">Create and edit backend movie records.</p>
        </div>
        <Button size="sm" onClick={() => setEditing(emptyForm)}>
          Add movie
        </Button>
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Genre</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a, i) => (
              <tr key={`${a.id}:${a.slug}:${i}`} className="border-t border-zinc-800">
                <td className="px-4 py-3 text-white">{a.title}</td>
                <td className="px-4 py-3">{a.year}</td>
                <td className="px-4 py-3">{genreById.get(a.genreIds[0]) ?? "Unassigned"}</td>
                <td className="px-4 py-3">{a.isPremium ? "Premium" : "Free"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="mr-3 text-[var(--sv-orange)]"
                    onClick={() => startEdit(a)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-400"
                    onClick={() => handleDelete(a.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <form
          onSubmit={handleSave}
          className="mt-6 grid max-w-3xl gap-4 rounded-xl border border-zinc-700 bg-zinc-900 p-6 sm:grid-cols-2"
        >
          <h3 className="font-semibold text-white sm:col-span-2">
            {editing.id ? "Edit movie" : "Add movie"}
          </h3>
          <Input
            label="Title"
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            required
          />
          <Input
            label="Release year"
            type="number"
            value={editing.release_year ?? ""}
            onChange={(e) =>
              setEditing({ ...editing, release_year: Number(e.target.value) || undefined })
            }
          />
          <Input
            label="Duration minutes"
            type="number"
            value={editing.duration ?? ""}
            onChange={(e) =>
              setEditing({ ...editing, duration: Number(e.target.value) || undefined })
            }
          />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
            Genre
            <select
              value={editing.genre_id ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, genre_id: Number(e.target.value) || undefined })
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-[var(--sv-orange)] focus:outline-none"
            >
              <option value="">Unassigned</option>
              {genres.map((genre, i) => (
                <option key={`${genre.id}:${i}`} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Poster URL"
            value={editing.poster_url ?? ""}
            onChange={(e) => setEditing({ ...editing, poster_url: e.target.value })}
          />
          <Input
            label="Trailer URL"
            value={editing.trailer_url ?? ""}
            onChange={(e) => setEditing({ ...editing, trailer_url: e.target.value })}
          />
          <Input
            label="Movie URL"
            value={editing.video_url ?? ""}
            onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
          />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
            Access
            <select
              value={editing.access_level}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  access_level: e.target.value as "free" | "premium",
                })
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-[var(--sv-orange)] focus:outline-none"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300 sm:col-span-2">
            Description
            <textarea
              value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={4}
              className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-[var(--sv-orange)] focus:outline-none"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
