const axios = require('axios');

async function memeCommand(sock, chatId) {
try {
const response = await axios.get('https://api.imgflip.com/get_memes');

if (response.data.success) {
const memes = response.data.data.memes;
const randomMeme = memes[Math.floor(Math.random() * memes.length)];

const caption = `*${randomMeme.name}*\n\n` +
`“Code hard, meme harder.” — *KRUTOV-XMD*\n\n` +
`_Powered by Jaden Afrix_`;

await sock.sendMessage(chatId, {
image: { url: randomMeme.url },
caption: caption
});
} else {
await sock.sendMessage(chatId, {
text: '❌ Failed to fetch memes. Meme matrix is offline!'
});
}
} catch (error) {
console.error('Error fetching meme:', error);
await sock.sendMessage(chatId, {
text: '❌ An error occurred while fetching a meme. Check your connection to the dark grid.'
});
}
}

module.exports = memeCommand;