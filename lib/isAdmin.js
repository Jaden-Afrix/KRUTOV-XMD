async function isAdmin(sock, chatId, senderId) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);

        // Normalize JIDs
        const normalizeJid = jid => jid.split(':')[0] + '@s.whatsapp.net';
        const botJidNormalized = normalizeJid(sock.user.id);
        const senderJidNormalized = normalizeJid(senderId);

        const participant = groupMetadata.participants.find(p => p.id === senderJidNormalized);
        const bot = groupMetadata.participants.find(p => p.id === botJidNormalized);

        console.log("Bot's Normalized ID:", botJidNormalized);
        console.log("Sender Normalized ID:", senderJidNormalized);
        console.log("Bot participant data:", bot);

        const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';
        const isSenderAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

        console.log("Is Bot Admin?", isBotAdmin);
        console.log("Is Sender Admin?", isSenderAdmin);

        return { isSenderAdmin, isBotAdmin };
    } catch (error) {
        console.error("Error in isAdmin:", error);
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

module.exports = isAdmin;