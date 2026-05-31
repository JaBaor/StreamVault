"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
} from "recharts";
import {
  fetchAdminStats,
  fetchSignupStats,
  fetchTopMovies,
  fetchSubscriptionPlanStats,
  type AdminStats,
} from "@/lib/catalog";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"];

type DateRange = { from: string; to: string };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [signups, setSignups] = useState<{ date: string; signups: number }[]>([]);
  const [topMovies, setTopMovies] = useState<{ title: string; view_count: number }[]>([]);
  const [planStats, setPlanStats] = useState<{ plan: string; count: number }[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  });
  const [period, setPeriod] = useState("week");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [s, sg, tm, ps] = await Promise.all([
        fetchAdminStats(),
        period === "custom"
          ? fetchSignupStats("custom", dateRange.from, dateRange.to)
          : fetchSignupStats(period),
        fetchTopMovies(10),
        fetchSubscriptionPlanStats(),
      ]);
      setStats(s);
      setSignups(sg);
      setTopMovies(tm);
      setPlanStats(ps);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard data.");
    }
  }, [period, dateRange]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const values = stats ?? { totalUsers: 0, totalMovies: 0, totalGenres: 0, viewsToday: 0 };

  const exportCSV = () => {
    const rows = [["Date", "Signups"], ...signups.map((s) => [s.date, String(s.signups)])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signups-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={values.totalUsers} />
        <StatCard label="Movies" value={values.totalMovies} />
        <StatCard label="Genres" value={values.totalGenres} />
        <StatCard label="Views today" value={values.viewsToday} />
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <label className="flex flex-col gap-1 text-sm text-zinc-400">
          Period
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
        </label>
        {period === "custom" && (
          <>
            <label className="flex flex-col gap-1 text-sm text-zinc-400">
              From
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-400">
              To
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-white"
              />
            </label>
          </>
        )}
        <button
          onClick={exportCSV}
          className="rounded-lg bg-zinc-800 px-4 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Signups per Day">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={signups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Line type="monotone" dataKey="signups" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 10 Videos by Views">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMovies} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
              <YAxis type="category" dataKey="title" stroke="#a1a1aa" fontSize={11} width={90} tickFormatter={(v) => v.length > 20 ? `${v.slice(0, 20)}...` : v} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Bar dataKey="view_count" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mx-auto max-w-md">
        <ChartCard title="Subscription Plans">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planStats}
                dataKey="count"
                nameKey="plan"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                label={({ payload }) => `${payload.plan} (${payload.count})`}
              >
                {planStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">{title}</h3>
      {children}
    </div>
  );
}
