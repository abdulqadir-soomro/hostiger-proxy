import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.json({ status: "✅ Hostinger Proxy Running" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiToken = req.headers.authorization?.replace("Bearer ", "");
  if (!apiToken) return res.status(400).json({ error: "Missing Hostinger API token" });

  const { domain, type, name, value, ttl } = req.body;
  if (!domain || !type || !name || !value) {
    return res.status(400).json({ error: "Missing DNS fields" });
  }

  const endpoint = `https://api.hostinger.com/v2/domains/${domain}/records`;

  try {
    const hostingerRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, name, value, ttl: ttl || 3600 }),
    });

    // ✅ Read raw text FIRST
    const rawText = await hostingerRes.text();

    // ✅ Try to parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("❌ Hostinger returned HTML or non-JSON:");
      console.error(rawText);
      return res.status(500).json({
        error: "Hostinger returned non-JSON (HTML likely → Cloudflare Error 1016)",
        htmlSnippet: rawText.slice(0, 200) + "..."
      });
    }

    return res.status(hostingerRes.status).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
}
