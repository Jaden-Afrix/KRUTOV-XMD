const axios = require('axios');

const fallbackJokes = [
    "I'm afraid for the calendar. Its days are numbered.",
    "Why don't skeletons fight each other? They don't have the guts.",
    "What do you call cheese that isn't yours? Nacho cheese.",
    "Why couldn't the bicycle stand up by itself? It was two-tired.",
    "I only know 25 letters of the alphabet. I don't know y.",
    "What did the janitor say when he jumped out of the closet? Supplies!",
    "How does a penguin build its house? Igloos it together.",
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
    "Why do bees have sticky hair? Because they use honeycombs.",
    "Why don't eggs tell jokes? They'd crack each other up.",
    "How do you organize a space party? You planet.",
    "Why did the golfer bring two pairs of pants? In case he got a hole in one.",
    "I used to play piano by ear, but now I use my hands.",
    "Why was the math book sad? It had too many problems.",
    "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    "Why can't you give Elsa a balloon? Because she will let it go.",
    "I used to be addicted to soap, but I'm clean now.",
    "Did you hear about the guy who invented Lifesavers? He made a mint!",
    "Why did the tomato turn red? Because it saw the salad dressing!",
    "How do cows stay up to date? They read the moos-paper.",
    "What do you call a factory that makes good products? A satisfactory.",
    "Why don't scientists trust atoms? Because they make up everything!",
    "How does a taco say grace? Lettuce pray.",
    "Why did the cookie go to the hospital? Because it felt crummy.",
    "I would avoid the sushi if I were you. It’s a little fishy.",
    "I'm reading a book about anti-gravity. It's impossible to put down!",
    "Why did the chicken go to the seance? To talk to the other side.",
    "I don't trust stairs. They're always up to something.",
    "Why did the coffee file a police report? It got mugged.",
    "Why don’t crabs give to charity? Because they’re shellfish.",
    "Why don’t oysters share their pearls? Because they’re shellfish too.",
    "Why did the man put his money in the blender? He wanted to make some liquid assets.",
    "Did you hear about the restaurant on the moon? Great food, no atmosphere.",
    "Why did the picture go to jail? Because it was framed.",
    "I couldn't figure out how to put my seatbelt on. Then it 'clicked'!",
    "Why was the broom late? It over-swept!",
    "What do you call fake spaghetti? An impasta!",
    "Why did the can crusher quit his job? Because it was soda pressing.",
    "What did one wall say to the other? I'll meet you at the corner.",
    "What do you call an elephant that doesn’t matter? An irrelephant.",
    "Why don’t skeletons ever go trick or treating? Because they have no body to go with.",
    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
    "Why did the banana go to the doctor? Because it wasn’t peeling well."
];

module.exports = async function (sock, chatId) {
    try {
        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' }
        });
        const joke = response.data?.joke;
        if (joke) {
            await sock.sendMessage(chatId, { text: joke });
        } else {
            throw new Error('No joke received');
        }
    } catch (error) {
        console.error('Error fetching joke:', error);
        // Use a random local joke
        const joke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        await sock.sendMessage(chatId, { text: `*KRUTOV-XMD fallback joke:*\n${joke}` });
    }
};