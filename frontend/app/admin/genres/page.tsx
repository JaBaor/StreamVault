"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import type { Genre } from "@/lib/types";

type ApiGenre = { id: number; slug: string; name: string; description?: string };

function mapGenre(g: ApiGenre): Genre {
  return { id: String(g.id), slug: g.slug, name: g.name, description: g.description ?? "" };
}

export default function AdminGenresPage() {
  const [list, setList] = useState<Genre[]>([]);
  const [form, setForm] = useState<Partial<Genre> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    return apiFetch("/genres")
      .then((data) => setList((data as ApiGenre[]).map(mapGenre)))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.name) return;
    const payload: Record<string, string> = { name: form.name };
    if (form.description) payload.description = form.description;

    if (form.id) {
      await apiFetch(`/genres/${form.id}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/genres", { method: "POST", body: JSON.stringify(payload) });
    }
    await load();
    setForm(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete genre?")) return;
    await apiFetch(`/genres/${id}`, { method: "DELETE" });
    await load();
  };

  if (loading) {
    return <div className="mt-4 text-zinc-400">Loading genres…</div>;
  }

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold text-white">Genre / category CRUD</h2>
        <Button size="sm" onClick={() => setForm({ name: "", description: "" })}>
          + Add genre
        </Button>
      </div>
      <ul className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
        {list.map((g) => (
          <li key={g.id} className="flex items-center justify-between px-4 py-3">
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
