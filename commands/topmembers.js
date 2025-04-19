const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dataFilePath = path.join(dataDir, 'messageCount.json');

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFilePath)) fs.writeFileSync(dataFilePath, JSON.stringify({}));
}

function loadMessageCounts() {
  ensureDataFile();
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
}

function saveMessageCounts(messageCounts) {
  ensureDataFile();
  fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

function incrementMessageCount(groupId, userId) {
  const messageCounts = loadMessageCounts();
  
  if (!messageCounts[groupId]) messageCounts[groupId] = {};
  if (!messageCounts[groupId][userId]) messageCounts[groupId][userId] = 0;
  
  messageCounts[groupId][userId] += 1;
  saveMessageCounts(messageCounts);
}

function topMembers(sock, chatId, isGroup) {
  if (!isGroup) {
    sock.sendMessage(chatId, { text: 'This command is only available in group chats.' });
    return;
  }
  
  const messageCounts = loadMessageCounts();
  const groupCounts = messageCounts[chatId] || {};
  
  const sortedMembers = Object.entries(groupCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  if (sortedMembers.length === 0) {
    sock.sendMessage(chatId, { text: 'No message activity recorded yet.' });
    return;
  }
  
  let message = '🏆 *Top Members Based on Message Count:*\n\n';
  sortedMembers.forEach(([userId, count], i) => {
    message += `${i + 1}. @${userId.split('@')[0]} — ${count} messages\n`;
  });
  
  sock.sendMessage(chatId, {
    text: message,
    mentions: sortedMembers.map(([userId]) => userId)
  });
}

module.exports = {
  incrementMessageCount,
  topMembers
};