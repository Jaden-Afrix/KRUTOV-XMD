/**
 * takeCommand.js
 * Part of KRUTOV-XMD Bot
 * Developer: Jaden Afrix
 * GitHub: https://github.com/Jaden-Afrix/KRUTOV-XMD
 * Sticker Publisher remains: 'Bot'
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function takeCommand(sock, chatId, message, args) {
  try {
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMessage?.stickerMessage) {
      await sock.sendMessage(chatId, { text: '❌ Reply to a sticker with .take <packname>' });
      return;
    }
    
    const packname = args.join(' ') || 'KRUTOV-XMD';
    const author = 'Bot'; // Do not change as per your request
    
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    const stickerBuffer = await downloadMediaMessage(
      {
        key: message.message.extendedTextMessage.contextInfo.stanzaId,
        message: quotedMessage,
        messageType: quotedMessage.stickerMessage ? 'stickerMessage' : 'imageMessage'
      },
      'buffer', {},
      {
        logger: console,
        reuploadRequest: sock.updateMediaMessage
      }
    );
    
    if (!stickerBuffer) {
      await sock.sendMessage(chatId, { text: '❌ Failed to download sticker' });
      return;
    }
    
    const webpBuffer = await sharp(stickerBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp()
      .toBuffer();
    
    const img = new webp.Image();
    await img.load(webpBuffer);
    
    const json = {
      'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
      'sticker-pack-name': packname,
      'sticker-pack-publisher': author,
      'emojis': ['🤖']
    };
    
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    
    img.exif = exif;
    
    const finalBuffer = await img.save(null);
    
    await sock.sendMessage(chatId, {
      sticker: finalBuffer
    });
    
  } catch (error) {
    console.error('Error in take command:', error);
    await sock.sendMessage(chatId, { text: '❌ Error processing command' });
  }
}

module.exports = takeCommand;