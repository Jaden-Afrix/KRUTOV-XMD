const isAdmin = require('../lib/isAdmin');

async function deleteCommand(sock, chatId, message, senderId) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            return await sock.sendMessage(chatId, {
                text: '❌ I need admin rights to remove messages.'
            });
        }

        if (!isSenderAdmin) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ This command is reserved for group admins only.'
            });
        }

        const context = message.message?.extendedTextMessage?.contextInfo;
        const targetMessageId = context?.stanzaId;
        const targetUser = context?.participant;

        if (!targetMessageId || !targetUser) {
            return await sock.sendMessage(chatId, {
                text: '🔍 Please reply to the message you want to delete.'
            });
        }

        await sock.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                fromMe: false,
                id: targetMessageId,
                participant: targetUser
            }
        });

    } catch (error) {
        console.error('Delete command failed:', error);
        await sock.sendMessage(chatId, {
            text: '⚠️ Something went wrong while trying to delete the message.'
        });
    }
}

module.exports = deleteCommand;