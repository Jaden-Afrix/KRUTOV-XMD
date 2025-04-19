const pickupLines = [
  "Are you a magician? Because whenever I look at you, everyone else disappears.",
  "Do you have a map? I keep getting lost in your eyes.",
  "Is your name Google? Because you have everything I'm searching for.",
  "Do you believe in love at first sight, or should I walk by again?",
  "If you were a vegetable, you'd be a cute-cumber!",
  "Are you a parking ticket? Because you've got FINE written all over you.",
  "Is your dad a baker? Because you're a cutie pie!",
  "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
  "If beauty were time, you'd be an eternity.",
  "Are you Wi-Fi? Because I'm really feeling a connection.",
  "Are you French? Because Eiffel for you.",
  "Can you lend me a kiss? I promise to return it.",
  "Do you believe in fate? Because I think we just met ours.",
  "Are you a campfire? Because you're hot and I want s'more.",
  "If I could rearrange the alphabet, I’d put U and I together.",
  "Are you a snowstorm? Because my heart’s racing.",
  "Is your name Chapstick? Because you're da balm!",
  "Hey, you dropped something... my jaw.",
  "Are you a time traveler? Because I see us together in the future.",
  "Your hand looks heavy. Want me to hold it for you?",
  "Are you a bank loan? Because you’ve got my interest.",
  "Are you sunburnt or always this hot?",
  "Are you an angel? Heaven must be missing one.",
  "You must be made of copper and tellurium — because you're Cu-Te.",
  "Been running through my mind all day? You must be tired.",
  "Do you have a mirror in your pocket? I see myself with you.",
  "You're like aged wine — I can’t stop staring.",
  "Let’s take a picture. I need proof angels exist.",
  "Did it hurt? You know... falling from heaven?",
  "Are you a camera? You make me smile every time.",
  "Are you my perfect parking spot? I’ve been searching forever.",
  "Is your dad an artist? Because you're a masterpiece.",
  "You’ve been in my dreams all night. Must be exhausted.",
  "Are you a light bulb? Because you light up my life.",
  "I must be a snowflake — I’ve fallen for you.",
  "You're sweet enough to give me a sugar rush.",
  "What's your name? Or can I call you mine?",
  "You're like gravity... pulling me in."
];

async function flirtCommand(sock, chatId) {
  const chosenLine = pickupLines[Math.floor(Math.random() * pickupLines.length)];
  await sock.sendMessage(chatId, { text: chosenLine });
}

module.exports = { flirtCommand };