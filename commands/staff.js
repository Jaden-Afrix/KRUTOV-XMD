async function staffCommand(sock, chatId, msg) {
  try {
    const groupMetadata = await sock.groupMetadata(chatId);
    
    let pp;
    try {
      pp = await sock.profilePictureUrl(chatId, 'image');
    } catch {
      pp = 'https://i.imgur.com/2wzGhpF.jpeg';
    }
    
    const participants = groupMetadata.participants;
    const groupAdmins = participants.filter(p => p.admin);
    const listAdmin = groupAdmins.map((v, i) => `*${i + 1}.* @${v.id.split('@')[0]}`).join('\n');
    
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';
    
    const text = `
╭───「 *GROUP STAFF* 」
│ *Group:* ${groupMetadata.subject}
│ *Owner:* @${owner.split('@')[0]}
│
├───「 *ADMINS* 」
${listAdmin || 'No admins found.'}
╰───────────────
`.trim();
    
    await sock.sendMessage(chatId, {
      image: { url: pp },
      caption: text,
      mentions: [...groupAdmins.map(v => v.id), owner]
    });
    
  } catch (error) {
    console.error('Error in staff command:', error);
    await sock.sendMessage(chatId, { text: '❌ Failed to fetch admin list!' });
  }
}

module.exports = staffCommand;