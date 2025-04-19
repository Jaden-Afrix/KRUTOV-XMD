const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Channel info for message context
const channelInfo = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363161513685998@newsletter',
      newsletterName: 'KnightBot MD',
      serverMessageId: -1
    }
  }
};

async function viewOnceCommand(sock, chatId, message) {
  try {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quoted) {
      await sock.sendMessage(chatId, {
        text: '❌ Please reply to a view once message!',
        ...channelInfo
      });
      return;
    }
    
    const imageMessage = quoted.viewOnceMessage?.message?.imageMessage || quoted.imageMessage;
    const videoMessage = quoted.viewOnceMessage?.message?.videoMessage || quoted.videoMessage;
    
    if (!imageMessage && !videoMessage) {
      await sock.sendMessage(chatId, {
        text: '❌ Could not detect view once image or video!',
        ...channelInfo
      });
      return;
    }
    
    if (imageMessage) {
      try {
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        
        const caption = imageMessage.caption || '';
        await sock.sendMessage(chatId, {
          image: buffer,
          caption: `*💀 KnightBot Anti ViewOnce 💀*\n\n*Type:* Image 📸\n${caption ? `*Caption:* ${caption}` : ''}`,
          ...channelInfo
        });
        return;
      } catch (err) {
        console.error('❌ Image Error:', err);
        await sock.sendMessage(chatId, {
          text: '❌ Failed to process view once image!',
          ...channelInfo
        });
        return;
      }
    }
    
    if (videoMessage) {
      const tempDir = path.join(__dirname, '../temp');
      const tempFile = path.join(tempDir, `temp_${Date.now()}.mp4`);
      
      try {
        fs.mkdirSync(tempDir, { recursive: true });
        
        const stream = await downloadContentFromMessage(videoMessage, 'video');
        const writeStream = fs.createWriteStream(tempFile);
        for await (const chunk of stream) writeStream.write(chunk);
        writeStream.end();
        
        await new Promise((resolve) => writeStream.on('finish', resolve));
        
        const caption = videoMessage.caption || '';
        await sock.sendMessage(chatId, {
          video: fs.readFileSync(tempFile),
          caption: `*💀 KnightBot Anti ViewOnce 💀*\n\n*Type:* Video 📹\n${caption ? `*Caption:* ${caption}` : ''}`,
          ...channelInfo
        });
        
        fs.unlinkSync(tempFile);
        return;
      } catch (err) {
        console.error('❌ Video Error:', err);
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        await sock.sendMessage(chatId, {
          text: '❌ Failed to process view once video!',
          ...channelInfo
        });
        return;
      }
    }
    
  } catch (error) {
    console.error('❌ General Error:', error);
    await sock.sendMessage(chatId, {
      text: '❌ An unexpected error occurred while processing the view once message!',
      ...channelInfo
    });
  }
}

module.exports = viewOnceCommand;