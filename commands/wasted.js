const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function wastedCommand(sock, chatId, message, senderId) {
  let userToWaste;
  
  // Get mentioned user or reply target
  const contextInfo = message.message?.extendedTextMessage?.contextInfo;
  if (contextInfo?.mentionedJid?.length > 0) {
    userToWaste = contextInfo.mentionedJid[0];
  } else if (contextInfo?.participant) {
    userToWaste = contextInfo.participant;
  } else {
    userToWaste = senderId; // Fallback to sender if no one mentioned/replied
  }
  
  if (!userToWaste) {
    await sock.sendMessage(chatId, {
      text: '❌ Please *mention* someone or *reply* to a message to waste them!',
      ...channelInfo
    });
    return;
  }
  
  try {
    // Try getting profile picture
    let profilePic;
    try {
      profilePic = await sock.profilePictureUrl(userToWaste, 'image');
    } catch {
      profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default fallback image
    }
    
    // Fetch the "wasted" overlay image
    const apiUrl = `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`;
    const wastedResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    
    // Send image with caption
    await sock.sendMessage(chatId, {
      image: Buffer.from(wastedResponse.data),
      caption: `⚰️ *WASTED*\n\n@${userToWaste.split('@')[0]} just got wasted. RIP!\n\n— GTA vibes.`,
      mentions: [userToWaste],
      ...channelInfo
    });
    
  } catch (err) {
    console.error('Wasted command failed:', err);
    await sock.sendMessage(chatId, {
      text: '❌ Failed to apply wasted effect. Please try again later.',
      ...channelInfo
    });
  }
}

module.exports = wastedCommand;