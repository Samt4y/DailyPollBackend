const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Your API routes here (poll, vote, leaderboard)...

// Serve frontend files from root folder
app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/leaderboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// ONLY ONE app.listen, using environment PORT or fallback 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
