export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiToken = req.headers.authorization?.replace("Bearer ", "");
  if (!apiToken) {
    return res.status(400).json({ error: "Missing Hostinger API token" });
  }

  const { domain, type, name, value, ttl } = req.body;

  if (!domain || !type || !name || !value) {
    return res.status(400).json({ error: "Missing required DNS fields" });
  }

  const endpoint = `https://api.hostinger.com/v2/domains/${domain}/records`;

  try {
    const hostingerRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        name,
        value,
        ttl: ttl || 3600,
      }),
    });

    const result = await hostingerRes.json();
    return res.status(hostingerRes.status).json(result);

  } catch (err) {
    console.error("Proxy Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
