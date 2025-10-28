import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// Allow your backend to call this proxy
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/hostinger/:domain', async (req, res) => {
  const { domain } = req.params;
  const { records, apiToken } = req.body;

  try {
    const response = await fetch(`https://api.hostinger.com/v2/domains/${domain}/records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(records)
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8080, () => console.log('✅ Proxy running on port 8080'));
