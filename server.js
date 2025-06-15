const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Serve frontend files from root folder
app.use(express.static(path.join(__dirname, '/')));

// === API ROUTES ===

// GET current poll
app.get('/api/poll', (req, res) => {
  fs.readFile(path.join(__dirname, 'data/poll.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read poll data' });
    res.json(JSON.parse(data));
  });
});

// POST poll answer
app.post('/api/answer', (req, res) => {
  const { username, answerIndex } = req.body;

  const pollPath = path.join(__dirname, 'data/poll.json');
  const usersPath = path.join(__dirname, 'data/users.json');

  // Read poll data
  const poll = JSON.parse(fs.readFileSync(pollPath, 'utf8'));

  // Read user data
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

  // Update user score if correct
  const isCorrect = answerIndex === poll.correct;

  if (!users[username]) users[username] = { gems: 0 };
  if (isCorrect) users[username].gems += 5;

  // Save updated users
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  // Track votes
  if (!poll.votes) poll.votes = Array(poll.options.length).fill(0);
  poll.votes[answerIndex]++;
  fs.writeFileSync(pollPath, JSON.stringify(poll, null, 2));

  res.json({ correct: isCorrect, votes: poll.votes });
});

// GET leaderboard
app.get('/api/leaderboard', (req, res) => {
  const usersPath = path.join(__dirname, 'data/users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

  const leaderboard = Object.entries(users)
    .map(([name, data]) => ({ name, gems: data.gems }))
    .sort((a, b) => b.gems - a.gems)
    .slice(0, 10);

  res.json(leaderboard);
});

// === PAGE ROUTES ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/leaderboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
