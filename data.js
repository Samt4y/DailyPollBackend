// Poll questions data
// Each poll has: question, options array, and answer index (correct answer)
const polls = [
  {
    question: "What is the capital of Scotland?",
    options: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
    answer: 0
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Venus", "Mars", "Jupiter"],
    answer: 2
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    answer: 3
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "J.K. Rowling", "Jane Austen"],
    answer: 1
  },
  {
    question: "What gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    answer: 1
  }
];

// Returns the poll index based on the current date (rotates daily)
function getTodayPollIndex() {
  const startDate = new Date(2025, 0, 1); // Jan 1, 2025 as start
  const now = new Date();
  const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  return diffDays % polls.length;
}

module.exports = { polls, getTodayPollIndex };
