async function shipCommand(sock, chatId, msg, groupMetadata) {
  try {
    const participants = groupMetadata.participants.map(v => v.id);
    
    if (participants.length < 2) {
      await sock.sendMessage(chatId, { text: '❌ Not enough participants to ship!' });
      return;
    }
    
    // Pick two different random users
    let firstUser = participants[Math.floor(Math.random() * participants.length)];
    let secondUser;
    do {
      secondUser = participants[Math.floor(Math.random() * participants.length)];
    } while (secondUser === firstUser);
    
    // Random ship percentage
    const shipPercent = Math.floor(Math.random() * 100) + 1;
    
    // Format mention
    const formatMention = id => '@' + id.split('@')[0];
    
    const shipMessage = `*❤️ SHIP MATCH ❤️*\n\n` +
      `${formatMention(firstUser)} ❤️ ${formatMention(secondUser)}\n\n` +
      `*Ship Percentage:* ${shipPercent}%\n\n` +
      `Congratulations! May your love blossom!`;
    
    await sock.sendMessage(chatId, {
      text: shipMessage,
      mentions: [firstUser, secondUser]
    });
    
  } catch (error) {
    console.error('Error in ship command:', error);
    await sock.sendMessage(chatId, { text: '❌ Failed to ship! Make sure this is a group.' });
  }
}

module.exports = shipCommand;