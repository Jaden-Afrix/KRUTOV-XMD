async function aliveCommand(sock, chatId) {
  try {
    const message = `*🤖 KRUTOV-XMD is Active!*\n\n` +
      `*Version:* 2.0.0\n` +
      `*Status:* ✅ Online\n` +
      `*Mode:* Public\n\n` +
      `*🌟 Features:*\n` +
      `• Group Management\n` +
      `• Antilink Protection\n` +
      `• Fun Commands\n` +
      `• AI Chat\n` +
      `• Sticker Maker\n` +
      `• Auto-Reply\n` +
      `• And much more!\n\n` +
      `Type *.menu* to view all commands.`;
    
    await sock.sendMessage(chatId, {
      text: message,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          title: 'KRUTOV-XMD BOT',
          body: 'Secure | Fast | Powerful',
          thumbnailUrl: 'https://ibb.co/JWcCCbLf', // optional thumbnail
          sourceUrl: 'https://yourbotwebsite.com', // replace with your site or repo
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });
  } catch (error) {
    console.error('Alive command error:', error?.message || error);
    await sock.sendMessage(chatId, {
      text: '⚠️ KRUTOV-XMD is alive but encountered an error displaying full status.'
    });
  }
}

module.exports = aliveCommand;