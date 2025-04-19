const dares = [
    "Perform your best dance move and share a clip!",
    "Drop down and give us 10 push-ups!",
    "Speak in a cartoon voice for 5 whole minutes.",
    "Snap a silly selfie and send it here.",
    "Let the group send one text from your phone (no peeking!)."
];

async function dareCommand(sock, chatId) {
    try {
        const chosenDare = dares[Math.floor(Math.random() * dares.length)];
        await sock.sendMessage(chatId, { text: `🎯 *Dare of the Moment:*\n\n${chosenDare}` });
    } catch (err) {
        console.error("Error sending dare:", err);
        await sock.sendMessage(chatId, { text: "Oops! Couldn't deliver a dare this time." });
    }
}

module.exports = { dareCommand };