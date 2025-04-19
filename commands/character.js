const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function analyzeCharacter(sock, chatId, msg) {
    let target = null;

    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const replied = msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (mentions.length > 0) {
        target = mentions[0];
    } else if (replied) {
        target = replied;
    }

    if (!target) {
        return await sock.sendMessage(chatId, {
            text: 'You need to tag someone or reply to their message to analyze them!',
            ...channelInfo
        });
    }

    try {
        let avatar;
        try {
            avatar = await sock.profilePictureUrl(target, 'image');
        } catch {
            avatar = 'https://i.imgur.com/2wzGhpF.jpeg'; // fallback image
        }

        const personalityPool = [
            'Bold', 'Sharp-minded', 'Inventive', 'Kind-hearted', 'Observant',
            'Persuasive', 'Clever', 'Warm', 'Balanced', 'Driven',
            'Adaptable', 'Reliable', 'Witty', 'Calm', 'Cheerful',
            'Genuine', 'Focused', 'Spontaneous', 'Respectful', 'Curious',
            'Hardworking', 'Strategic', 'Nurturing', 'Realistic', 'Insightful'
        ];

        const picked = [];
        while (picked.length < 3 + Math.floor(Math.random() * 3)) {
            const trait = personalityPool[Math.floor(Math.random() * personalityPool.length)];
            if (!picked.includes(trait)) picked.push(trait);
        }

        const analysisLines = picked.map(trait => {
            const score = 60 + Math.floor(Math.random() * 41);
            return `• ${trait}: ${score}%`;
        });

        const finalMessage = `🧠 *Personality Snapshot*\n\n` +
            `👤 Username: @${target.split('@')[0]}\n\n` +
            `Traits Detected:\n${analysisLines.join('\n')}\n\n` +
            `⭐ Overall Personality Strength: ${80 + Math.floor(Math.random() * 21)}%\n\n` +
            `*Disclaimer:* This result is just for fun and shouldn't be taken seriously.`;

        await sock.sendMessage(chatId, {
            image: { url: avatar },
            caption: finalMessage,
            mentions: [target],
            ...channelInfo
        });

    } catch (err) {
        console.error('Character analysis error:', err);
        await sock.sendMessage(chatId, {
            text: 'Oops! Something went wrong analyzing that user.',
            ...channelInfo
        });
    }
}

module.exports = analyzeCharacter;