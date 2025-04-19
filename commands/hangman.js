const fs = require('fs');

const words = ['javascript', 'bot', 'hangman', 'whatsapp', 'nodejs'];
let hangmanGames = {};

const HANGMAN_EMOJIS = ['😐', '😕', '🙁', '☹️', '😣', '😖', '💀'];

function startHangman(sock, chatId) {
    const word = words[Math.floor(Math.random() * words.length)];
    const maskedWord = '_ '.repeat(word.length).trim();

    hangmanGames[chatId] = {
        word,
        maskedWord: maskedWord.split(' '),
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
    };

    sock.sendMessage(chatId, { text: `🎮 *Hangman Started!*\nGuess the word:\n${maskedWord}` });
}

function guessLetter(sock, chatId, letter) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { text: '⚠️ No game in progress. Start a new game with *.hangman*' });
        return;
    }

    letter = letter.toLowerCase();
    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;

    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, { text: `🔁 You already guessed "*${letter}*". Try a different one.` });
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) maskedWord[i] = letter;
        }

        sock.sendMessage(chatId, { text: `✅ Good guess!\n${maskedWord.join(' ')}` });

        if (!maskedWord.includes('_')) {
            sock.sendMessage(chatId, { text: `🎉 *You won!* The word was: *${word}*` });
            delete hangmanGames[chatId];
        }
    } else {
        game.wrongGuesses++;
        const triesLeft = maxWrongGuesses - game.wrongGuesses;
        sock.sendMessage(chatId, { 
            text: `❌ Wrong guess! Tries left: *${triesLeft}*\n${HANGMAN_EMOJIS[game.wrongGuesses]}` 
        });

        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, { 
                text: `💀 *Game Over!*\nThe word was: *${word}*` 
            });
            delete hangmanGames[chatId];
        }
    }
}

module.exports = { startHangman, guessLetter };