const fs = require('fs');
const path = require('path');
const isOwner = require('../lib/isOwner');

const forwardedMeta = {
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

async function clearSessionCommand(sock, chatId, senderId) {
  try {
    if (!isOwner(senderId)) {
      return await sock.sendMessage(chatId, {
        text: '⛔ Only the bot owner can use this feature!',
        ...forwardedMeta
      });
    }
    
    const sessionFolder = path.resolve(__dirname, '../session');
    if (!fs.existsSync(sessionFolder)) {
      return await sock.sendMessage(chatId, {
        text: '⚠️ Session folder is missing or inaccessible.',
        ...forwardedMeta
      });
    }
    
    const allFiles = fs.readdirSync(sessionFolder);
    let deletedCount = 0;
    let issues = [];
    
    await sock.sendMessage(chatId, {
      text: '🛠️ Scanning and optimizing session storage...',
      ...forwardedMeta
    });
    
    // Track the counts
    let syncCount = allFiles.filter(f => f.startsWith('app-state-sync-')).length;
    let preKeys = allFiles.filter(f => f.startsWith('pre-key-')).length;
    
    for (const file of allFiles) {
      const filePath = path.join(sessionFolder, file);
      
      try {
        if (!fs.statSync(filePath).isFile() || file === 'creds.json') continue;
        
        if (file.startsWith('app-state-sync-') && syncCount > 3) {
          fs.unlinkSync(filePath);
          syncCount--;
          deletedCount++;
          continue;
        }
        
        if (file.startsWith('pre-key-') && preKeys > 5) {
          fs.unlinkSync(filePath);
          preKeys--;
          deletedCount++;
          continue;
        }
        
        if (file.startsWith('sender-key-')) {
          const age = Date.now() - fs.statSync(filePath).mtimeMs;
          if (age > 6 * 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
        
      } catch (err) {
        console.error(`Issue deleting ${file}:`, err.message);
        issues.push(file);
      }
    }
    
    let message = `✅ *Session Cleanup Completed*\n\n` +
      `📦 Files removed: ${deletedCount}\n` +
      `⚙️ Optimization successful.\n`;
    
    if (issues.length > 0) {
      message += `\n⚠️ Skipped ${issues.length} file(s) due to errors.`;
    }
    
    await sock.sendMessage(chatId, {
      text: message,
      ...forwardedMeta
    });
    
  } catch (err) {
    console.error('Fatal error during session clear:', err);
    await sock.sendMessage(chatId, {
      text: `❌ Failed to clear session files:\n${err.message}`,
      ...forwardedMeta
    });
  }
}

module.exports = clearSessionCommand;