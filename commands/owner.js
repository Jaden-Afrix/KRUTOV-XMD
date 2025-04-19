const settings = require('../settings');

async function ownerCommand(sock, chatId) {
  const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:⛧ ${settings.botOwner} ⛧
ORG:KRUTOV-XMD Mainframe Network
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
NOTE:Creator of Chaos | System Architect | Hacker Division Lead
END:VCARD
`;
  
  await sock.sendMessage(chatId, {
    contacts: {
      displayName: `⛧ ${settings.botOwner} ⛧`,
      contacts: [{ vcard }]
    },
  });
}

module.exports = ownerCommand;