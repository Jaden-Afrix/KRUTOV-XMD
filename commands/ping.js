const os = require('os');

async function pingCommand(sock, chatId) {
  try {
    const start = Date.now();
    
    // System data
    const uptime = process.uptime();
    const ram = (os.totalmem() - os.freemem()) / (1024 * 1024 * 1024);
    const platform = os.platform();
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;
    
    await sock.sendMessage(chatId, { text: '⏳ *Injecting packets into the matrix...*' });
    const end = Date.now();
    const ping = end - start;
    
    const message = `*⛧ SYSTEM PULSE MONITOR - KRUTOV-XMD ⛧*\n\n` +
      `*⚡ Ping:* ${ping}ms\n` +
      `*💻 Platform:* ${platform.toUpperCase()}\n` +
      `*🧠 RAM Used:* ${ram.toFixed(2)} GB\n` +
      `*⏱ Uptime:* ${formatTime(uptime)}\n\n` +
      `*🧬 CPU Model:* ${cpuModel}\n` +
      `*🧩 CPU Cores:* ${cpuCores}\n\n` +
      `*Quote:* _“Every byte you send is a bullet in the war for freedom.”_ – *Jaden Afrix*`;
    
    await sock.sendMessage(chatId, {
      text: message,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363161513685998@newsletter',
          newsletterName: 'KRUTOV-XMD Bot',
          serverMessageId: -1
        }
      }
    });
  } catch (error) {
    console.error('Error in ping command:', error);
    await sock.sendMessage(chatId, { text: '❌ Connection to core interrupted. Try again.' });
  }
}

function formatTime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= (24 * 60 * 60);
  const hours = Math.floor(seconds / (60 * 60));
  seconds %= (60 * 60);
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  
  let time = '';
  if (days > 0) time += `${days}d `;
  if (hours > 0) time += `${hours}h `;
  if (minutes > 0) time += `${minutes}m `;
  if (seconds > 0) time += `${seconds}s`;
  
  return time.trim();
}

module.exports = pingCommand;