"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  getCatalogGenres,
  saveCatalogGenres,
} from "@/lib/catalog";
import type { Genre } from "@/lib/types";

export default function AdminGenresPage() {
  const [list, setList] = useState<Genre[]>(() => getCatalogGenres());
  const [form, setForm] = useState<Partial<Genre> | null>(null);

  const persist = (next: Genre[]) => {
    setList(next);
    saveCatalogGenres(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.name || !form.slug) return;
    const genre: Genre = {
      id: form.id ?? `g-${Date.now()}`,
      slug: form.slug,
      name: form.name,
      description: form.description ?? "",
    };
    const exists = list.some((g) => g.id === genre.id);
    persist(exists ? list.map((g) => (g.id === genre.id ? genre : g)) : [...list, genre]);
    setForm(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete genre?")) return;
    persist(list.filter((g) => g.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold text-white">Genre / category CRUD</h2>
        <Button
          size="sm"
          onClick={() => setForm({ slug: "", name: "", description: "" })}
        >
          + Add genre
        </Button>
      </div>
      <ul className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
        {list.map((g) => (
          <li
            key={g.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">{g.name}</p>
              <p className="text-xs text-zinc-500">/{g.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-sm text-[var(--sv-orange)]"
                onClick={() => setForm(g)}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-sm text-red-400"
                onClick={() => handleDelete(g.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {form && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 max-w-md space-y-3 rounded-xl border border-zinc-700 bg-zinc-900 p-6"
        >
          <Input
            label="Name"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Slug"
            value={form.slug ?? ""}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
