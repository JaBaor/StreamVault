"use client";

import { DEMO_ACCOUNTS } from "@/lib/mock-data";
import { getItem } from "@/lib/storage";
import type { User } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export default function AdminUsersPage() {
  const registered = getItem<User[]>("registered-users", []);
  const users = [
    ...DEMO_ACCOUNTS.map((a) => a.user),
    ...registered,
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">User management</h2>
      <p className="mt-1 text-sm text-zinc-500">Demo + registered users (read-only list).</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="px-4 py-3 text-white">{u.displayName}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "admin" ? "admin" : "default"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 capitalize">
                  {u.subscriptionPlan ?? "free"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
