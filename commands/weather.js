const axios = require('axios');

module.exports = async function(sock, chatId, city) {
  try {
    if (!city) {
      await sock.sendMessage(chatId, { text: '❌ Please specify a city to check the weather.' });
      return;
    }
    
    const apiKey = '4902c0f2550f58298ad4146a92b65e10'; // Replace with your API key
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric'
      }
    });
    
    const weather = response.data;
    const description = weather.weather[0].description
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const weatherText = `🌤️ *Weather in ${weather.name}*\n\n` +
      `📍 Description: ${description}\n` +
      `🌡️ Temperature: ${weather.main.temp}°C (Feels like ${weather.main.feels_like}°C)\n` +
      `💧 Humidity: ${weather.main.humidity}%\n` +
      `🌬️ Wind Speed: ${weather.wind.speed} m/s`;
    
    await sock.sendMessage(chatId, { text: weatherText });
    
  } catch (error) {
    console.error('Error fetching weather:', error);
    await sock.sendMessage(chatId, {
      text: '❌ Sorry, I couldn’t fetch the weather. Please check the city name and try again.'
    });
  }
};