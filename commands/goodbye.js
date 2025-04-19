const { Boom } = require('@hapi/boom');

async function startBot(sock) {
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const groupId = update.id;
      const participant = update.participants[0];
      
      if (update.action !== 'remove') return;
      
      const message = '*GOODBYE FOOL WE AIN\'T GONNA MISS YOU*';
      
      await sock.sendMessage(groupId, {
        text: message,
        mentions: [participant]
      });
    } catch (err) {
      console.error('Goodbye handler error:', err);
    }
  });
}

module.exports = { startBot };