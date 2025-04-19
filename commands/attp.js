const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

async function createStickerFromText(sock, chatId, message) {
  const userInput = message.message.conversation || message.message.extendedTextMessage?.text || '';
  const stickerText = userInput.split(' ').slice(1).join(' ');
  
  if (!stickerText) {
    await sock.sendMessage(chatId, { text: 'Please provide text to create the sticker.' });
    return;
  }
  
  const imageWidth = 512;
  const imageHeight = 512;
  const tempStickerPath = path.join(__dirname, './temp', `sticker-${Date.now()}.png`);
  
  try {
    // Load font and create blank image
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const image = new Jimp(imageWidth, imageHeight, '#FFFFFF');
    
    // Measure text dimensions and position it in the center
    const textWidth = Jimp.measureText(font, stickerText);
    const textHeight = Jimp.measureTextHeight(font, stickerText, imageWidth);
    const xPos = (imageWidth - textWidth) / 2;
    const yPos = (imageHeight - textHeight) / 2;
    
    // Draw the text onto the image
    image.print(font, xPos, yPos, stickerText, imageWidth);
    await image.writeAsync(tempStickerPath);
    
    // Convert the image to a webp format sticker
    const stickerImageBuffer = await sharp(tempStickerPath)
      .resize(imageWidth, imageHeight, { fit: 'cover' })
      .webp()
      .toBuffer();
    
    // Send the generated sticker to the chat
    await sock.sendMessage(chatId, {
      sticker: stickerImageBuffer,
      mimetype: 'image/webp',
      packname: 'Sticker Pack',
      author: 'My Awesome Bot',
    });
    
    // Clean up by deleting the temporary image
    fs.unlinkSync(tempStickerPath);
  } catch (error) {
    console.error('Error generating sticker:', error);
    await sock.sendMessage(chatId, { text: 'Oops! Something went wrong while creating the sticker.' });
  }
}

module.exports = createStickerFromText;