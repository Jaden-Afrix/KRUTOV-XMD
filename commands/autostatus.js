const fs = require('fs');
const path = require('path');
const isOwner = require('../lib/isOwner');

const settingsPath = path.join(__dirname, '../data/autoStatus.json');

const forwardContext = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363161513685998@newsletter',
      newsletterName: 'KnightBot MD',
      serverMessageId: -1
    }
  }
};

// Ensure config exists
if (!fs.existsSync(settingsPath)) {
  fs.writeFileSync(settingsPath, JSON.stringify({ enabled: false }, null, 2));
}

// Main command handler
async function manageAutoStatus(sock, chatId, senderId, args) {
  try {
    if (!isOwner(senderId)) {
      return await sock.sendMessage(chatId, {
        text: 'Only the owner has permission to use this command.',
        ...forwardContext
      });
    }
    
    let config = JSON.parse(fs.readFileSync(settingsPath));
    
    if (!args || args.length === 0) {
      const current = config.enabled ? 'activated' : 'deactivated';
      return await sock.sendMessage(chatId, {
        text: `*Auto-Status Watch*\n\nStatus: ${current.toUpperCase()}\n\nCommands:\n.autostatus on\n.autostatus off`,
        ...forwardContext
      });
    }
    
    const input = args[0].toLowerCase();
    
    if (input === 'on') {
      config.enabled = true;
      fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
      return await sock.sendMessage(chatId, {
        text: 'Auto-viewing of statuses has been turned ON.',
        ...forwardContext
      });
    }
    
    if (input === 'off') {
      config.enabled = false;
      fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
      return await sock.sendMessage(chatId, {
        text: 'Auto-viewing of statuses has been turned OFF.',
        ...forwardContext
      });
    }
    
    await sock.sendMessage(chatId, {
      text: 'Invalid option. Use:\n.autostatus on\n.autostatus off',
      ...forwardContext
    });
    
  } catch (err) {
    console.error('AutoStatus Error:', err);
    await sock.sendMessage(chatId, {
      text: `An error occurred while processing the command.\n\n${err.message}`,
      ...forwardContext
    });
  }
}

// Check current status
function autoStatusIsOn() {
  try {
    const config = JSON.parse(fs.readFileSync(settingsPath));
    return config.enabled;
  } catch (err) {
    console.error('Config read error:', err);
    return false;
  }
}

// Status view handler
async function watchStatus(sock, data) {
  if (!autoStatusIsOn()) return;
  
  const delay = ms => new Promise(res => setTimeout(res, ms));
  
  const tryView = async (key) => {
    try {
      await delay(1000);
      await sock.readMessages([key]);
      const who = key.participant || key.remoteJid;
      console.log(`Viewed: ${who.split('@')[0]}`);
    } catch (err) {
      if (err.message?.includes('rate-overlimit')) {
        console.log('Rate limit hit. Retrying...');
        await delay(2000);
        await sock.readMessages([key]);
      } else {
        console.error('Error viewing status:', err);
      }
    }
  };
  
  try {
    if (data.messages?.length) {
      const key = data.messages[0].key;
      if (key.remoteJid === 'status@broadcast') return await tryView(key);
    }
    
    if (data.key?.remoteJid === 'status@broadcast') {
      return await tryView(data.key);
    }
    
    if (data.reaction?.key.remoteJid === 'status@broadcast') {
      return await tryView(data.reaction.key);
    }
    
  } catch (err) {
    console.error('Status Watch Error:', err.message);
  }
}

module.exports = {
  manageAutoStatus,
  watchStatus
};