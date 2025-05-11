class Format {
    // Convert board coordinates to UCI notation (e.g., [6,4] -> "e2")
    static coordsToUCI(row, col) {
        const file = String.fromCharCode('a'.charCodeAt(0) + col);
        const rank = 8 - row;
        return `${file}${rank}`;
    }

    // todo - move to format class
    // Convert UCI notation to board coordinates (e.g., "e2" -> [6,4])
    static UCIToCoords(uciSquare) {
        const file = uciSquare.charAt(0);
        const rank = uciSquare.charAt(1);
        const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - parseInt(rank);
        return [row, col];
    }

    // todo - remove? may be needed for lichess?
    // Make a move using UCI notation (e.g., "e2e4")
    // static makeUCIMove(uciMove) {
    //     const fromSquare = uciMove.substring(0, 2);
    //     const toSquare = uciMove.substring(2, 4);
    //     const [fromRow, fromCol] = Format.UCIToCoords(fromSquare);
    //     const [toRow, toCol] = Format.UCIToCoords(toSquare);
        
    //     return this.movePiece(fromRow, fromCol, toRow, toCol);
    // }

    // todo - remove?
    // Get move in UCI format
    static getMoveUCI(fromRow, fromCol, toRow, toCol) {
        const fromSquare = Format.coordsToUCI(fromRow, fromCol);
        const toSquare = Format.coordsToUCI(toRow, toCol);
        return `${fromSquare}${toSquare}`;
    }

    static getFEN(board) {
        let fen = '';
        
        // Piece placement
        for (let row = 0; row < 8; row++) {
            let emptySquares = 0;
            for (let col = 0; col < 8; col++) {
                const piece = board.getPiece({row, col});
                if (piece) {
                    if (emptySquares > 0) {
                        fen += emptySquares;
                        emptySquares = 0;
                    }
                    const pieceChar = Format.getPieceFENChar(piece);
                    fen += pieceChar;
                } else {
                    emptySquares++;
                }
            }
            if (emptySquares > 0) {
                fen += emptySquares;
            }
            if (row < 7) fen += '/';
        }

        // Active color
        fen += ` ${board.getCurrentTurn().charAt(0)}`;

        // Castling availability
        let castling = '';
        // White kingside
        if (!board.getPiece({row: 7, col: 4})?.has_moved && !board.getPiece({row: 7, col: 7})?.has_moved) castling += 'K';
        // White queenside
        if (!board.getPiece({row: 7, col: 4})?.has_moved && !board.getPiece({row: 7, col: 0})?.has_moved) castling += 'Q';
        // Black kingside
        if (!board.getPiece({row: 0, col: 4})?.has_moved && !board.getPiece({row: 0, col: 7})?.has_moved) castling += 'k';
        // Black queenside
        if (!board.getPiece({row: 0, col: 4})?.has_moved && !board.getPiece({row: 0, col: 0})?.has_moved) castling += 'q';
        
        fen += ` ${castling || '-'}`;

        // En passant target square (simplified)
        fen += ' -';

        // Halfmove clock and fullmove number (simplified)
        fen += ' 0 1';

        return fen;
    }

    static getPieceFENChar(piece) {
        const chars = {
            king: 'k',
            queen: 'q',
            rook: 'r',
            bishop: 'b',
            knight: 'n',
            pawn: 'p'
        };
        const char = chars[piece.type];
        return piece.color === 'white' ? char.toUpperCase() : char;
    }
}

export default Format;
