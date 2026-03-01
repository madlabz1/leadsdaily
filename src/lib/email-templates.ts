import type { Lead } from "@/types/database";

export function buildLeadDigestHtml(leads: Lead[], businessName: string): string {
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const leadsHtml = leads
    .map(
      (lead, i) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #eee;">
        <div style="font-size: 14px; color: #999; margin-bottom: 4px;">#${i + 1} &middot; Score: ${lead.relevance_score}/100</div>
        <div style="font-size: 18px; font-weight: 600; color: #111; margin-bottom: 4px;">
          <a href="${lead.company_url}" style="color: #111; text-decoration: none;">${lead.company_name}</a>
        </div>
        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">${lead.description || ""}</div>
        ${
          lead.signals && Object.keys(lead.signals).length > 0
            ? `<div style="font-size: 13px; color: #888;">${Object.entries(lead.signals)
                .filter(([k]) => k !== "source_query")
                .map(([k, v]) => `<span style="background: #f5f5f5; padding: 2px 8px; border-radius: 4px; margin-right: 4px;">${k}: ${v}</span>`)
                .join(" ")}</div>`
            : ""
        }
        <div style="margin-top: 8px;">
          <a href="${lead.company_url}" style="color: #2563eb; text-decoration: none; font-size: 14px;">Visit website &rarr;</a>
        </div>
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #fafafa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
    <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
      <h1 style="font-size: 22px; color: #111; margin: 0 0 4px;">Your daily leads</h1>
      <p style="color: #666; font-size: 14px; margin: 0 0 24px;">${date} &middot; ${leads.length} leads for ${businessName}</p>

      <table style="width: 100%; border-collapse: collapse;">
        ${leadsHtml}
      </table>

      <div style="margin-top: 24px; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/leads" style="display: inline-block; background: #111; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
          View all in dashboard
        </a>
      </div>
    </div>

    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 16px;">
      Sent by LeadsDaily &middot; <a href="${process.env.NEXTAUTH_URL}/dashboard/settings" style="color: #999;">Manage settings</a>
    </p>
  </div>
</body>
</html>`;
}
