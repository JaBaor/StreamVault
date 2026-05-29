"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await register(email, password, displayName);
    setLoading(false);
    if (result.ok) router.push("/dashboard");
    else setError(result.error ?? "Registration failed");
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Create account</h1>
      <p className="mt-2 text-sm text-zinc-400">Free account — watch and save your list.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Display name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Creating…" : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--sv-orange)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
