const eightBallResponses = [
  "Yes, definitely!",
  "No way!",
  "Ask again later.",
  "It is certain.",
  "Very doubtful.",
  "Without a doubt.",
  "My reply is no.",
  "Signs point to yes."
];

async function eightBallCommand(sock, chatId, question) {
  if (!question || question.trim().length === 0) {
    await sock.sendMessage(chatId, { text: '❓ You need to ask a question first.\nExample: *.8ball Will I become rich?*' });
    return;
  }
  
  const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
  await sock.sendMessage(chatId, {
    text: `🎱 *Question:* ${question}\n🧙‍♂️ *Answer:* ${randomResponse}`
  });
}

module.exports = { eightBallCommand };