"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getCatalogAnime, saveCatalogAnime } from "@/lib/catalog";
import type { Anime } from "@/lib/types";

export default function AdminVideosPage() {
  const [list, setList] = useState<Anime[]>(() => getCatalogAnime());
  const [editing, setEditing] = useState<Anime | null>(null);

  const persist = (next: Anime[]) => {
    setList(next);
    saveCatalogAnime(next);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this title?")) return;
    persist(list.filter((a) => a.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const exists = list.some((a) => a.id === editing.id);
    persist(
      exists
        ? list.map((a) => (a.id === editing.id ? editing : a))
        : [...list, editing]
    );
    setEditing(null);
  };

  const startNew = () => {
    setEditing({
      id: `a-${Date.now()}`,
      slug: `show-${Date.now()}`,
      title: "New Show",
      description: "Description",
      posterUrl: "https://picsum.photos/seed/new/400/600",
      bannerUrl: "https://picsum.photos/seed/new-b/1280/720",
      rating: 4,
      year: 2025,
      status: "ongoing",
      genreIds: [],
      episodeCount: 1,
      isPremium: false,
    });
  };

  return (
    <div>
      <div className="flex justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Video management</h2>
        <Button size="sm" onClick={startNew}>
          + Add title
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 text-white">{a.title}</td>
                <td className="px-4 py-3">{a.year}</td>
                <td className="px-4 py-3 capitalize">{a.status}</td>
                <td className="px-4 py-3">{a.isPremium ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="mr-3 text-[var(--sv-orange)]"
                    onClick={() => setEditing(a)}
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
          className="mt-6 max-w-lg space-y-3 rounded-xl border border-zinc-700 bg-zinc-900 p-6"
        >
          <h3 className="font-semibold text-white">Edit title</h3>
          <Input
            label="Title"
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          />
          <Input
            label="Slug"
            value={editing.slug}
            onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
          />
          <Input
            label="Description"
            value={editing.description}
            onChange={(e) =>
              setEditing({ ...editing, description: e.target.value })
            }
          />
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={editing.isPremium}
              onChange={(e) =>
                setEditing({ ...editing, isPremium: e.target.checked })
              }
            />
            Premium only
          </label>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
