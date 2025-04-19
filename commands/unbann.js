const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');

const bannedPath = path.join(__dirname, '..', 'data', 'banned.json');

async function unbanCommand(sock, chatId, message) {
  let userToUnban;
  
  if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
  } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
    userToUnban = message.message.extendedTextMessage.contextInfo.participant;
  }
  
  if (!userToUnban) {
    await sock.sendMessage(chatId, {
      text: 'Please mention the user or reply to their message to unban!',
      ...channelInfo
    });
    return;
  }
  
  try {
    if (!fs.existsSync(bannedPath)) {
      fs.writeFileSync(bannedPath, JSON.stringify([]));
    }
    
    const bannedUsers = JSON.parse(fs.readFileSync(bannedPath));
    const index = bannedUsers.indexOf(userToUnban);
    
    if (index > -1) {
      bannedUsers.splice(index, 1);
      fs.writeFileSync(bannedPath, JSON.stringify(bannedUsers, null, 2));
      
      await sock.sendMessage(chatId, {
        text: `✅ Unbanned @${userToUnban.split('@')[0]}!`,
        mentions: [userToUnban],
        ...channelInfo
      });
    } else {
      await sock.sendMessage(chatId, {
        text: `❌ @${userToUnban.split('@')[0]} is not in the banned list!`,
        mentions: [userToUnban],
        ...channelInfo
      });
    }
  } catch (error) {
    console.error('Error in unban command:', error);
    await sock.sendMessage(chatId, { text: '❗ Failed to unban user.', ...channelInfo });
  }
}

module.exports = unbanCommand;