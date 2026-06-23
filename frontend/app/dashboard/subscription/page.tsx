"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  cancelSubscription,
  fetchMySubscription,
  subscribeToPlan,
  type SubscriptionStatus,
} from "@/lib/catalog";
import { useAuth } from "@/contexts/AuthContext";

export default function SubscriptionPage() {
  const { updateProfile } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const applyStatus = useCallback((next: SubscriptionStatus) => {
    setStatus(next);
    updateProfile({
      role: next.isPremium ? "subscriber" : "member",
      subscriptionPlan: next.isPremium ? "premium" : "free",
      subscriptionExpires: next.expiresAt ?? undefined,
    });
  }, [updateProfile]);

  const loadStatus = useCallback(async () => {
    applyStatus(await fetchMySubscription());
  }, [applyStatus]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadStatus().catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load subscription.");
      });
    });
  }, [loadStatus]);

  const changePlan = async (plan: SubscriptionStatus["plan"]) => {
    setIsSaving(true);
    setError("");
    try {
      const result = await subscribeToPlan(plan);
      applyStatus(result.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update subscription.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = async () => {
    setIsSaving(true);
    setError("");
    try {
      const result = await cancelSubscription();
      applyStatus(result.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel subscription.");
    } finally {
      setIsSaving(false);
    }
  };

  const isPremium = Boolean(status?.isPremium);

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold text-white">Subscription status</h2>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">Current plan</span>
          <Badge variant={isPremium ? "premium" : "default"}>
            {status?.plan ?? "free"}
          </Badge>
        </div>
        {status?.expiresAt && (
          <p className="mt-2 text-sm text-zinc-500">
            Expires: {new Date(status.expiresAt).toLocaleDateString()}
            {status.daysRemaining !== null ? ` (${status.daysRemaining} days left)` : ""}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant={status?.plan === "premium_monthly" ? "primary" : "secondary"}
            onClick={() => changePlan("premium_monthly")}
            disabled={isSaving || status?.plan === "premium_monthly"}
          >
            Premium monthly
          </Button>
          <Button
            variant={status?.plan === "premium_yearly" ? "primary" : "secondary"}
            onClick={() => changePlan("premium_yearly")}
            disabled={isSaving || status?.plan === "premium_yearly"}
          >
            Premium yearly
          </Button>
          {isPremium && (
            <Button variant="outline" onClick={cancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
