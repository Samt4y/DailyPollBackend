document.addEventListener('DOMContentLoaded', () => {
  const usernameScreen = document.getElementById('username-screen');
  const usernameInput = document.getElementById('username-input');
  const startBtn = document.getElementById('start-btn');
  const mainContent = document.getElementById('main-content');
  const usernameDisplay = document.getElementById('username-display');
  const gemsCountEl = document.getElementById('gems-count');
  const pollQuestionEl = document.getElementById('poll-question');
  const pollOptionsEl = document.getElementById('poll-options');
  const countdownEl = document.getElementById('countdown-timer');
  const leaderboardBtn = document.getElementById('leaderboard-btn');

  const polls = [
    {
      question: 'What is the capital of Scotland?',
      options: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
      correct: 0,
    },
    {
      question: 'What is the Red Planet called?',
      options: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
      correct: 0,
    },
    {
      question: 'Who wrote "Hamlet"?',
      options: ['Shakespeare', 'Dickens', 'Tolstoy', 'Hemingway'],
      correct: 0,
    },
  ];

  let currentPollIndex = 0;
  let gems = 0;
  let hasVoted = false;
  let username = null;

  // Load votes object from localStorage
  function loadVotes() {
    return JSON.parse(localStorage.getItem('pollVotes') || '{}');
  }
  // Save votes object
  function saveVotes(votes) {
    localStorage.setItem('pollVotes', JSON.stringify(votes));
  }

  // Load which polls the user voted on
  function loadUserVotes() {
    return JSON.parse(localStorage.getItem('userVotes') || '{}');
  }
  // Save userVotes object
  function saveUserVotes(userVotes) {
    localStorage.setItem('userVotes', JSON.stringify(userVotes));
  }

  // Update leaderboard in localStorage (username => gems)
  function updateLeaderboard(username, gemsEarned) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || {};
    leaderboard[username] = (leaderboard[username] || 0) + gemsEarned;
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  }

  username = localStorage.getItem('username');
  gems = parseInt(localStorage.getItem('gems') || '0', 10);

  if (username) {
    usernameDisplay.textContent = username;
    usernameScreen.style.display = 'none';
    mainContent.style.display = 'flex';
    updateGems();
    showPoll(currentPollIndex);
    startCountdown();
  } else {
    usernameScreen.style.display = 'flex';
    mainContent.style.display = 'none';
  }

  startBtn.addEventListener('click', () => {
    const val = usernameInput.value.trim();
    if (!val) {
      usernameInput.focus();
      return;
    }
    username = val;
    localStorage.setItem('username', username);
    usernameDisplay.textContent = username;
    usernameScreen.style.display = 'none';
    mainContent.style.display = 'flex';
    gems = 0;
    localStorage.setItem('gems', gems);
    updateGems();
    showPoll(currentPollIndex);
    startCountdown();
  });

  function updateGems() {
    gemsCountEl.textContent = gems;
  }

  function showPoll(index) {
    hasVoted = false;
    const poll = polls[index];
    pollQuestionEl.textContent = poll.question;
    pollOptionsEl.innerHTML = '';

    const votes = loadVotes();
    const userVotes = loadUserVotes();
    const pollVotes = votes[index] || {};
    const totalVotes = Object.values(pollVotes).reduce((a,b) => a+b, 0) || 0;

    const userHasVoted = userVotes[index] !== undefined;

    poll.options.forEach((option, i) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'poll-option';

      let pct = totalVotes > 0 ? ((pollVotes[i] || 0) / totalVotes) * 100 : 0;
      optionDiv.innerHTML = `
        <span class="option-text">${option}</span>
        <div class="percentage-bar" style="width: 0%;"></div>
      `;

      if (userHasVoted) {
        const bar = optionDiv.querySelector('.percentage-bar');
        bar.style.width = pct + '%';
        optionDiv.querySelector('.option-text').textContent = `${option} - ${pct.toFixed(1)}%`;
        optionDiv.style.cursor = 'default';
      } else {
        optionDiv.style.cursor = 'pointer';
        optionDiv.addEventListener('click', () => {
          if (hasVoted) return;
          hasVoted = true;
          castVote(index, i);
        });
      }

      pollOptionsEl.appendChild(optionDiv);
    });
  }

  function castVote(pollIndex, optionIndex) {
    const votes = loadVotes();
    if (!votes[pollIndex]) votes[pollIndex] = {};
    votes[pollIndex][optionIndex] = (votes[pollIndex][optionIndex] || 0) + 1;
    saveVotes(votes);

    const userVotes = loadUserVotes();
    userVotes[pollIndex] = optionIndex;
    saveUserVotes(userVotes);

    if (optionIndex === polls[pollIndex].correct) {
      gems += 10;
      localStorage.setItem('gems', gems);
      updateGems();
      updateLeaderboard(username, 10);  // <-- Update leaderboard here
    }

    animatePercentages(pollIndex);
  }

  function animatePercentages(pollIndex) {
    const votes = loadVotes();
    const pollVotes = votes[pollIndex] || {};
    const totalVotes = Object.values(pollVotes).reduce((a,b) => a+b, 0) || 0;
    const optionDivs = pollOptionsEl.querySelectorAll('.poll-option');

    optionDivs.forEach((div, i) => {
      const pct = totalVotes > 0 ? ((pollVotes[i] || 0) / totalVotes) * 100 : 0;
      const bar = div.querySelector('.percentage-bar');
      bar.style.width = '0%';
      div.style.cursor = 'default';

      setTimeout(() => {
        bar.style.width = pct + '%';
      }, 50);

      const span = div.querySelector('.option-text');
      span.textContent = `${polls[pollIndex].options[i]} - ${pct.toFixed(1)}%`;
    });
  }

  function startCountdown() {
    function updateCountdown() {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      let diffMs = nextMidnight - now;

      if (diffMs <= 0) {
        currentPollIndex = (currentPollIndex + 1) % polls.length;
        showPoll(currentPollIndex);
        diffMs = 24 * 60 * 60 * 1000;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      countdownEl.textContent = `Next poll in: ${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

      setTimeout(updateCountdown, 1000);
    }
    updateCountdown();
  }

  leaderboardBtn.addEventListener('click', () => {
    window.location.href = 'leaderboard.html';
  });
});
