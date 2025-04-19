const truths = [
  "What's your biggest fear?",
  "What was your most embarrassing moment?",
  "If you could be invisible for a day, what would you do?",
  "Who was your first crush?",
  "What’s one thing you’ve never told anyone?"
];

const dares = [
  "Send a voice note saying 'I love you' to the group.",
  "Change your profile pic to a funny meme for 1 hour.",
  "Do 10 push-ups and send a video.",
  "Type your last Google search in the group.",
  "Pretend to be a cat for the next 5 messages."
];

async function truthCommand(sock, chatId) {
  const randomTruth = truths[Math.floor(Math.random() * truths.length)];
  await sock.sendMessage(chatId, { text: `🔮 Truth: ${randomTruth}` });
}

async function dareCommand(sock, chatId) {
  const randomDare = dares[Math.floor(Math.random() * dares.length)];
  await sock.sendMessage(chatId, { text: `🔥 Dare: ${randomDare}` });
}

module.exports = { truthCommand, dareCommand };