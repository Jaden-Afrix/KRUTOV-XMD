const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function stickerCommand(sock, chatId, message) {
    try {
        const quotedMsg = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            await sock.sendMessage(chatId, { text: '❗Please reply to an *image* or *video* to convert to sticker.' });
            return;
        }

        const type = Object.keys(quotedMsg)[0];
        if (!['imageMessage', 'videoMessage'].includes(type)) {
            await sock.sendMessage(chatId, { text: '❗Only image or video replies are supported.' });
            return;
        }

        const stream = await downloadContentFromMessage(quotedMsg[type], type.split('Message')[0]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const timestamp = Date.now();
        const tempInput = path.join(tempDir, `input_${timestamp}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`);
        const tempOutput = path.join(tempDir, `output_${timestamp}.webp`);

        fs.writeFileSync(tempInput, buffer);

        // FFmpeg command
        const cmd = type === 'imageMessage'
            ? `ffmpeg -i "${tempInput}" -vf "scale=320:320:force_original_aspect_ratio=decrease" -vframes 1 "${tempOutput}"`
            : `ffmpeg -i "${tempInput}" -vf "scale=320:320:force_original_aspect_ratio=decrease,fps=15" -c:v libwebp -loop 0 -t 6 -preset default "${tempOutput}"`;

        await new Promise((resolve, reject) => {
            exec(cmd, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        await sock.sendMessage(chatId, {
            sticker: fs.readFileSync(tempOutput),
            stickerMetadata: {
                author: "Jaden Afrix",
                pack: "Afrix Pack"
            }
        });

        // Clean up temp files
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);

    } catch (error) {
        console.error('Error in sticker command:', error);
        await sock.sendMessage(chatId, { text: '⚠️ Failed to create sticker. Try again later!' });
    }
}

module.exports = stickerCommand;