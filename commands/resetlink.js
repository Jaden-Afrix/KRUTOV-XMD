async function resetlinkCommand(sock, chatId, senderId) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);

        const isAdmin = groupMetadata.participants.find(p => p.id === senderId && p.admin);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botId && p.admin);

        if (!isAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Only admins can use this command!' });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Bot must be admin to reset the group link!' });
            return;
        }

        const newCode = await sock.groupRevokeInvite(chatId);

        await sock.sendMessage(chatId, { 
            text: `✅ Group link has been successfully reset!\n\n🔗 New Link:\nhttps://chat.whatsapp.com/${newCode}`
        });

    } catch (error) {
        console.error('Error in resetlink command:', error);
        await sock.sendMessage(chatId, { text: '⚠️ Failed to reset group link!' });
    }
}

module.exports = resetlinkCommand;