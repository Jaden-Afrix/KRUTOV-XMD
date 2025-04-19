const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const sharp = require('sharp');

async function blurCommand(sock, chatId, message, quotedMessage) {
    try {
        let imageBuffer;

        if (quotedMessage) {
            if (!quotedMessage.imageMessage) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please reply to an image message' 
                });
                return;
            }

            const quoted = {
                message: {
                    imageMessage: quotedMessage.imageMessage
                }
            };

            imageBuffer = await downloadMediaMessage(quoted, 'buffer', {}, {});
        } else if (message.message?.imageMessage) {
            imageBuffer = await downloadMediaMessage(message, 'buffer', {}, {});
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Please reply to an image or send an image with caption .blur' 
            });
            return;
        }

        const resizedImage = await sharp(imageBuffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        const blurredImage = await sharp(resizedImage)
            .blur(10)
            .toBuffer();

        await sock.sendMessage(chatId, {
            image: blurredImage,
            caption: '*[ ✔ ] Image Blurred Successfully by KRUTOV-XMD*',
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'KRUTOV-XMD by Jaden Afrix',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        console.error('Error in blur command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to blur image. Please try again later.' 
        });
    }
}

module.exports = blurCommand;