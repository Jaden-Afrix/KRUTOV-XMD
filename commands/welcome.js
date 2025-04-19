const { handleWelcome: runWelcomeFeature } = require('../lib/welcome');

async function welcomeCommand(client, groupId, msg, args) {
  // Ensure the command runs only in group chats
  if (!groupId.endsWith('@g.us')) {
    await client.sendMessage(groupId, { text: 'This feature works only in groups.' });
    return;
  }
  
  // Extract user input from message content
  const rawText = msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text || '';
  const input = rawText.split(' ').slice(1).join(' ');
  
  await runWelcomeFeature(client, groupId, msg, input);
}

module.exports = welcomeCommand;