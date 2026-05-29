"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      const redirect = params.get("redirect") ?? (params.get("admin") ? "/admin" : "/");
      router.push(redirect);
    } else {
      setError(result.error ?? "Login failed");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-zinc-400">Log in to continue watching.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@streamvault.dev"
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        No account?{" "}
        <Link href="/register" className="text-[var(--sv-orange)] hover:underline">
          Sign up
        </Link>
      </p>
      <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-500">
        <p className="font-semibold text-zinc-400">Demo accounts</p>
        <p className="mt-1">Subscriber: user@streamvault.dev / user123</p>
        <p>Admin: admin@streamvault.dev / admin123</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
