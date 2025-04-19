const { isJidGroup } = require('@whiskeysockets/baileys');
const { getAntilink, incrementWarningCount, resetWarningCount, isSudo } = require('../lib/index');
const config = require('../config');

const WARN_COUNT = config.WARN_COUNT || 3;

/**
 * Checks if a string contains a URL.
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string contains a URL.
 */
function containsURL(str) {
  const urlRegex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?/i;
  return urlRegex.test(str);
}

/**
 * Handles the Antilink functionality for group chats.
 * @param {object} msg - The message object to process.
 * @param {object} sock - The socket object to use for sending messages.
 */
async function Antilink(msg, sock) {
  const jid = msg.key.remoteJid;
  if (!isJidGroup(jid)) return;
  
  const SenderMessage = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text || '';
  if (!SenderMessage || typeof SenderMessage !== 'string') return;
  
  const sender = msg.key.participant || msg.key.remoteJid;
  if (!sender) return;
  
  const isAdmin = await isSudo(sender);
  if (isAdmin) return;
  
  if (!containsURL(SenderMessage.trim())) return;
  
  const antilinkConfig = await getAntilink(jid, 'on');
  if (!antilinkConfig?.enabled) return;
  
  const action = antilinkConfig.action;
  
  try {
    // Delete message first
    await sock.sendMessage(jid, { delete: msg.key });
    
    switch (action) {
      case 'delete':
        await sock.sendMessage(jid, {
          text: `*@${sender.split('@')[0]} links are not allowed here*`,
          mentions: [sender]
        });
        break;
        
      case 'kick':
        await sock.groupParticipantsUpdate(jid, [sender], 'remove');
        await sock.sendMessage(jid, {
          text: `*@${sender.split('@')[0]} has been kicked for sending links*`,
          mentions: [sender]
        });
        break;
        
      case 'warn':
        const warningCount = await incrementWarningCount(jid, sender);
        if (warningCount >= WARN_COUNT) {
          await sock.groupParticipantsUpdate(jid, [sender], 'remove');
          await resetWarningCount(jid, sender);
          await sock.sendMessage(jid, {
            text: `*@${sender.split('@')[0]} was kicked after ${WARN_COUNT} warnings for link sharing*`,
            mentions: [sender]
          });
        } else {
          await sock.sendMessage(jid, {
            text: `*@${sender.split('@')[0]} warning ${warningCount}/${WARN_COUNT} for sending links*`,
            mentions: [sender]
          });
        }
        break;
    }
  } catch (error) {
    console.error('Error in Antilink system:', error);
  }
}

module.exports = { Antilink };