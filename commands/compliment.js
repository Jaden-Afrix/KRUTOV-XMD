const compliments = [
  "You radiate positivity!",
  "You're a beacon of light to those around you.",
  "You're the definition of awesome!",
  "You have a magnetic personality!",
  "Your kindness is your superpower.",
  "You make ordinary moments extraordinary.",
  "You're full of good vibes!",
  "You bring magic to the mundane.",
  "You're wiser than your years.",
  "The world is better with you in it.",
  "You're someone people genuinely admire.",
  "Your energy uplifts everyone.",
  "You're deeply appreciated and valued.",
  "You turn dreams into reality!",
  "Your presence is a gift.",
  "You're a true original.",
  "You make everything feel possible.",
  "You're unforgettable in the best way.",
  "You're a rare and special soul.",
  "You add color to everyone's life."
];

async function sendCompliment(sock, chatId, msg) {
  try {
    if (!msg || !chatId) return;
    
    let targetUser;
    
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    
    if (ctx?.mentionedJid?.length > 0) {
      targetUser = ctx.mentionedJid[0];
    } else if (ctx?.participant) {
      targetUser = ctx.participant;
    }
    
    if (!targetUser) {
      await sock.sendMessage(chatId, {
        text: 'Tag someone or reply to their message to send them a compliment!'
      });
      return;
    }
    
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    const name = targetUser.split('@')[0];
    
    // Pause for a moment to avoid spam detection
    await new Promise(res => setTimeout(res, 1000));
    
    await sock.sendMessage(chatId, {
      text: `@${name}, ${randomCompliment}`,
      mentions: [targetUser]
    });
    
  } catch (err) {
    console.error('Compliment command failed:', err);
    
    let fallbackMsg = 'Oops! Something went wrong while spreading positivity.';
    
    if (err?.data === 429) {
      fallbackMsg = 'You’re moving too fast! Give it a moment and try again.';
    }
    
    await sock.sendMessage(chatId, { text: fallbackMsg });
  }
}

module.exports = { sendCompliment };