const axios = require('axios');

module.exports = async function (sock, chatId) {
    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', {
            timeout: 5000 // optional: avoid long hangs
        });

        const fact = response.data.text;

        await sock.sendMessage(chatId, { 
            text: `🧠 *Random Fact:*\n\n${fact}` 
        });
    } catch (error) {
        console.error('Error fetching fact:', error);

        await sock.sendMessage(chatId, { 
            text: '❌ Sorry, I couldn\'t fetch a fact right now. Please try again later.' 
        });
    }
};