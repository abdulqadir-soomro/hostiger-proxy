import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors());

// Proxy route
app.post("/hostinger/domains/:domain/records", async (req, res) => {
  try {
    const { domain } = req.params;
    const apiToken = req.headers.authorization; // must include Bearer token
    const record = req.body;

    if (!apiToken) {
      return res.status(400).json({ error: "Missing Hostinger API Token" });
    }

    const response = await fetch(`https://api.hostinger.com/v2/domains/${domain}/records`, {
      method: "POST",
      headers: {
        "Authorization": apiToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(record),
    });

    const data = await response.text();

    try {
      return res.status(response.status).json(JSON.parse(data));
    } catch {
      return res.status(response.status).send(data);
    }

  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: "Proxy failed" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Hostinger Proxy Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port:", PORT));
