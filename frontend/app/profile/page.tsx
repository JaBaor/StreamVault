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
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await updateProfile({ displayName: name });
    if (!result.ok) {
      setError(result.error ?? "Save failed");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return;
    setUploading(true);
    setError("");
    const result = await updateProfile({ avatarUrl: avatarPreview });
    if (!result.ok) {
      setError(result.error ?? "Upload failed");
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setUploading(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <div className="flex items-center gap-4">
        {user.avatarUrl && !avatarPreview ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : avatarPreview ? (
          <img
            src={avatarPreview}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sv-orange)] text-2xl font-bold text-white">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        )}
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
      <div className="mt-4 flex items-center gap-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarSelect}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-zinc-700 file:px-3 file:py-1 file:text-sm file:text-white"
        />
        {avatarPreview && (
          <Button type="button" size="sm" onClick={handleAvatarUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        )}
      </div>
      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <Input
          label="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input label="Email" value={user.email} disabled />
        {error && <p className="text-sm text-red-400">{error}</p>}
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
