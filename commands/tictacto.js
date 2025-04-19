const TicTacToe = require('../lib/tictactoe');

// Store games globally
const games = {};

async function tictactoeCommand(sock, chatId, senderId, text) {
    try {
        // Check if player is already in a game
        if (Object.values(games).find(room => 
            room.id.startsWith('tictactoe') && 
            [room.game.playerX, room.game.playerO].includes(senderId)
        )) {
            await sock.sendMessage(chatId, { 
                text: '❌ You are still in a game. Type *surrender* to quit.' 
            });
            return;
        }

        // Look for existing waiting room
        let room = Object.values(games).find(room => 
            room.state === 'WAITING' && 
            (text ? room.name === text : true)
        );

        if (room) {
            // Join the room
            room.o = chatId;
            room.game.playerO = senderId;
            room.state = 'PLAYING';

            const board = room.game.render().map(v => ({
                'X': '❎', 'O': '⭕',
                '1': '1️⃣', '2': '2️⃣', '3': '3️⃣',
                '4': '4️⃣', '5': '5️⃣', '6': '6️⃣',
                '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
            }[v]));

            const msg = `
🎮 *TicTacToe Game Started!*

Waiting for @${room.game.currentTurn.split('@')[0]} to play...

${board.slice(0, 3).join('')}
${board.slice(3, 6).join('')}
${board.slice(6).join('')}

▢ *Room ID:* ${room.id}
▢ *Rules:*
• Make 3 in a row (vertical, horizontal, diagonal) to win
• Type a number (1-9) to play
• Type *surrender* to quit
`;

            await sock.sendMessage(chatId, {
                text: msg,
                mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO]
            });

        } else {
            // Create new game room
            room = {
                id: 'tictactoe-' + Date.now(),
                x: chatId,
                o: '',
                game: new TicTacToe(senderId, 'o'),
                state: 'WAITING'
            };

            if (text) room.name = text;

            await sock.sendMessage(chatId, {
                text: `⏳ *Waiting for opponent*\nType *.ttt ${text || ''}* to join!`
            });

            games[room.id] = room;
        }

    } catch (error) {
        console.error('TicTacToe Command Error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error starting game. Please try again.'
        });
    }
}

async function handleTicTacToeMove(sock, chatId, senderId, text) {
    try {
        const room = Object.values(games).find(room => 
            room.id.startsWith('tictactoe') &&
            [room.game.playerX, room.game.playerO].includes(senderId) &&
            room.state === 'PLAYING'
        );

        if (!room) return;

        const isSurrender = /^(surrender|give up)$/i.test(text);

        if (!isSurrender && !/^[1-9]$/.test(text)) return;

        if (senderId !== room.game.currentTurn) {
            if (!isSurrender) {
                await sock.sendMessage(chatId, { text: '❌ Not your turn!' });
                return;
            }
        }

        let ok = isSurrender ? true : room.game.turn(
            senderId === room.game.playerO,
            parseInt(text) - 1
        );

        if (!ok) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid move! That position is already taken.'
            });
            return;
        }

        let winner = room.game.winner;
        const isTie = room.game.turns === 9;

        const board = room.game.render().map(v => ({
            'X': '❎', 'O': '⭕',
            '1': '1️⃣', '2': '2️⃣', '3': '3️⃣',
            '4': '4️⃣', '5': '5️⃣', '6': '6️⃣',
            '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
        }[v]));

        if (isSurrender) {
            room.game._currentTurn = senderId === room.game.playerX;
            winner = room.game.currentTurn;
        }

        let gameStatus = '';
        if (winner) {
            gameStatus = isSurrender 
                ? `🏳️ @${winner.split('@')[0]} wins by surrender!`
                : `🎉 @${winner.split('@')[0]} wins the game!`;
        } else if (isTie) {
            gameStatus = '🤝 Game ended in a draw!';
        } else {
            gameStatus = `🎲 Turn: @${room.game.currentTurn.split('@')[0]} (${room.game.currentTurn === room.game.playerX ? '❎' : '⭕'})`;
        }

        const msg = `
🎮 *TicTacToe Game*

${gameStatus}

${board.slice(0, 3).join('')}
${board.slice(3, 6).join('')}
${board.slice(6).join('')}

▢ Player ❎: @${room.game.playerX.split('@')[0]}
▢ Player ⭕: @${room.game.playerO.split('@')[0]}

${!winner && !isTie ? '• Type a number (1-9) to play\n• Type *surrender* to quit' : ''}
`;

        const mentions = [
            room.game.playerX, 
            room.game.playerO,
            ...(winner ? [winner] : [room.game.currentTurn])
        ];

        await sock.sendMessage(room.x, {
            text: msg,
            mentions
        });

        if (room.o && room.x !== room.o) {
            await sock.sendMessage(room.o, {
                text: msg,
                mentions
            });
        }

        if (winner || isTie) {
            delete games[room.id];
        }

    } catch (error) {
        console.error('TicTacToe Move Error:', error);
    }
}

module.exports = {
    tictactoeCommand,
    handleTicTacToeMove
};