const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

function loadWarnings() {
  if (!fs.existsSync(warningsFilePath)) {
    fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
  }
  return JSON.parse(fs.readFileSync(warningsFilePath, 'utf8'));
}

async function warningsCommand(sock, chatId, mentionedJidList, message) {
  const warnings = loadWarnings();
  
  // Determine user to check: mention or reply
  let userToCheck = mentionedJidList?.[0] || message.message?.extendedTextMessage?.contextInfo?.participant;
  
  if (!userToCheck) {
    return await sock.sendMessage(chatId, {
      text: '❌ Please *mention* a user or *reply* to their message to check warnings.'
    });
  }
  
  const userWarnings = warnings[chatId]?.[userToCheck] || 0;
  
  const msg = `*『 WARNINGS CHECK 』*\n\n` +
    `👤 *User:* @${userToCheck.split('@')[0]}\n` +
    `⚠️ *Warnings:* ${userWarnings}/3`;
  
  await sock.sendMessage(chatId, {
    text: msg,
    mentions: [userToCheck]
  });
}

module.exports = warningsCommand;