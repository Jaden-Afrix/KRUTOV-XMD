const axios = require('axios');

module.exports = async function(sock, chatId) {
  try {
    const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c'; // Replace with your own NewsAPI key
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
    const articles = response.data.articles.slice(0, 5); // Limit to top 5
    
    let newsMessage = '*⚠️ KRUTOV-XMD NEWS INTEL: TOP HEADLINES UPLOADED FROM MAINFRAME*\n\n';
    articles.forEach((article, index) => {
      newsMessage += `*${index + 1}. ${article.title}*\n_${article.description || 'No description provided.'}_\n\n`;
    });
    
    newsMessage += '_End of transmission._';
    
    await sock.sendMessage(chatId, { text: newsMessage });
  } catch (error) {
    console.error('KRUTOV-XMD News Error:', error);
    await sock.sendMessage(chatId, {
      text: '*❌ SYSTEM ERROR:* _Unable to retrieve news intel at this moment. The mainframe may be offline._'
    });
  }
};