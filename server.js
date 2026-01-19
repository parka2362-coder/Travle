const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'picks.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, '{}', 'utf8');
  }
}

function readCounts() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCounts(counts) {
  ensureDataFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(counts, null, 2), 'utf8');
}

function makeKey(city, country) {
  return `${city}|${country}`;
}

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/picks', (req, res) => {
  const counts = readCounts();
  res.json(counts);
});

app.post('/api/picks', (req, res) => {
  const { city, country } = req.body || {};
  if (!city || !country) {
    return res.status(400).json({ error: 'city and country are required' });
  }

  const counts = readCounts();
  const key = makeKey(city, country);
  counts[key] = (counts[key] || 0) + 1;
  writeCounts(counts);
  return res.json(counts);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
