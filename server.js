import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/add-record", async (req, res) => {
  const apiToken = req.headers.authorization?.replace("Bearer ", "");
  if (!apiToken) return res.status(400).json({ error: "Missing Hostinger API token" });

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
});

app.listen(3000, () => console.log("✅ Hostinger Proxy Running"));
export default app;
