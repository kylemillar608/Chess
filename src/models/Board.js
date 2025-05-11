import Rules from '../chess/Rules.js';
import Format from '../chess/Format.js';

class Board {
    constructor() {
        this.reset();
    }

    // Create a deep copy of the board
    copy() {
        const newBoard = new Board();
        
        // Copy state using map
        newBoard.state = this.state.map(row => 
            row.map(piece => piece ? {...piece} : null)
        );
        newBoard.gameIsStarted = this.gameIsStarted;

        newBoard.currentTurn = this.currentTurn;
        newBoard.lastMove = this.lastMove ? structuredClone(this.lastMove) : null;
        
        // Copy the rules reference
        newBoard.rules = this.rules;
        
        return newBoard;
    }

    reset() {
        this.state = this.createInitialState();
        this.gameIsStarted = false;

        this.currentTurn = 'white';
        this.lastMove = null;

        // Use Rules instead of MoveValidator
        this.rules = new Rules();
    }

    // setup board
    createInitialState() {
        const board = new Array(8).fill(null).map(() => new Array(8).fill(null));
        
        // Initialize back rank pieces order
        const backRankPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        // Set up black pieces
        backRankPieces.forEach((piece, col) => {
            board[0][col] = { type: piece, color: 'black', has_moved: false };
            board[1][col] = { type: 'pawn', color: 'black', has_moved: false };
        });

        // Set up white pieces
        backRankPieces.forEach((piece, col) => {
            board[7][col] = { type: piece, color: 'white', has_moved: false };
            board[6][col] = { type: 'pawn', color: 'white', has_moved: false };
        });

        return board;
    }

    getValidMoves(fromSquare) {
        return this.rules.getValidMoves(this, fromSquare, this.lastMove);
    }

    // Helper for move piece to encapsulate movement logic w/o validation. Returns all updated squares.
    movePieceWithoutValidation(move) {
        const lastMove = this.lastMove;
        let updatedSquares = this.makeMove(move);

        // handle special moves
        if (this.rules.isCastlingMove(move)) {
            // Kingside castle
            if (move.toSquare.col > move.fromSquare.col) {
                const fromSquare = {
                    row: move.fromSquare.row,
                    col: 7
                }
                const toSquare = {
                    row: move.fromSquare.row,
                    col: 5
                }
                const rook = this.getPiece(fromSquare);
                const rookMoveSquares = this.makeMove({
                    fromSquare,
                    toSquare,
                    piece: rook
                }, false);
                updatedSquares = [...updatedSquares, ...rookMoveSquares];
            }
            // Queenside castle
            else {
                const fromSquare = {
                    row: move.fromSquare.row,
                    col: 0
                }
                const toSquare = {
                    row: move.fromSquare.row,
                    col: 3
                }
                const rook = this.getPiece(fromSquare);
                const rookMoveSquares = this.makeMove({
                    fromSquare,
                    toSquare,
                    piece: rook
                }, false);
                updatedSquares.push();
                updatedSquares = [...updatedSquares, ...rookMoveSquares];
            }
        }
        // made a copy of last move prior to taking the en passant
        if (this.rules.isEnPassant(move, lastMove)) {
            // The captured pawn is on the same row as the moving pawn's start, and the column of the destination
            const capturedPawnSquare = { row: move.fromSquare.row, col: move.toSquare.col };
            console.log('cap pawn - ', JSON.stringify(capturedPawnSquare))
            updatedSquares.push(this.clearSquare(capturedPawnSquare));
        }

        // Switch turns
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        return updatedSquares;
    }

    movePiece(fromSquare, toSquare) {
        const piece = this.getPiece(fromSquare);
        if (!piece || piece.color !== this.currentTurn) return [];

        console.log('validating move..')

        if (!this.rules.isValidMove(this, fromSquare, toSquare)) {
            console.log('is not valid')
            return [];
        }

        return this.movePieceWithoutValidation({
            fromSquare,
            toSquare,
            piece: piece,
        });
    }

    makeMove(move, updateLastMove = true) {
        this.state[move.toSquare.row][move.toSquare.col] = move.piece;
        this.clearSquare(move.fromSquare);
        if(move.piece.type === 'king')
            console.log('moving king - ', JSON.stringify(move))
        move.piece.has_moved = true;
        
        // kind of a hack to skip history for rook move during castle
        // would be better to store last moves in a more robust way
        if(updateLastMove) {
            this.lastMove = move;
        }
        return [move.fromSquare, move.toSquare];
    }

    clearSquare(square) {
        this.state[square.row][square.col] = null;
        return square;
    }

    capturePiece(square) {
        this.state[square.row][square.col] = null;
    }

    getKingSquare(color) {
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                if(this.getPiece({row, col})?.type === 'king' && this.getPiece({row, col})?.color === color) {
                    return { row, col };
                }
            }
        }
    }

    getCurrentPosition() {
        let position = '';
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const piece = this.getPiece({row, col});
                if(piece) {
                    position += Format.getPieceFENChar(piece);
                } else {
                    position += '-';
                }
            }
            position += '\n';
        }
        return position;
    }

    getPiece(square) {
        if (!square) return undefined;
        return this.state[square.row][square.col];
    }

    getCurrentTurn() {
        return this.currentTurn;
    }

    startGame() {
        this.gameIsStarted = true;
    }

    isGameStarted() {
        return this.gameIsStarted;
    }

    setStrictValidation(enabled) {
        // Use this.rules instead of this.moveValidator
        this.rules.setStrictMoveValidation(enabled);
    }
}

export default Board; 