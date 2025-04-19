const { setAntiBadword, getAntiBadword, removeAntiBadword, incrementWarningCount, resetWarningCount } = require('../lib/index'); const fs = require('fs'); const path = require('path');

// Load antibadword config function loadAntibadwordConfig(groupId) { try { const configPath = path.join(__dirname, '../data/antibadword.json'); if (!fs.existsSync(configPath)) { return {}; } const data = JSON.parse(fs.readFileSync(configPath)); return data[groupId] || {}; } catch (error) { console.error('❌ Error loading antibadword config:', error.message); return {}; } }

async function handleAntiBadwordCommand(sock, chatId, message, match) { if (!match) { return sock.sendMessage(chatId, { text: *ANTIBADWORD SETUP*\n\n*.antibadword on*\nTurn on antibadword\n\n*.antibadword set <action>*\nSet action: delete/kick/warn\n\n*.antibadword off*\nDisables antibadword in this group }); }

if (match === 'on') {
    const existingConfig = await getAntiBadword(chatId, 'on');
    if (existingConfig?.enabled) {
        return sock.sendMessage(chatId, { text: '*AntiBadword is already enabled for this group*' });
    }
    await setAntiBadword(chatId, 'on', 'delete');
    return sock.sendMessage(chatId, { text: '*AntiBadword has been enabled. Use .antibadword set <action> to customize action*' });
}

if (match === 'off') {
    const config = await getAntiBadword(chatId, 'on');
    if (!config?.enabled) {
        return sock.sendMessage(chatId, { text: '*AntiBadword is already disabled for this group*' });
    }
    await removeAntiBadword(chatId);
    return sock.sendMessage(chatId, { text: '*AntiBadword has been disabled for this group*' });
}

if (match.startsWith('set')) {
    const action = match.split(' ')[1];
    if (!action || !['delete', 'kick', 'warn'].includes(action)) {
        return sock.sendMessage(chatId, { text: '*Invalid action. Choose: delete, kick, or warn*' });
    }
    await setAntiBadword(chatId, 'on', action);
    return sock.sendMessage(chatId, { text: `*AntiBadword action set to: ${action}*` });
}

return sock.sendMessage(chatId, { text: '*Invalid command. Use .antibadword to see usage*' });

}

async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) { const config = loadAntibadwordConfig(chatId); if (!config.enabled) return;

const badWords = [
    'gandu', 'madarchod', 'bhosdike', 'bsdk', 'fucker', 'bhosda', 'lauda', 'laude', 'betichod',
    'chutiya', 'maa ki chut', 'behenchod', 'tatto ke saudagar', 'machar ki jhant', 'randi',
    'boobs', 'tits', 'idiot', 'nigga', 'fuck', 'dick', 'bitch', 'bastard', 'asshole',
    'motherfucker', 'cunt', 'pussy', 'twat', 'slut', 'whore', 'cock', 'retard', 'skank',
    'suck', 'jerk', 'moron', 'douche', 'arse', 'weed', 'hash', 'porn', 'xxx',
    'anal', 'blowjob', 'cum', 'deepthroat', 'fap', 'orgasm', 'hentai', 'milf', 'gangbang',
    'tranny', 'fag', 'faggot', 'dyke', 'sissy', 'fairy', 'lesbo'
];

const cleanMessage = userMessage.toLowerCase().replace(/[^�-]+/g, " ").replace(/[^\w\s]/gi, ' ');
const messageWords = cleanMessage.split(' ');
const matched = badWords.some(word => messageWords.includes(word));

if (!matched) return;

const metadata = await sock.groupMetadata(chatId);
const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
const bot = metadata.participants.find(p => p.id === botId);
if (!bot?.admin) return;

const sender = metadata.participants.find(p => p.id === senderId);
if (sender?.admin) return;

const configAction = await getAntiBadword(chatId, 'on');

if (!configAction?.enabled) return;

try {
    await sock.sendMessage(chatId, { delete: message.key });
} catch (err) {
    console.error('Error deleting message:', err);
}

switch (configAction.action) {
    case 'delete':
        await sock.sendMessage(chatId, {
            text: `*@${senderId.split('@')[0]} bad words are not allowed here*`,
            mentions: [senderId]
        });
        break;

    case 'kick':
        try {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            await sock.sendMessage(chatId, {
                text: `*@${senderId.split('@')[0]} has been kicked for using bad words*`,
                mentions: [senderId]
            });
        } catch (error) {
            console.error('Error kicking user:', error);
        }
        break;

    case 'warn':
        const warningCount = await incrementWarningCount(chatId, senderId);
        if (warningCount >= 3) {
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await resetWarningCount(chatId, senderId);
                await sock.sendMessage(chatId, {
                    text: `*@${senderId.split('@')[0]} has been kicked after 3 warnings*`,
                    mentions: [senderId]
                });
            } catch (error) {
                console.error('Error kicking user after warnings:', error);
            }
        } else {
            await sock.sendMessage(chatId, {
                text: `*@${senderId.split('@')[0]} warning ${warningCount}/3 for using bad words*`,
                mentions: [senderId]
            });
        }
        break;
}

}

module.exports = { handleAntiBadwordCommand, handleBadwordDetection };

