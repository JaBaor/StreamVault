"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

type GateReason = "login" | "premium" | "subscriber";

export function AccessGate({
  reason,
  animeTitle,
}: {
  reason: GateReason;
  animeTitle?: string;
}) {
  const { user } = useAuth();

  const messages: Record<GateReason, { title: string; body: string }> = {
    login: {
      title: "Sign in to watch",
      body: `Create a free account or log in to start watching${animeTitle ? ` ${animeTitle}` : ""}.`,
    },
    subscriber: {
      title: "Members only",
      body: "This episode requires a StreamVault account. Sign up free or log in.",
    },
    premium: {
      title: "Premium episode",
      body: "Upgrade to Premium to unlock this episode and ad-free streaming.",
    },
  };

  const { title, body } = messages[reason];

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 p-8 text-center sm:min-h-[360px]">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-3xl">
        {reason === "premium" ? "★" : "🔒"}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-400">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!user && (
          <>
            <Link href="/register">
              <Button>Sign up free</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
          </>
        )}
        {user && reason === "premium" && (
          <Link href="/dashboard/subscription">
            <Button>Upgrade to Premium</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
