const { isAdmin } = require('../lib/isAdmin');

// Function to handle manual promotions via command
async function promoteCommand(sock, chatId, mentionedJids, message) {
  let userToPromote = [];
  
  if (mentionedJids && mentionedJids.length > 0) {
    userToPromote = mentionedJids;
  } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
    userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
  }
  
  if (userToPromote.length === 0) {
    await sock.sendMessage(chatId, {
      text: '*❌ Mention or reply to the user you want to promote!*'
    });
    return;
  }
  
  try {
    await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");
    
    const usernames = await Promise.all(userToPromote.map(async jid => `@${jid.split('@')[0]}`));
    const promoterJid = sock.user.id;
    
    const promotionMessage = `*⛧ SYSTEM UPGRADE - KRUTOV-XMD ⛧*\n\n` +
      `*🔼 Promoted Agent${userToPromote.length > 1 ? 's' : ''}:*\n${usernames.map(name => `• ${name}`).join('\n')}\n\n` +
      `*🧠 Initiated By:* @${promoterJid.split('@')[0]}\n` +
      `*🕰 Timestamp:* ${new Date().toLocaleString()}\n\n` +
      `*Quote:* _“Access granted to the elite—command with honor.”_ – *Jaden Afrix*`;
    
    await sock.sendMessage(chatId, {
      text: promotionMessage,
      mentions: [...userToPromote, promoterJid]
    });
  } catch (error) {
    console.error('Error in promote command:', error);
    await sock.sendMessage(chatId, { text: '❌ Failed to promote user(s)!' });
  }
}

// Function to handle automatic promotion detection
async function handlePromotionEvent(sock, groupId, participants, author) {
  try {
    const promotedUsernames = await Promise.all(participants.map(jid => `@${jid.split('@')[0]}`));
    let promotedBy;
    const mentionList = [...participants];
    
    if (author && author.length > 0) {
      promotedBy = `@${author.split('@')[0]}`;
      mentionList.push(author);
    } else {
      promotedBy = '*System*';
    }
    
    const promotionMessage = `*⛧ AUTO-PROMOTION SYSTEM TRIGGERED ⛧*\n\n` +
      `*🎖 Promoted User${participants.length > 1 ? 's' : ''}:*\n${promotedUsernames.map(name => `• ${name}`).join('\n')}\n\n` +
      `*🧠 Promoted By:* ${promotedBy}\n` +
      `*📅 Date:* ${new Date().toLocaleString()}\n\n` +
      `*Quote:* _“You’ve risen from user... to operator.”_ – *Jaden Afrix*`;
    
    await sock.sendMessage(groupId, {
      text: promotionMessage,
      mentions: mentionList
    });
  } catch (error) {
    console.error('Error handling promotion event:', error);
  }
}

module.exports = { promoteCommand, handlePromotionEvent };