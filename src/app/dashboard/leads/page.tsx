"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  company_name: string;
  company_url: string;
  description: string;
  signals: Record<string, string>;
  relevance_score: number;
  feedback: "good" | "bad" | null;
  delivered_at: string;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function fetchLeads(p: number) {
    setLoading(true);
    const res = await fetch(`/api/leads?page=${p}`);
    const data = await res.json();
    setLeads(data.leads);
    setTotalPages(data.totalPages);
    setLoading(false);
  }

  useEffect(() => {
    fetchLeads(page);
  }, [page]);

  async function handleFeedback(id: string, feedback: "good" | "bad") {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, feedback }),
    });

    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, feedback } : l))
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Leads</h1>
      <p className="mt-1 text-zinc-500 dark:text-zinc-400">
        Your discovered leads. Mark them as good or bad to improve future results.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      ) : leads.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No leads yet. They&apos;ll appear here after your first daily search run.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <a
                        href={lead.company_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                      >
                        {lead.company_name}
                      </a>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Score: {lead.relevance_score}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{lead.description}</p>
                    {lead.signals && Object.keys(lead.signals).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {Object.entries(lead.signals)
                          .filter(([k]) => k !== "source_query")
                          .map(([key, value]) => (
                            <span
                              key={key}
                              className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {key}: {value}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleFeedback(lead.id, "good")}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        lead.feedback === "good"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      Good
                    </button>
                    <button
                      onClick={() => handleFeedback(lead.id, "bad")}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        lead.feedback === "bad"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      Bad
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
