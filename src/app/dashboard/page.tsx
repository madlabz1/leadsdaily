"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [hasIcp, setHasIcp] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ totalLeads: 0, goodLeads: 0, lastRun: "" });

  useEffect(() => {
    async function checkSetup() {
      const res = await fetch("/api/icp");
      const data = await res.json();
      if (!data.profile) {
        router.push("/dashboard/onboarding");
        return;
      }
      setHasIcp(true);

      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    }
    if (session) checkSetup();
  }, [session, router]);

  if (hasIcp === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
      <p className="mt-1 text-zinc-500 dark:text-zinc-400">
        Your lead generation overview
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total leads found</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalLeads}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Marked as good</p>
          <p className="mt-2 text-3xl font-bold text-orange-500">{stats.goodLeads}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Last search run</p>
          <p className="mt-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {stats.lastRun || "Not yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
