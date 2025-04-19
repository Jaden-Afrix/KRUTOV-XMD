const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');

async function stickerCommand(sock, msg, chatId) {
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMessage = quoted?.imageMessage || msg.message?.imageMessage;
    
    if (!imageMessage) {
      await sock.sendMessage(chatId, { text: '❌ Please send or reply to an image!' });
      return;
    }
    
    // Ensure temp folder exists
    const tempDir = path.resolve(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const timestamp = Date.now();
    const tempInput = path.join(tempDir, `input_${timestamp}.jpg`);
    const tempOutput = path.join(tempDir, `sticker_${timestamp}.webp`);
    
    const stream = await downloadContentFromMessage(imageMessage, 'image');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    fs.writeFileSync(tempInput, buffer);
    
    // Convert image to webp using ffmpeg
    await new Promise((resolve, reject) => {
      exec(`${ffmpeg} -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -vcodec libwebp -lossless 1 -qscale 100 -preset default -loop 0 -an -vsync 0 "${tempOutput}"`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await sock.sendMessage(chatId, {
      sticker: fs.readFileSync(tempOutput)
    });
    
    // Cleanup
    fs.unlinkSync(tempInput);
    fs.unlinkSync(tempOutput);
    
  } catch (error) {
    console.error('❌ Error in sticker command:', error);
    await sock.sendMessage(chatId, { text: 'Failed to convert image to sticker!' });
  }
}

module.exports = stickerCommand;