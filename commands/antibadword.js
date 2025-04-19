const { handleAntiBadwordCommand } = require('../lib/antibadword');
const isAdminHelper = require('../lib/isAdmin');

async function antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin) {
  try {
    if (!isSenderAdmin) {
      await sock.sendMessage(chatId, {
        text: '```❌ This command is for *Group Admins Only*!```'
      });
      return;
    }
    
    // Extract command arguments from message
    const text =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      '';
    const [command, ...args] = text.trim().split(/\s+/);
    const match = args.join(' ');
    
    if (!match) {
      await sock.sendMessage(chatId, {
        text: '```Usage: .antibadword <word|on|off|list>```'
      });
      return;
    }
    
    await handleAntiBadwordCommand(sock, chatId, message, match);
  } catch (error) {
    console.error('Error in antibadword command:', error?.message || error);
    await sock.sendMessage(chatId, {
      text: '⚠️ *An error occurred while processing the antibadword command.*'
    });
  }
}

module.exports = antibadwordCommand;