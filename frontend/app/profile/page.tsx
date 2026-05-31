"use client";

import { SubscriberGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

function ProfileContent() {
  const { user, updateProfile, logout, role } = useAuth();
  const [name, setName] = useState(user?.displayName ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sv-orange)] text-2xl font-bold text-white">
          {user.displayName.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-zinc-400">{user.email}</p>
          <div className="mt-1 flex gap-2">
            <Badge variant={role === "admin" ? "admin" : "default"}>{role}</Badge>
            {user.subscriptionPlan === "premium" && (
              <Badge variant="premium">Premium</Badge>
            )}
          </div>
        </div>
      </div>
      <form onSubmit={handleSave} className="mt-8 space-y-4">
        <Input
          label="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input label="Email" value={user.email} disabled />
        {saved && <p className="text-sm text-green-400">Profile saved.</p>}
        <Button type="submit">Save changes</Button>
      </form>
      <Button variant="outline" className="mt-6" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <SubscriberGuard>
      <ProfileContent />
    </SubscriberGuard>
  );
}
