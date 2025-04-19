const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

async function emojimixCommand(sock, chatId, msg) {
  try {
    const text = msg.message?.conversation?.trim() ||
      msg.message?.extendedTextMessage?.text?.trim() || '';
    
    const args = text.split(' ').slice(1);
    
    if (!args[0]) {
      await sock.sendMessage(chatId, { text: '🎴 Example: .emojimix 😎+🥰' });
      return;
    }
    
    if (!text.includes('+')) {
      await sock.sendMessage(chatId, {
        text: '✳️ Separate the emojis with a *+* sign.\n\nExample: *.emojimix 😎+🥰*'
      });
      return;
    }
    
    let [emoji1, emoji2] = args[0].split('+').map(e => e.trim());
    
    const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0 || !data.results[0].media_formats?.png_transparent?.url) {
      await sock.sendMessage(chatId, {
        text: '❌ These emojis cannot be mixed! Try different ones.'
      });
      return;
    }
    
    const imageUrl = data.results[0].media_formats.png_transparent.url;
    
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    
    const tempFile = path.join(tmpDir, `temp_${Date.now()}.png`).replace(/\\/g, '/');
    const outputFile = path.join(tmpDir, `sticker_${Date.now()}.webp`).replace(/\\/g, '/');
    
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.buffer();
    fs.writeFileSync(tempFile, buffer);
    
    const ffmpegCommand = `ffmpeg -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}"`;
    
    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    
    if (!fs.existsSync(outputFile)) throw new Error('Sticker conversion failed.');
    
    const stickerBuffer = fs.readFileSync(outputFile);
    await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
    
    // Optional confirmation
    await sock.sendMessage(chatId, {
      text: `✨ Here's your mix: ${emoji1}+${emoji2}`,
      quoted: msg
    });
    
    fs.unlink(tempFile, () => {});
    fs.unlink(outputFile, () => {});
    
  } catch (error) {
    console.error('EmojiMix Error:', error);
    await sock.sendMessage(chatId, {
      text: '❌ Emoji mix failed. Make sure to use valid emojis like:\n.emojimix 😎+🥰'
    });
  }
}

module.exports = emojimixCommand;