const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

async function ttsCommand(sock, chatId, text, language = 'en') {
  if (!text) {
    await sock.sendMessage(chatId, { text: 'Please provide the text for TTS conversion.' });
    return;
  }
  
  if (text.length > 200) {
    await sock.sendMessage(chatId, { text: 'Text too long. Please limit to 200 characters.' });
    return;
  }
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
  
  const fileName = `tts-${Date.now()}.mp3`;
  const filePath = path.join(assetsDir, fileName);
  
  const gtts = new gTTS(text, language);
  gtts.save(filePath, async function(err) {
    if (err) {
      await sock.sendMessage(chatId, { text: 'Error generating TTS audio.' });
      return;
    }
    
    await sock.sendMessage(chatId, {
      audio: { url: filePath },
      mimetype: 'audio/mpeg'
    });
    
    fs.unlinkSync(filePath);
  });
}

module.exports = ttsCommand;