"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";

export default function SubscriptionPage() {
  const { user, updateProfile } = useAuth();
  const isPremium = user?.subscriptionPlan === "premium";

  const upgrade = () => {
    updateProfile({
      subscriptionPlan: "premium",
      subscriptionExpires: "2026-12-31",
    });
  };

  const downgrade = () => {
    updateProfile({ subscriptionPlan: "free", subscriptionExpires: undefined });
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-white">Subscription status</h2>
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Current plan</span>
          <Badge variant={isPremium ? "premium" : "default"}>
            {isPremium ? "Premium" : "Free"}
          </Badge>
        </div>
        {user?.subscriptionExpires && isPremium && (
          <p className="mt-2 text-sm text-zinc-500">
            Renews / expires: {user.subscriptionExpires}
          </p>
        )}
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li>✓ Free: browse catalog, limited episodes</li>
          <li>✓ Premium: all episodes, ad-free (demo)</li>
        </ul>
        <div className="mt-6 flex gap-3">
          {!isPremium ? (
            <Button onClick={upgrade}>Upgrade to Premium (demo)</Button>
          ) : (
            <Button variant="outline" onClick={downgrade}>
              Switch to Free (demo)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
