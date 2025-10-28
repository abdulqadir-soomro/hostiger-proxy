import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test Route
app.get("/", (req, res) => {
  res.json({ status: "✅ Hostinger Proxy Running" });
});

// ✅ DNS Route
app.post("/api/hostinger/dns", async (req, res) => {
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

    const result = await hostingerRes.json();
    res.status(hostingerRes.status).json(result);

  } catch (err) {
    res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
});

// ✅ Export app (Vercel will handle server + port)
export default app;
