"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface DeliveryEmail {
  id: string;
  email_address: string;
  verified: boolean;
}

interface IcpProfile {
  id: string;
  description: string;
  generated_queries: string[];
}

const PLAN_DETAILS = {
  free: { name: "Free", price: 0, leadsPerDay: 3 },
  pro: { name: "Pro", price: 49, leadsPerDay: 10 },
  business: { name: "Business", price: 99, leadsPerDay: 25 },
} as const;

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const { data: session } = useSession();

  const [emails, setEmails] = useState<DeliveryEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);

  const [icp, setIcp] = useState<IcpProfile | null>(null);
  const [icpDescription, setIcpDescription] = useState("");
  const [updatingIcp, setUpdatingIcp] = useState(false);

  const [upgrading, setUpgrading] = useState<string | null>(null);

  const currentTier = ((session?.user as Record<string, unknown>)?.planTier as string) || "free";
  const currentPlan = PLAN_DETAILS[currentTier as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.free;

  useEffect(() => {
    fetch("/api/delivery-email").then((r) => r.json()).then((d) => setEmails(d.emails || []));
    fetch("/api/icp").then((r) => r.json()).then((d) => {
      if (d.profile) {
        setIcp(d.profile);
        setIcpDescription(d.profile.description);
      }
    });
  }, []);

  async function addEmail() {
    setAddingEmail(true);
    const res = await fetch("/api/delivery-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
    });
    if (res.ok) {
      const data = await res.json();
      setEmails([...emails, data.email]);
      setNewEmail("");
    }
    setAddingEmail(false);
  }

  async function removeEmail(id: string) {
    await fetch("/api/delivery-email", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setEmails(emails.filter((e) => e.id !== id));
  }

  async function updateIcp() {
    setUpdatingIcp(true);
    const res = await fetch("/api/icp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: icpDescription }),
    });
    if (res.ok) {
      const data = await res.json();
      setIcp(data.profile);
    }
    setUpdatingIcp(false);
  }

  async function handleUpgrade(plan: string) {
    setUpgrading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    }
    setUpgrading(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">Manage your lead generation preferences</p>
      </div>

      {verified === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          Email verified successfully! You&apos;ll now receive daily leads.
        </div>
      )}

      {/* Current Plan */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Your plan</h2>
        <div className="mt-3 flex items-center gap-3">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            {currentPlan.name}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {currentPlan.leadsPerDay} leads/day
            {currentPlan.price > 0 && ` — $${currentPlan.price}/mo`}
          </span>
        </div>

        {currentTier === "free" && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleUpgrade("pro")}
              disabled={upgrading !== null}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {upgrading === "pro" ? "Redirecting..." : "Upgrade to Pro — $49/mo"}
            </button>
            <button
              onClick={() => handleUpgrade("business")}
              disabled={upgrading !== null}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              {upgrading === "business" ? "Redirecting..." : "Upgrade to Business — $99/mo"}
            </button>
          </div>
        )}
        {currentTier === "pro" && (
          <div className="mt-4">
            <button
              onClick={() => handleUpgrade("business")}
              disabled={upgrading !== null}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {upgrading === "business" ? "Redirecting..." : "Upgrade to Business — $99/mo"}
            </button>
          </div>
        )}
      </div>

      {/* ICP Settings */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Ideal Customer Profile</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Describe your ideal customer. The AI will generate search queries from this.
        </p>
        <textarea
          value={icpDescription}
          onChange={(e) => setIcpDescription(e.target.value)}
          rows={4}
          className="mt-3 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
        {icp && (
          <div className="mt-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Generated queries:</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {icp.generated_queries.map((q, i) => (
                <span key={i} className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {q}
                </span>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={updateIcp}
          disabled={updatingIcp || icpDescription === icp?.description}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {updatingIcp ? "Updating..." : "Update ICP"}
        </button>
      </div>

      {/* Delivery Email Settings */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Delivery email</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Where should we send your daily leads? Add an email and verify it.
        </p>

        {emails.length > 0 && (
          <div className="mt-4 space-y-2">
            {emails.map((email) => (
              <div key={email.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">{email.email_address}</span>
                  {email.verified ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pending
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeEmail(email.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <button
            onClick={addEmail}
            disabled={addingEmail || !newEmail}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
          >
            {addingEmail ? "Adding..." : "Add email"}
          </button>
        </div>
      </div>
    </div>
  );
}
