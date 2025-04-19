const isAdmin = require('../lib/isAdmin');

async function kickCommand(sock, chatId, senderId, mentionedJids, message) {
  const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
  
  if (!isBotAdmin) {
    await sock.sendMessage(chatId, { text: '*[ KRUTOV-XMD ]* Bot needs admin rights to kick users.' });
    return;
  }
  
  if (!isSenderAdmin) {
    await sock.sendMessage(chatId, { text: '*[ KRUTOV-XMD ]* Only group admins can use this command.' });
    return;
  }
  
  let usersToKick = [];
  
  if (mentionedJids && mentionedJids.length > 0) {
    usersToKick = mentionedJids;
  } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
    usersToKick = [message.message.extendedTextMessage.contextInfo.participant];
  }
  
  if (usersToKick.length === 0) {
    await sock.sendMessage(chatId, {
      text: '*[ KRUTOV-XMD ]* Mention or reply to a user you want to kick!'
    });
    return;
  }
  
  try {
    await sock.groupParticipantsUpdate(chatId, usersToKick, "remove");
    
    const usernames = usersToKick.map(jid => `@${jid.split('@')[0]}`);
    
    await sock.sendMessage(chatId, {
      text: `*GET THE F+CK OUT OF HERE SON OF A B+TCH*\n${usernames.join(', ')}`,
      mentions: usersToKick
    });
  } catch (error) {
    console.error('Error in kick command:', error);
    await sock.sendMessage(chatId, {
      text: '*[ KRUTOV-XMD ]* Failed to kick user(s)!'
    });
  }
}

module.exports = kickCommand;