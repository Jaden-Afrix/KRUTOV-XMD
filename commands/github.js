async function githubCommand(sock, chatId) {
  const message = `*⚡ KRUTOV-XMD by Jaden-Afrix*

*📁 GitHub Repository:*
https://github.com/Jaden-Afrix/KRUTOV-XMD

*🔔 Follow for updates:*
https://youtube.com/@jaden.afrix-z8f

⭐ _Support open source — drop a star on the repo if you vibe with it!_`;
  
  try {
    await sock.sendMessage(chatId, {
      text: message,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363161513685998@newsletter',
          newsletterName: 'KRUTOV-XMD Official',
          serverMessageId: -1
        }
      }
    });
  } catch (error) {
    console.error('GitHub Command Error:', error);
    await sock.sendMessage(chatId, {
      text: '❌ Could not fetch repository details at the moment.'
    });
  }
}

module.exports = githubCommand;