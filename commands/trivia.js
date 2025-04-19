const axios = require('axios');
const he = require('he'); // For decoding HTML entities

let triviaGames = {};

async function startTrivia(sock, chatId) {
  if (triviaGames[chatId]) {
    sock.sendMessage(chatId, { text: 'A trivia game is already in progress!' });
    return;
  }
  
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
    const data = response.data.results[0];
    
    const question = he.decode(data.question);
    const correct = he.decode(data.correct_answer);
    const options = [...data.incorrect_answers.map(he.decode), correct];
    
    // Shuffle options
    const shuffled = options.sort(() => Math.random() - 0.5);
    
    triviaGames[chatId] = {
      question,
      correctAnswer: correct,
      options: shuffled
    };
    
    const optionList = shuffled.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
    
    sock.sendMessage(chatId, {
      text: `🧠 *Trivia Time!*\n\n*Question:* ${question}\n\n${optionList}`
    });
  } catch (error) {
    sock.sendMessage(chatId, { text: 'Error fetching trivia question. Try again later.' });
  }
}

function answerTrivia(sock, chatId, answer) {
  if (!triviaGames[chatId]) {
    sock.sendMessage(chatId, { text: 'No trivia game is in progress.' });
    return;
  }
  
  const game = triviaGames[chatId];
  const userAnswer = answer.trim().toLowerCase();
  
  const correctIndex = game.options.findIndex(opt => opt.toLowerCase() === game.correctAnswer.toLowerCase());
  const correctLetter = String.fromCharCode(65 + correctIndex);
  
  const isCorrect =
    userAnswer === game.correctAnswer.toLowerCase() ||
    userAnswer === correctLetter.toLowerCase() ||
    userAnswer === correctIndex.toString();
  
  if (isCorrect) {
    sock.sendMessage(chatId, { text: `✅ Correct! The answer is *${game.correctAnswer}*.` });
  } else {
    sock.sendMessage(chatId, { text: `❌ Wrong! The correct answer was *${game.correctAnswer}*.` });
  }
  
  delete triviaGames[chatId];
}

module.exports = { startTrivia, answerTrivia };