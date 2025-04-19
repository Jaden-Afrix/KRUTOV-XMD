const { isAdmin } = require('../lib/isAdmin');

async function demoteCommand(sock, chatId, mentionedJids, message) {
  try {
    if (!chatId.endsWith('@g.us')) {
      return await sock.sendMessage(chatId, {
        text: '⚠️ This command only works in group chats.'
      });
    }
    
    const senderJid = message.key.participant || message.key.remoteJid;
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderJid);
    
    if (!isBotAdmin) {
      return await sock.sendMessage(chatId, {
        text: '❌ I need to be an admin in this group to perform this action.'
      });
    }
    
    if (!isSenderAdmin) {
      return await sock.sendMessage(chatId, {
        text: '⛔ Only group admins can use the *demote* command.'
      });
    }
    
    let targets = [];
    
    if (mentionedJids?.length) {
      targets = mentionedJids;
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      targets = [message.message.extendedTextMessage.contextInfo.participant];
    }
    
    if (!targets.length) {
      return await sock.sendMessage(chatId, {
        text: '❗ Please tag or reply to the user you want to demote.'
      });
    }
    
    // Perform demotion
    await sock.groupParticipantsUpdate(chatId, targets, "demote");
    
    const taggedUsers = await Promise.all(targets.map(jid => `@${jid.split('@')[0]}`));
    const demotedBy = `@${senderJid.split('@')[0]}`;
    const timestamp = new Date().toLocaleString();
    
    const msg = `*『 GROUP DEMOTION 』*\n\n` +
      `👤 *Demoted:* \n${taggedUsers.map(u => `• ${u}`).join('\n')}\n\n` +
      `👑 *By:* ${demotedBy}\n` +
      `📅 *On:* ${timestamp}`;
    
    await sock.sendMessage(chatId, {
      text: msg,
      mentions: [...targets, senderJid]
    });
    
  } catch (error) {
    console.error('Demotion error:', error);
    
    if (error.data === 429) {
      await new Promise(r => setTimeout(r, 2000));
      return await sock.sendMessage(chatId, {
        text: '⚠️ Too many requests. Please try again in a few seconds.'
      });
    }
    
    await sock.sendMessage(chatId, {
      text: '❌ Could not demote the user(s). Please ensure I have the proper permissions.'
    });
  }
}

async function handleDemotionEvent(sock, groupId, participants, author) {
  try {
    if (!groupId || !participants?.length) return;
    
    const demotedNames = await Promise.all(participants.map(jid => `@${jid.split('@')[0]}`));
    const demoter = author ? `@${author.split('@')[0]}` : 'System';
    const mentions = [...participants];
    if (author) mentions.push(author);
    
    const msg = `*『 GROUP DEMOTION 』*\n\n` +
      `👤 *Demoted:* \n${demotedNames.map(u => `• ${u}`).join('\n')}\n\n` +
      `👑 *By:* ${demoter}\n` +
      `📅 *On:* ${new Date().toLocaleString()}`;
    
    await sock.sendMessage(groupId, {
      text: msg,
      mentions
    });
    
  } catch (error) {
    console.error('Auto-demotion handler failed:', error);
    if (error.data === 429) await new Promise(r => setTimeout(r, 2000));
  }
}

module.exports = { demoteCommand, handleDemotionEvent };