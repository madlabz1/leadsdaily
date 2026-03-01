import Exa from "exa-js";

function getExa() {
  return new Exa(process.env.EXA_API_KEY);
}

export interface ExaResult {
  company_name: string;
  company_url: string;
  description: string;
  signals: Record<string, string>;
}

export async function searchLeads(queries: string[]): Promise<ExaResult[]> {
  const allResults: ExaResult[] = [];

  for (const query of queries) {
    try {
      const result = await getExa().searchAndContents(query, {
        type: "auto",
        numResults: 20,
        text: { maxCharacters: 500 },
        livecrawl: "always",
      });

      for (const item of result.results) {
        const url = new URL(item.url);
        const domain = url.hostname.replace("www.", "");

        allResults.push({
          company_name: item.title || domain,
          company_url: item.url,
          description: item.text?.slice(0, 300) || "",
          signals: {
            source_query: query,
            ...(item.publishedDate ? { published: item.publishedDate } : {}),
          },
        });
      }
    } catch (error) {
      console.error(`Exa search failed for query "${query}":`, error);
    }
  }

  return allResults;
}

export function deduplicateResults(results: ExaResult[]): ExaResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    try {
      const domain = new URL(r.company_url).hostname.replace("www.", "");
      if (seen.has(domain)) return false;
      seen.add(domain);
      return true;
    } catch {
      return false;
    }
  });
}
