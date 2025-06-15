const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const POLL_FILE = path.join(DATA_DIR, 'poll.json');
const USER_FILE = path.join(DATA_DIR, 'user.json');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.get('/api/poll', (req, res) => {
  const poll = readJson(POLL_FILE);
  if (!poll) return res.json({ error: 'Poll data missing' });

  // Example: Add pollEndTimestamp, e.g. 24h from poll start or fixed time
  // For demo, assume poll has pollEndTimestamp in ISO string already:
  if (!poll.pollEndTimestamp) {
    // For example, set poll end to tomorrow noon UTC if missing
    const now = new Date();
    const tomorrowNoon = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 12, 0, 0));
    poll.pollEndTimestamp = tomorrowNoon.toISOString();
  }

  // Send question, options, and pollEndTimestamp to client
  res.json({
    question: poll.question,
    options: poll.options,
    pollEndTimestamp: poll.pollEndTimestamp,
  });
});

app.post('/api/vote', (req, res) => {
  const { username, vote } = req.body;
  if (!username || !vote) return res.status(400).json({ error: 'Missing username or vote' });

  const poll = readJson(POLL_FILE);
  if (!poll) return res.status(500).json({ error: 'Poll data missing' });

  let users = readJson(USER_FILE) || {};

  // Initialize user if not exists
  if (!users[username]) {
    users[username] = { gems: 0, votes: {} };
  }

  // Check if user already voted today (assuming poll date is unique)
  const pollDate = poll.pollDate || new Date().toISOString().slice(0, 10);
  if (users[username].votes[pollDate]) {
    return res.json({ error: 'You have already voted today' });
  }

  // Record vote
  users[username].votes[pollDate] = vote;

  // Count votes from all users
  let results = {};
  for (const u in users) {
    const userVote = users[u].votes[pollDate];
    if (userVote) {
      results[userVote] = (results[userVote] || 0) + 1;
    }
  }

  // Check correctness
  const correct = (vote === poll.correctAnswer);

  // Award gems if correct and only once per poll
  if (correct) {
    users[username].gems += 10;
  }

  // Save users back
  writeJson(USER_FILE, users);

  res.json({
    correct,
    results,
  });
});

// Leaderboard endpoint
app.get('/api/leaderboard', (req, res) => {
  const users = readJson(USER_FILE) || {};
  // Sort by gems desc
  const sorted = Object.entries(users)
    .map(([username, data]) => ({ username, gems: data.gems || 0 }))
    .sort((a, b) => b.gems - a.gems);
  res.json(sorted.reduce((obj, item) => {
    obj[item.username] = { gems: item.gems };
    return obj;
  }, {}));
});

// Reset leaderboard (clear users.json)
app.post('/api/reset-leaderboard', (req, res) => {
  writeJson(USER_FILE, {});
  res.json({ status: 'Leaderboard reset' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
