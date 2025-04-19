const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

function initializeWarningsFile() {
    if (!fs.existsSync(databaseDir)) fs.mkdirSync(databaseDir, { recursive: true });
    if (!fs.existsSync(warningsPath)) fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
}

function loadWarnings() {
    try {
        return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    } catch {
        return {};
    }
}

function saveWarnings(warnings) {
    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
}

async function resetWarns(sock, chatId, senderId, mentionedJids, message) {
    try {
        initializeWarningsFile();

        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command only works in groups.' });
        }

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            return await sock.sendMessage(chatId, { text: '❌ Bot must be admin to perform this action.' });
        }

        if (!isSenderAdmin) {
            return await sock.sendMessage(chatId, { text: '❌ Only *group admins* can reset warnings.' });
        }

        let targetUser = mentionedJids?.[0] || message.message?.extendedTextMessage?.contextInfo?.participant;

        if (!targetUser) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please *mention* or *reply* to the user you want to reset warnings for.'
            });
        }

        const warnings = loadWarnings();
        if (warnings[chatId] && warnings[chatId][targetUser]) {
            delete warnings[chatId][targetUser];
            saveWarnings(warnings);

            return await sock.sendMessage(chatId, {
                text: `✅ Successfully *reset warnings* for @${targetUser.split('@')[0]}.`,
                mentions: [targetUser]
            });
        } else {
            return await sock.sendMessage(chatId, {
                text: `ℹ️ @${targetUser.split('@')[0]} has *no warnings* to reset.`,
                mentions: [targetUser]
            });
        }

    } catch (error) {
        console.error('Error in resetWarns:', error);
        return await sock.sendMessage(chatId, { text: '❌ Failed to reset warnings.' });
    }
}

module.exports = resetWarns;