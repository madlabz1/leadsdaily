import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function generateQueries(icpDescription: string): Promise<string[]> {
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a B2B lead generation expert. Given the following Ideal Customer Profile (ICP) description, generate 5-8 semantic search queries that would find companies matching this profile on the web.

Focus on:
- Companies that match the description
- Recent funding or hiring signals
- Industry-specific keywords
- Tech stack mentions
- Competitor switching signals

ICP Description: "${icpDescription}"

Return ONLY a JSON array of search query strings. No explanation. Example:
["Series A SaaS companies hiring SDRs in the US", "startup raised seed funding 2025 B2B"]`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];

  return JSON.parse(match[0]);
}

export async function scoreLeads(
  leads: Array<{ company_name: string; company_url: string; description: string; signals: Record<string, string> }>,
  icpDescription: string
): Promise<Array<{ company_name: string; company_url: string; description: string; signals: Record<string, string>; relevance_score: number }>> {
  if (leads.length === 0) return [];

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a B2B lead scoring expert. Score each lead 0-100 based on how well it matches the ICP.

ICP: "${icpDescription}"

Leads:
${JSON.stringify(leads, null, 2)}

Return a JSON array with the same leads, each with an added "relevance_score" field (0-100). Higher = better match. Only return the JSON array, no explanation.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return leads.map((l) => ({ ...l, relevance_score: 50 }));

  return JSON.parse(match[0]);
}
