async function unmuteCommand(sock, chatId, isGroup) {
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.' });
        return;
    }

    try {
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        await sock.sendMessage(chatId, { text: '✅ The group has been unmuted. Everyone can now send messages.' });
    } catch (error) {
        console.error('Error unmuting group:', error);
        await sock.sendMessage(chatId, { text: '❗ Failed to unmute the group. Make sure I am an admin.' });
    }
}

module.exports = unmuteCommand;