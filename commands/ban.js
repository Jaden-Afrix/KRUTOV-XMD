const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');

const banListPath = path.join(__dirname, '../data/banned.json');

async function handleBanUser(sock, chatId, msg) {
  let targetUser = null;
  
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const replyUser = msg.message?.extendedTextMessage?.contextInfo?.participant;
  
  if (mentions.length > 0) {
    targetUser = mentions[0];
  } else if (replyUser) {
    targetUser = replyUser;
  }
  
  if (!targetUser) {
    return await sock.sendMessage(chatId, {
      text: 'Tag a user or reply to their message to ban them!',
      ...channelInfo
    });
  }
  
  try {
    let banned = [];
    
    if (fs.existsSync(banListPath)) {
      banned = JSON.parse(fs.readFileSync(banListPath));
    }
    
    if (banned.includes(targetUser)) {
      return await sock.sendMessage(chatId, {
        text: `@${targetUser.split('@')[0]} is already in the ban list.`,
        mentions: [targetUser],
        ...channelInfo
      });
    }
    
    banned.push(targetUser);
    fs.writeFileSync(banListPath, JSON.stringify(banned, null, 2));
    
    await sock.sendMessage(chatId, {
      text: `User @${targetUser.split('@')[0]} has been banned successfully.`,
      mentions: [targetUser],
      ...channelInfo
    });
    
  } catch (err) {
    console.error('Ban error:', err);
    await sock.sendMessage(chatId, {
      text: 'Something went wrong while processing the ban.',
      ...channelInfo
    });
  }
}

module.exports = handleBanUser;