"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [icpDescription, setIcpDescription] = useState("");
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      // Save business name
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName }),
      });

      // Create ICP profile (AI generates queries)
      const icpRes = await fetch("/api/icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: icpDescription }),
      });

      if (!icpRes.ok) {
        throw new Error("Failed to create ICP profile");
      }

      // Add delivery email
      if (deliveryEmail) {
        await fetch("/api/delivery-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: deliveryEmail }),
        });
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Set up your lead finder</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Tell us about your business and we&apos;ll find leads for you daily.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              s <= step ? "bg-orange-500" : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Business name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Acme Corp"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!businessName}
            className="w-full rounded-lg bg-orange-500 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Describe your ideal customer
            </label>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Be as specific as you can. Include industry, company size, location, tech stack, recent activity, etc.
            </p>
            <textarea
              value={icpDescription}
              onChange={(e) => setIcpDescription(e.target.value)}
              rows={6}
              placeholder="B2B SaaS companies with 10-50 employees in the US that recently raised funding and are hiring sales roles. They use Stripe or HubSpot and sell to small businesses."
              className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!icpDescription}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Where should we send your leads?
            </label>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              You&apos;ll get a daily email with your top 10 leads each morning.
            </p>
            <input
              type="email"
              value={deliveryEmail}
              onChange={(e) => setDeliveryEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !deliveryEmail}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Start finding leads"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
