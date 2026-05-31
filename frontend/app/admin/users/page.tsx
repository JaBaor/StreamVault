"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  fetchAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser,
} from "@/lib/catalog";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    const rows = await fetchAdminUsers();
    setUsers(rows);
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadUsers().catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load users.");
      });
    });
  }, []);

  const updateUser = async (
    user: AdminUser,
    patch: Partial<Pick<AdminUser, "role" | "status">>
  ) => {
    setError("");
    try {
      if (patch.role) await updateAdminUserRole(String(user.user_id), patch.role);
      if (patch.status) await updateAdminUserStatus(String(user.user_id), patch.status);
      setUsers((current) =>
        current.map((row) =>
          row.user_id === user.user_id ? { ...row, ...patch } : row
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update user.");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">User management</h2>
      <p className="mt-1 text-sm text-zinc-500">Backend users, roles, and account status.</p>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={`${u.user_id}:${i}`} className="border-t border-zinc-800">
                <td className="px-4 py-3 text-white">{u.username}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "admin" ? "admin" : "default"}>
                      {u.role}
                    </Badge>
                    <select
                      value={u.role}
                      onChange={(e) =>
                        updateUser(u, { role: e.target.value as AdminUser["role"] })
                      }
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white"
                    >
                      <option value="member">member</option>
                      <option value="subscriber">subscriber</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.status}
                    onChange={(e) =>
                      updateUser(u, { status: e.target.value as AdminUser["status"] })
                    }
                    className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white"
                  >
                    <option value="active">active</option>
                    <option value="deactivated">deactivated</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
