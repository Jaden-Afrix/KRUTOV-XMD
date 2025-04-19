class XOGame {
    constructor(symbolX = 'x', symbolO = 'o') {
        this.symbolX = symbolX;
        this.symbolO = symbolO;
        this._xMoves = 0;
        this._oMoves = 0;
        this._step = 0;
        this._isOTurn = false;
    }

    get combinedBoard() {
        return this._xMoves | this._oMoves;
    }

    get activePlayer() {
        return this._isOTurn ? this.symbolO : this.symbolX;
    }

    get gameWinner() {
        const winCombos = [
            0b111000000, 0b000111000, 0b000000111, // Rows
            0b100100100, 0b010010010, 0b001001001, // Columns
            0b100010001, 0b001010100              // Diagonals
        ];

        for (let combo of winCombos) {
            if ((this._xMoves & combo) === combo) return this.symbolX;
            if ((this._oMoves & combo) === combo) return this.symbolO;
        }

        return null;
    }

    playMove(player, position) {
        if (this.gameWinner || position < 0 || position > 8) return -1;
        if ((this._xMoves | this._oMoves) & (1 << position)) return 0;

        const move = 1 << position;
        this._isOTurn ? this._oMoves |= move : this._xMoves |= move;

        this._isOTurn = !this._isOTurn;
        this._step++;
        return 1;
    }

    displayBoard() {
        return Array.from({ length: 9 }, (_, i) => {
            const cell = 1 << i;
            return this._xMoves & cell ? 'X' : this._oMoves & cell ? 'O' : (i + 1).toString();
        });
    }
}

module.exports = XOGame;