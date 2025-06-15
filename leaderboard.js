const leaderboardList = document.getElementById('leaderboard-list');
const resetBtn = document.getElementById('reset-btn');
const backLink = document.getElementById('back-link');

function loadUserDataAll(){
  // We scan localStorage keys to find user data by username and gems
  // Since our data model only stores one user, let's simulate a leaderboard by storing all users in localStorage as 'pollUserData-username'
  let leaderboard = [];
  for(let i=0; i<localStorage.length; i++){
    const key = localStorage.key(i);
    if(key.startsWith('pollUserData-')){
      const data = JSON.parse(localStorage.getItem(key));
      if(data && data.username && typeof data.gems === 'number'){
        leaderboard.push({username: data.username, gems: data.gems});
      }
    }
  }
  return leaderboard;
}

function loadLeaderboard(){
  // Since our main site only stores current user in 'pollUserData', to simulate a leaderboard, let's store all users under 'pollUserData-username' too
  // So on poll page saveUserData(), also save under 'pollUserData-username'
  // We'll read from those keys here

  // Just for demo, let's read all keys starting with 'pollUserData-' except the base one 'pollUserData'
  let leaderboard = [];
  for(let i=0; i<localStorage.length; i++){
    const key = localStorage.key(i);
    if(key.startsWith('pollUserData-') && key !== 'pollUserData'){
      const data = JSON.parse(localStorage.getItem(key));
      if(data && data.username && typeof data.gems === 'number'){
        leaderboard.push({username: data.username, gems: data.gems});
      }
    }
  }
  // Sort descending gems
  leaderboard.sort((a,b) => b.gems - a.gems);
  return leaderboard;
}

function renderLeaderboard(){
  const list = loadLeaderboard();
  if(list.length === 0){
    leaderboardList.innerHTML = '<p>No players yet.</p>';
    return;
  }
  const html = list.map((u,i) => `<div class="leaderboard-entry"><strong>#${i+1}</strong> ${u.username}: ${u.gems} 💎</div>`).join('');
  leaderboardList.innerHTML = html;
}

resetBtn.addEventListener('click', () => {
  if(confirm('Reset leaderboard and votes?')){
    localStorage.clear();
    renderLeaderboard();
  }
});

renderLeaderboard();
