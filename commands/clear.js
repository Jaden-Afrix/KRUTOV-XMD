async function wipeBotMessage(sock, chatId) {
  try {
    // Notify about the cleanup
    const botMsg = await sock.sendMessage(chatId, { text: 'Initiating cleanup...' });
    
    // Get the message key to identify the message for deletion
    const keyToRemove = botMsg.key;
    
    // Delete the notification message itself
    await sock.sendMessage(chatId, { delete: keyToRemove });
    
  } catch (err) {
    console.error('Cleanup error:', err);
    await sock.sendMessage(chatId, { text: '⚠️ Something went wrong while trying to clean up!' });
  }
}

module.exports = { wipeBotMessage };