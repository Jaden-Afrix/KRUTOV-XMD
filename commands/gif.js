const axios = require('axios');
const settings = require('../settings'); // Replace with your actual path

async function sendGif(sock, chatId, searchText) {
  const giphyKey = settings.giphyApiKey;
  
  if (!searchText) {
    await sock.sendMessage(chatId, { text: '🔎 Please enter something to search a GIF for!' });
    return;
  }
  
  try {
    const { data } = await axios.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key: giphyKey,
        q: searchText,
        limit: 1,
        rating: 'pg'
      }
    });
    
    const gif = data?.data?.[0]?.images?.downsized_medium?.url;
    
    if (gif) {
      await sock.sendMessage(chatId, {
        video: { url: gif },
        caption: `✨ Here's what I found for *${searchText}*`
      });
    } else {
      await sock.sendMessage(chatId, { text: `❌ No results found for *${searchText}*.` });
    }
  } catch (err) {
    console.error('GIF Fetch Error:', err);
    await sock.sendMessage(chatId, { text: '⚠️ Oops! Couldn’t fetch a GIF right now. Try later.' });
  }
}

module.exports = sendGif;