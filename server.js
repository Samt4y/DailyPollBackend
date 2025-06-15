const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const POLL_FILE = path.join(__dirname, 'poll.json');
const USERS_FILE = path.join(__dirname, 'users.json');

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
  const pollData = readJson(POLL_FILE);
  if (!pollData) {
    return res.status(500).json({ error: 'Poll data missing' });
  }
  // Ensure votes exists
  if (!pollData.votes) pollData.votes = {};
  res.json(pollData);
});

app.post('/api/vote', (req, res) => {
  const { username, choice } = req.body;
  if (!username || !choice) {
    return res.status(400).json({ error: 'Missing username or choice' });
  }

  const pollData = readJson(POLL_FILE);
  if (!pollData) return res.status(500).json({ error: 'Poll data missing' });
  if (!pollData.options.includes(choice)) {
    return res.status(400).json({ error: 'Invalid choice' });
  }

  pollData.votes = pollData.votes || {};
  pollData.votes[choice] = (pollData.votes[choice] || 0) + 1;
  writeJson(POLL_FILE, pollData);

  let users = readJson(USERS_FILE) || {};
  if (!users[username]) users[username] = { gems: 0 };

  // Reward gems for correct answer
  if (choice === pollData.correctAnswer) {
    users[username].gems += 10;
  }
  writeJson(USERS_FILE, users);

  // Calculate percentages
  const totalVotes = Object.values(pollData.votes).reduce((a, b) => a + b, 0);
  const results = {};
  for (const option of pollData.options) {
    const count = pollData.votes[option] || 0;
    results[option] = totalVotes === 0 ? 0 : (count / totalVotes) * 100;
  }

  res.json({ results, gems: users[username].gems });
});

app.get('/api/leaderboard', (req, res) => {
  const users = readJson(USERS_FILE) || {};
  const leaderboard = Object.entries(users)
    .map(([username, data]) => ({ username, gems: data.gems }))
    .sort((a, b) => b.gems - a.gems);
  res.json(leaderboard);
});

app.post('/api/reset', (req, res) => {
  writeJson(USERS_FILE, {});
  res.json({ message: 'Leaderboard reset' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
