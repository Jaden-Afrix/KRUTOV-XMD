const { bots } = require('../lib/antilink');
const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

// === Antilink Command Handler ===
async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin) {
  try {
    if (!isSenderAdmin) {
      return await sock.sendMessage(chatId, {
        text: '```[ACCESS DENIED] Only Group Admins can use this command.```',
      });
    }
    
    const prefix = '.';
    const args = userMessage.trim().slice(prefix.length + 'antilink'.length).split(/\s+/);
    const action = args[0]?.toLowerCase();
    
    if (!action) {
      return await sock.sendMessage(chatId, {
        text: [
          '```ANTILINK SETUP GUIDE```',
          `${prefix}antilink on`,
          `${prefix}antilink off`,
          `${prefix}antilink set delete | kick | warn`,
          `${prefix}antilink get`,
        ].join('\n'),
      });
    }
    
    switch (action) {
      case 'on': {
        const current = await getAntilink(chatId, 'on');
        if (current?.enabled) {
          return await sock.sendMessage(chatId, { text: '*Antilink is already active.*' });
        }
        
        const success = await setAntilink(chatId, 'on', 'delete');
        return await sock.sendMessage(chatId, {
          text: success ?
            '*✅ Antilink enabled successfully!*' :
            '*❌ Failed to enable antilink.*',
        });
      }
      
      case 'off': {
        await removeAntilink(chatId, 'on');
        return await sock.sendMessage(chatId, { text: '*🚫 Antilink has been disabled.*' });
      }
      
      case 'set': {
        const mode = args[1];
        if (!['delete', 'kick', 'warn'].includes(mode)) {
          return await sock.sendMessage(chatId, {
            text: '*Invalid mode. Choose from: delete, kick, or warn.*',
          });
        }
        
        const updated = await setAntilink(chatId, 'on', mode);
        return await sock.sendMessage(chatId, {
          text: updated ?
            `*✅ Antilink action set to: ${mode}*` :
            '*❌ Failed to update antilink action.*',
        });
      }
      
      case 'get': {
        const config = await getAntilink(chatId, 'on');
        return await sock.sendMessage(chatId, {
          text: [
            '*🔍 Current Antilink Settings:*',
            `• Status: ${config?.enabled ? 'ON' : 'OFF'}`,
            `• Action: ${config?.action || 'Not configured'}`,
          ].join('\n'),
        });
      }
      
      default:
        return await sock.sendMessage(chatId, {
          text: `*Unknown option. Use ${prefix}antilink to view usage.*`,
        });
    }
  } catch (err) {
    console.error('Antilink Command Error:', err);
    await sock.sendMessage(chatId, { text: '*⚠️ Failed to process Antilink command.*' });
  }
}

// === Link Detection & Enforcement ===
async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
  try {
    const config = await getAntilink(chatId, 'on');
    if (!config?.enabled) return;
    
    const patterns = {
      whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/,
      whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/,
      telegram: /t\.me\/[A-Za-z0-9_]+/,
      allLinks: /https?:\/\/[^\s]+/,
    };
    
    const shouldDelete =
      (config.action === 'whatsappGroup' && patterns.whatsappGroup.test(userMessage)) ||
      (config.action === 'whatsappChannel' && patterns.whatsappChannel.test(userMessage)) ||
      (config.action === 'telegram' && patterns.telegram.test(userMessage)) ||
      (config.action === 'allLinks' && patterns.allLinks.test(userMessage));
    
    if (!shouldDelete) return;
    
    // Try deleting message
    const msgId = message.key.id;
    const participant = message.key.participant || senderId;
    
    try {
      await sock.sendMessage(chatId, {
        delete: { remoteJid: chatId, fromMe: false, id: msgId, participant },
      });
      console.log(`Deleted message: ${msgId}`);
    } catch (delError) {
      console.warn('Failed to delete message:', delError);
    }
    
    // Warn or punish user
    await sock.sendMessage(chatId, {
      text: `*⚠️ @${senderId.split('@')[0]}, link sharing is not allowed here.*`,
      mentions: [senderId],
    });
  } catch (error) {
    console.error('Link Detection Error:', error);
  }
}

module.exports = {
  handleAntilinkCommand,
  handleLinkDetection,
};