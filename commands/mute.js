const isAdmin = require('../lib/isAdmin');

async function muteCommand(sock, chatId, senderId, durationInMinutes) {
  console.log(`KRUTOV-XMD: Attempting to mute group ${chatId} for ${durationInMinutes} minutes.`);
  
  const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
  
  if (!isBotAdmin) {
    await sock.sendMessage(chatId, {
      text: '*❌ BOT FAILURE:* _KRUTOV-XMD requires admin rights to execute lockdown._'
    });
    return;
  }
  
  if (!isSenderAdmin) {
    await sock.sendMessage(chatId, {
      text: '*❌ ACCESS DENIED:* _Only group overlords (admins) can launch mute protocol._'
    });
    return;
  }
  
  const durationInMilliseconds = durationInMinutes * 60 * 1000;
  
  try {
    await sock.groupSettingUpdate(chatId, 'announcement'); // Mute group
    await sock.sendMessage(chatId, {
      text: `*🔒 SYSTEM LOCKDOWN INITIATED:*\n_This group has been muted for ${durationInMinutes} minute(s)._`
    });
    
    setTimeout(async () => {
      await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute
      await sock.sendMessage(chatId, {
        text: '*🔓 SYSTEM UNLOCKED:*\n_The group has been unmuted. KRUTOV-XMD has completed the operation._'
      });
    }, durationInMilliseconds);
  } catch (error) {
    console.error('KRUTOV-XMD MUTE ERROR:', error);
    await sock.sendMessage(chatId, {
      text: '*❌ ERROR:* _Something went wrong while muting/unmuting the group. Try again or debug the matrix._'
    });
  }
}

module.exports = muteCommand;