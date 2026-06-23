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
import { apiFetch } from "@/lib/api";
import type { Anime, Episode, Genre } from "@/lib/types";

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
  type: "MOVIE",
  airing_status: "completed",
};

export default function AdminVideosPage() {
  const [list, setList] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [editing, setEditing] = useState<MovieForm | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [editingEpisode, setEditingEpisode] = useState<Partial<Episode> | null>(null);
  const [originalEpisode, setOriginalEpisode] = useState<Partial<Episode> | null>(null);
  const [thumbnailData, setThumbnailData] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadEpisodes = async (movieId: string) => {
    try {
      const result = await apiFetch(`/movies/${movieId}/episodes`);
      setEpisodes(result.data ?? []);
    } catch {
      setEpisodes([]);
    }
  };

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
      type: editing.type,
      airing_status: editing.airing_status,
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
      poster_url: anime._rawPosterUrl || "",
      trailer_url: anime.trailerUrl && anime.trailerUrl !== "/window.svg" ? anime.trailerUrl : "",
      video_url: "",
      access_level: anime.isPremium ? "premium" : "free",
      genre_id: anime.genreIds[0] ? Number(anime.genreIds[0]) : undefined,
      type: anime.type || "MOVIE",
      airing_status: anime.status === "ongoing" ? "ongoing" : "completed",
    });
    setThumbnailData(null);
    setOriginalEpisode(null);
    if (anime.type === "SERIES") {
      loadEpisodes(anime.id);
    } else {
      setEpisodes([]);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setThumbnailData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadThumbnail = async () => {
    if (!thumbnailData || !editing?.id) return;
    setIsUploading(true);
    try {
      const data = await apiFetch("/admin/thumbnail", {
        method: "POST",
        body: JSON.stringify({ image: thumbnailData, video_id: editing.id }),
      });
      setEditing({ ...editing, poster_url: data.url });
      setThumbnailData(null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Movie management</h2>
          <p className="mt-1 text-sm text-zinc-500">Create and edit backend movie records.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(emptyForm); setOriginalEpisode(null); }}>
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
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
            Type
            <select
              value={editing.type ?? "MOVIE"}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  type: e.target.value as "MOVIE" | "SERIES",
                })
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-[var(--sv-orange)] focus:outline-none"
            >
              <option value="MOVIE">Movie</option>
              <option value="SERIES">TV Series</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
            Status
            <select
              value={editing.airing_status ?? "completed"}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  airing_status: e.target.value as "ongoing" | "completed",
                })
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-[var(--sv-orange)] focus:outline-none"
            >
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </label>
          <Input
            label="Poster URL"
            value={editing.poster_url ?? ""}
            onChange={(e) => setEditing({ ...editing, poster_url: e.target.value })}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Upload Thumbnail</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleThumbnailSelect}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-zinc-700 file:px-3 file:py-1 file:text-sm file:text-white"
            />
            {thumbnailData && (
              <div className="flex items-center gap-3">
                <img src={thumbnailData} alt="Preview" className="h-20 w-36 rounded object-cover" />
                <button
                  type="button"
                  onClick={handleUploadThumbnail}
                  disabled={isUploading}
                  className="rounded bg-[var(--sv-orange)] px-3 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}
            {editing.poster_url && !thumbnailData && (
              <img
                src={editing.poster_url}
                alt="Current"
                className="h-20 w-36 rounded object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>
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
          {editing.type === "SERIES" && editing.id && (
            <div className="sm:col-span-2 mt-4 border-t border-zinc-700 pt-4">
              <h4 className="mb-3 font-semibold text-white">Episodes</h4>
              {episodes.length === 0 ? (
                <p className="mb-3 text-sm text-zinc-500">No episodes yet.</p>
              ) : (
                <ul className="mb-3 divide-y divide-zinc-800 rounded-lg border border-zinc-800 text-sm">
                  {episodes.map((ep) => (
                    <li key={ep.id} className="flex items-center justify-between px-3 py-2">
                      <span className="text-zinc-300">
                        Ep {ep.number}: {ep.title} — {ep.duration}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-[var(--sv-orange)] hover:underline"
                          onClick={async () => {
                            setError("");
                            try {
                              const data = await apiFetch(`/movies/${editing.id}/episodes/${ep.id}`);
                              const dur = data.duration_seconds
                                ? `${Math.round(data.duration_seconds / 60)} min`
                                : "Full movie";
                              const epData = {
                                id: String(data.episode_id),
                                number: data.episode_number,
                                title: data.title,
                                duration: dur,
                                videoUrl: data.video_url || "",
                              };
                              setOriginalEpisode(epData);
                              setEditingEpisode(epData);
                            } catch {
                              setError("Could not load episode data.");
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-400 hover:underline"
                          onClick={async () => {
                            if (!confirm("Delete this episode?")) return;
                            try {
                              await apiFetch(`/movies/${editing.id}/episodes/${ep.id}`, {
                                method: "DELETE",
                              });
                              loadEpisodes(editing.id!);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Could not delete episode.");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid gap-3 sm:grid-cols-4">
                <input
                  placeholder="Episode #"
                  type="number"
                  value={editingEpisode?.number ?? ""}
                  onChange={(e) =>
                    setEditingEpisode({ ...editingEpisode, number: Number(e.target.value) })
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-[var(--sv-orange)] focus:outline-none"
                />
                <input
                  placeholder="Title"
                  value={editingEpisode?.title ?? ""}
                  onChange={(e) =>
                    setEditingEpisode({ ...editingEpisode, title: e.target.value })
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-[var(--sv-orange)] focus:outline-none sm:col-span-2"
                />
                <input
                  placeholder="Duration (min)"
                  type="number"
                  value={
                    editingEpisode?.duration
                      ? parseInt(editingEpisode.duration)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingEpisode({
                      ...editingEpisode,
                      duration: e.target.value ? `${e.target.value} min` : "",
                    })
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-[var(--sv-orange)] focus:outline-none"
                />
                <input
                  placeholder="Video URL"
                  value={editingEpisode?.videoUrl ?? ""}
                  onChange={(e) =>
                    setEditingEpisode({ ...editingEpisode, videoUrl: e.target.value })
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-[var(--sv-orange)] focus:outline-none sm:col-span-2"
                />
                {(() => {
                  const hasChanges = !editingEpisode?.id || (
                    editingEpisode.number !== originalEpisode?.number ||
                    editingEpisode.title !== originalEpisode?.title ||
                    editingEpisode.duration !== originalEpisode?.duration ||
                    editingEpisode.videoUrl !== originalEpisode?.videoUrl
                  );
                  return (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!editingEpisode?.number || !editingEpisode?.title || !hasChanges}
                        onClick={async () => {
                          if (!editingEpisode?.number || !editingEpisode?.title || !hasChanges) return;
                          setError("");
                          try {
                            const dur = editingEpisode.duration
                              ? parseInt(editingEpisode.duration)
                              : undefined;
                            const isUpdate = !!editingEpisode.id;
                            const body = {
                              episode_number: editingEpisode.number,
                              title: editingEpisode.title,
                              video_url: editingEpisode.videoUrl || undefined,
                              duration: dur,
                            };
                            if (isUpdate) {
                              await apiFetch(
                                `/movies/${editing.id}/episodes/${editingEpisode.id}`,
                                { method: "PUT", body: JSON.stringify(body) }
                              );
                            } else {
                              await apiFetch(`/movies/${editing.id}/episodes`, {
                                method: "POST",
                                body: JSON.stringify(body),
                              });
                            }
                            setEditingEpisode(null);
                            setOriginalEpisode(null);
                            loadEpisodes(editing.id!);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Could not save episode.");
                          }
                        }}
                      >
                        {editingEpisode?.id ? "Update" : "Add episode"}
                      </Button>
                      {editingEpisode?.id && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => { setEditingEpisode(null); setOriginalEpisode(null); }}>
                          Cancel
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setEditing(null); setOriginalEpisode(null); }}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
