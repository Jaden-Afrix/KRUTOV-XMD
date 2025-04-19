/**
 * Sticker generation module for KRUTOV-XMD
 * Developed by Jaden Afrix
 * GitHub: https://github.com/Jaden-Afrix/KRUTOV-XMD
 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function stickerCommand(sock, chatId, message) {
  let mediaMessage;
  
  if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    const quoted = message.message.extendedTextMessage.contextInfo.quotedMessage;
    mediaMessage = quoted.imageMessage || quoted.videoMessage || quoted.documentMessage;
    message = { message: quoted };
  } else {
    mediaMessage = message.message?.imageMessage || message.message?.videoMessage || message.message?.documentMessage;
  }
  
  if (!mediaMessage) {
    await sock.sendMessage(chatId, {
      text: 'Reply to an image, video, or GIF to convert it into a sticker.',
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363161513685998@newsletter',
          newsletterName: 'KRUTOV-XMD',
          serverMessageId: -1
        }
      }
    });
    return;
  }
  
  try {
    const mediaBuffer = await downloadMediaMessage(message, 'buffer', {}, {
      logger: undefined,
      reuploadRequest: sock.updateMediaMessage
    });
    
    if (!mediaBuffer) {
      await sock.sendMessage(chatId, {
        text: 'Could not download media. Please try again.',
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'KRUTOV-XMD',
            serverMessageId: -1
          }
        }
      });
      return;
    }
    
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    
    const tempInput = path.join(tmpDir, `temp_${Date.now()}`);
    const tempOutput = path.join(tmpDir, `sticker_${Date.now()}.webp`);
    
    fs.writeFileSync(tempInput, mediaBuffer);
    
    const isAnimated = mediaMessage.mimetype?.includes('gif') || mediaMessage.seconds > 0;
    
    const ffmpegCmd = isAnimated ?
      `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"` :
      `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;
    
    await new Promise((resolve, reject) => {
      exec(ffmpegCmd, (err) => err ? reject(err) : resolve());
    });
    
    const webpBuffer = fs.readFileSync(tempOutput);
    const img = new webp.Image();
    await img.load(webpBuffer);
    
    const json = {
      'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
      'sticker-pack-name': settings.packname || 'KRUTOV-XMD',
      'sticker-pack-publisher': settings.author || '@bot',
      'emojis': ['🤖']
    };
    
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2A, 0x00, 0x08, 0x00,
      0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x16, 0x00, 0x00, 0x00
    ]);
    
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    
    img.exif = exif;
    const finalSticker = await img.save(null);
    
    await sock.sendMessage(chatId, { sticker: finalSticker });
    
    fs.unlinkSync(tempInput);
    fs.unlinkSync(tempOutput);
    
  } catch (err) {
    console.error('Sticker creation error:', err);
    await sock.sendMessage(chatId, {
      text: 'Sticker creation failed. Try again later.',
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363161513685998@newsletter',
          newsletterName: 'KRUTOV-XMD',
          serverMessageId: -1
        }
      }
    });
  }
}

module.exports = stickerCommand;