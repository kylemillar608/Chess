import Format from '../chess/Format.js';

class Rules {
    constructor() {
        this.strictMoveValidation = false;
    }

    setStrictMoveValidation(enabled) {
        this.strictMoveValidation = enabled;
    }

    allMovesValid(piece, fromSquare) {
        const validMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                validMoves.push({fromSquare, toSquare: {row, col}, piece});
            }
        }
        return validMoves;
    }

    pawnMoves(board, piece, fromSquare, lastMove) {
        const validMoves = [];
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // normal forward move
        const forwardOne = { row: fromSquare.row + direction, col: fromSquare.col };
        if (forwardOne.row >= 0 && forwardOne.row < 8 && !board.getPiece(forwardOne)) {
            validMoves.push({fromSquare, toSquare: forwardOne, piece});
            
            // starting move - only if first move was valid and we're on starting row
            if (fromSquare.row === startRow) {
                const forwardTwo = { row: fromSquare.row + direction * 2, col: fromSquare.col };
                if (!board.getPiece(forwardTwo)) {
                    validMoves.push({fromSquare, toSquare: forwardTwo, piece});
                }
            }
        }

        // captures
        const captureSquares = [
            { row: fromSquare.row + direction, col: fromSquare.col - 1 }, // capture left
            { row: fromSquare.row + direction, col: fromSquare.col + 1 }  // capture right
        ];

        for (const square of captureSquares) {
            if (square.row >= 0 && square.row < 8 && square.col >= 0 && square.col < 8) {
                const targetPiece = board.getPiece(square);
                if (targetPiece && targetPiece.color !== piece.color) {
                    validMoves.push({fromSquare, toSquare: square, piece});
                }
            }
        }

        // Skip en passant check on first move
        if(!lastMove) {
            return validMoves;
        }
        const lastMoveWasPawn = lastMove.piece.type === 'pawn';
        const lastMoveWasTwoStep = Math.abs(lastMove.toSquare.row - lastMove.fromSquare.row) === 2;
        const enPassantIsAvailable = fromSquare.row === lastMove.toSquare.row && Math.abs(lastMove.toSquare.col - fromSquare.col) === 1;
        // En passant
        if (lastMoveWasPawn && 
            lastMoveWasTwoStep && // Double pawn move
            enPassantIsAvailable) { // Adjacent file
            validMoves.push({ 
                fromSquare,
                toSquare: {
                    row: fromSquare.row + direction, 
                    col: lastMove.toSquare.col
                },
                piece
            });
        }
        
        return validMoves;
    }

    rookMoves(board, piece, fromSquare) {
        const validMoves = [];
        // Up
        for (let i = fromSquare.row + 1; i < 8; i++) {
            const targetPiece = board.getPiece({row: i, col: fromSquare.col});
            if (!targetPiece) {
                validMoves.push({fromSquare, toSquare: { row: i, col: fromSquare.col }, piece});
            } else if (targetPiece.color === piece.color) {
                break;
            } else {
                validMoves.push({fromSquare, toSquare: { row: i, col: fromSquare.col }, piece});
                break;
            }
        }
        // Down
        for (let i = fromSquare.row - 1; i >= 0; i--) {
            const targetPiece = board.getPiece({row: i, col: fromSquare.col});
            if (!targetPiece) {
                validMoves.push({fromSquare, toSquare: { row: i, col: fromSquare.col }, piece});
            } else if (targetPiece.color === piece.color) {
                break;
            } else {
                validMoves.push({fromSquare, toSquare: { row: i, col: fromSquare.col }, piece});
                break;
            }
        }
        // Right
        for (let i = fromSquare.col + 1; i < 8; i++) {
            const targetPiece = board.getPiece({row: fromSquare.row, col: i});
            if (!targetPiece) {
                validMoves.push({fromSquare, toSquare: { row: fromSquare.row, col: i }, piece});
            } else if (targetPiece.color === piece.color) {
                break;
            } else {
                validMoves.push({fromSquare, toSquare: { row: fromSquare.row, col: i }, piece});
                break;
            }
        }
        // Left
        for (let i = fromSquare.col - 1; i >= 0; i--) {
            const targetPiece = board.getPiece({row: fromSquare.row, col: i});
            if (!targetPiece) {
                validMoves.push({fromSquare, toSquare: { row: fromSquare.row, col: i }, piece});
            } else if (targetPiece.color === piece.color) {
                break;
            } else {
                validMoves.push({fromSquare, toSquare: { row: fromSquare.row, col: i }, piece});
                break;
            }
        }
        return validMoves;
    }

    knightMoves(board, piece, fromSquare) {
        const validMoves = [];
        const moveShifts = [
            { row: 2, col: 1 },
            { row: 2, col: -1 },
            { row: -2, col: 1 },
            { row: -2, col: -1 },
            { row: 1, col: 2 },
            { row: 1, col: -2 },
            { row: -1, col: 2 },
            { row: -1, col: -2 }
        ];
        for (const moveShift of moveShifts) {
            const toSquare = {
                row: fromSquare.row + moveShift.row,
                col: fromSquare.col + moveShift.col
            }
            if (toSquare.row < 0 || toSquare.row >= 8 || toSquare.col < 0 || toSquare.col >= 8) {
                continue;
            }
            const targetPiece = board.getPiece(toSquare);
            if (!targetPiece || targetPiece.color !== piece.color) {
                validMoves.push({fromSquare, toSquare, piece});
            }
        }
        return validMoves;
    }

    bishopMoves(board, piece, fromSquare) {
        const validMoves = [];
        const moveShifts = [
            { row: 1, col: 1 },
            { row: 1, col: -1 },
            { row: -1, col: 1 },
            { row: -1, col: -1 }
        ];
        for (const moveShift of moveShifts) {
            let i = 1;
            while (true) {
                const toSquare = {
                    row: fromSquare.row + moveShift.row * i,
                    col: fromSquare.col + moveShift.col * i
                }
                if (toSquare.row < 0 || toSquare.row >= 8 || toSquare.col < 0 || toSquare.col >= 8) {
                    break;
                }
                const targetPiece = board.getPiece(toSquare);
                if (!targetPiece) {
                    validMoves.push({fromSquare, toSquare, piece});
                } else if (targetPiece.color === piece.color) {
                    break;
                } else {
                    validMoves.push({fromSquare, toSquare, piece});
                    break;
                }
                i++;
            }
        }
        return validMoves;
    }

    queenMoves(board, piece, fromSquare) {
        const validMoves = [];
        validMoves.push(...this.rookMoves(board, piece, fromSquare));
        validMoves.push(...this.bishopMoves(board, piece, fromSquare));
        return validMoves;
    }

    queenCastleValid(board, piece, fromSquare) {
        if(!board.getPiece({row: fromSquare.row, col: 0}) || board.getPiece({row: fromSquare.row, col: 0}).has_moved) {
            return false;
        }
        // no pieces between king and rook
        for(let i = fromSquare.col - 1; i >= 1; i--) {
            if(board.getPiece({row: fromSquare.row, col: i})) {
                return false;
            }
        }
        // king never touches check
        for(let i = fromSquare.col; i >= fromSquare.col - 2; i--) {
            if(this.isUnderAttack(board, {row: fromSquare.row, col: i}, piece)) {
                return false;
            }
        }
        return true;
    }

    kingCastleValid(board, piece, fromSquare) {
        if(!board.getPiece({row: fromSquare.row, col: 7}) || board.getPiece({row: fromSquare.row, col: 7}).has_moved) {
            return false;
        }
        // no pieces between king and rook
        for(let i = fromSquare.col + 1; i < 7; i++) {
            if(board.getPiece({row: fromSquare.row, col: i})) {
                return false;
            }
        }
        // king never touches check
        for(let i = fromSquare.col; i < 7; i++) {
            if(this.isUnderAttack(board, {row: fromSquare.row, col: i}, piece)) {
                return false;
            }
        }
        return true;
    }

    castlingMoves(board, piece, fromSquare) {
        let validMoves = [];
        if (piece.has_moved) {
            return validMoves;
        }
        if (this.queenCastleValid(board, piece, fromSquare)) {
            validMoves.push({fromSquare, toSquare: { row: fromSquare.row, col: fromSquare.col - 2 }, piece});
        }
        if (this.kingCastleValid(board, piece, fromSquare)) {
            
            validMoves.push({fromSquare, toSquare: { row: fromSquare.row, col: fromSquare.col + 2 }, piece});
        }
        return validMoves;
    }

    // does not include castling
    kingMoves(board, piece, fromSquare) {
        const validMoves = [];
        const moveShifts = [
            { row: 1, col: 0 },
            { row: -1, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: -1 },
            { row: 1, col: 1 },
            { row: 1, col: -1 },
            { row: -1, col: 1 },
            { row: -1, col: -1 }
        ];
        for (const moveShift of moveShifts) {
            const toSquare = {
                row: fromSquare.row + moveShift.row,
                col: fromSquare.col + moveShift.col
            }
            if (toSquare.row < 0 || toSquare.row >= 8 || toSquare.col < 0 || toSquare.col >= 8) {
                continue;
            }
            const targetPiece = board.getPiece(toSquare);
            if (!targetPiece || targetPiece.color !== piece.color) {
                validMoves.push({fromSquare, toSquare, piece});
            }
        }
        return validMoves;
    }
    
    kingSafetyFilter(board, piece, moves) {
        const kingOg = board.getKingSquare(piece.color);
        moves = moves.filter(move => {
            console.log('evaluating king safety for eligible move - ', Format.formatMove(move))
            // Create a deep copy of the board
            const tempBoard = board.copy();
            const tempMove = structuredClone(move)
            
            // Make the move on the temporary board
            tempBoard.movePieceWithoutValidation(tempMove, true);

            const kingSquare = piece.type === 'king' ? move.toSquare : kingOg;
            console.log('current king square - ', Format.formatSquare(kingSquare))
            return !this.isUnderAttack(tempBoard, {row: kingSquare.row, col: kingSquare.col}, piece);
        });
        return moves;
    }

    // Returns array of valid moves for a piece at given position
    getValidMoves(board, fromSquare) {
        const piece = board.getPiece(fromSquare);
        if (!piece) return [];

        if (!this.strictMoveValidation) {
            console.log('skipping move validation')
            return this.allMovesValid(piece, fromSquare);
        }

        let moves = [];
        if (piece.type === 'pawn') {
            moves = this.pawnMoves(board, piece, fromSquare, board.lastMove);
        } else if (piece.type === 'rook') {
            // not sure but maybe castling moves should also be applied here?
            moves = this.rookMoves(board, piece, fromSquare);
        } else if (piece.type === 'knight') {
            moves = this.knightMoves(board, piece, fromSquare);
        } else if (piece.type === 'bishop') {
            moves = this.bishopMoves(board, piece, fromSquare);
        } else if (piece.type === 'queen') {
            moves = this.queenMoves(board, piece, fromSquare);
        } else if (piece.type === 'king') {
            moves = [...this.kingMoves(board, piece, fromSquare), ...this.castlingMoves(board, piece, fromSquare)];
        }

        return this.kingSafetyFilter(board, piece, moves);
    }

    isValidMove(board, fromSquare, toSquare) {
        const validMoves = this.getValidMoves(board, fromSquare);
        const valid = validMoves.some(move => {
            return move.toSquare.row === toSquare.row && move.toSquare.col === toSquare.col
        });
        return valid;
    }

    // todo - maybe refactor. The logic is very counter intuitive.
    // at the very least add better documentation
    isUnderAttack(board, square, piece) {
        // First check if the position is valid
        if (square.row < 0 || square.row >= 8 || square.col < 0 || square.col >= 8) {
            return false;
        }

        const direction = piece.color === 'white' ? -1 : 1;

        // Check pawn attacks with bounds checking
        if (square.row + direction >= 0 && square.row + direction < 8) {
            if (square.col > 0) {
                let potentialPawnLeft = board.getPiece({row: square.row + direction, col: square.col - 1});
                if (potentialPawnLeft && potentialPawnLeft.type === 'pawn' && potentialPawnLeft.color !== piece.color) {
                    return true;
                }
            }
            if (square.col < 7) {
                let potentialPawnRight = board.getPiece({row: square.row + direction, col: square.col + 1});
                if (potentialPawnRight && potentialPawnRight.type === 'pawn' && potentialPawnRight.color !== piece.color) {
                    return true;
                }
            }
        }


        // The way the rest of this method works is by going through each piece
        // type and checking valid moves from the square we are currently
        // checking is under attack. Then, using those valid moves, we check
        // whether the toSquare currently has the piece type in question on it.
        // Note: To get valid moves properly, we have to act as though we 
        // are the current color.

        // Check knight attacks
        const knightMoves = this.knightMoves(board, { color: piece.color, type: 'knight' }, square);
        if (knightMoves.some(move => {
            const candidatePiece = board.getPiece(move.toSquare);
            return candidatePiece && candidatePiece.type === 'knight' && candidatePiece.color !== piece.color;
        })) {
            return true;
        }

        // Check bishop attacks
        const bishopMoves = this.bishopMoves(board, { color: piece.color, type: 'bishop' }, square);
        bishopMoves.forEach((move) => console.log(Format.formatMove(move)));
        if (bishopMoves.some(move => {
            const candidatePiece = board.getPiece(move.toSquare);
            console.log('candidate piece - ', candidatePiece, ' piece color - ', piece.color)
            return candidatePiece && candidatePiece.type === 'bishop' && candidatePiece.color !== piece.color;
        })) {
            return true;
        }

        // Check rook attacks
        const rookMoves = this.rookMoves(board, { color: piece.color, type: 'rook' }, square);
        if (rookMoves.some(move => {
            const candidatePiece = board.getPiece(move.toSquare);
            return candidatePiece && candidatePiece.type === 'rook' && candidatePiece.color !== piece.color;
        })) {
            return true;
        }

        // Check queen attacks
        const queenMoves = this.queenMoves(board, { color: piece.color, type: 'queen' }, square);
        if (queenMoves.some(move => {
            const candidatePiece = board.getPiece(move.toSquare);
            return candidatePiece && candidatePiece.type === 'queen' && candidatePiece.color !== piece.color;
        })) {
            return true;
        }

        // Check king attacks
        const kingMoves = this.kingMoves(board, { color: piece.color, type: 'king' }, square);
        if (kingMoves.some(move => {
            const piece = board.getPiece(move.toSquare);
            return piece && candidatePiece.type === 'king' && candidatePiece.color !== candidatePiece.color;
        })) {
            return true;
        }

        return false;
    }

    isCastlingMove(move) {
        return move.piece.type === 'king' && Math.abs(move.toSquare.col - move.fromSquare.col) === 2;
    }

    isEnPassant(move, lastMove) {
        if(!move || !lastMove) return false;
        const lastMoveWasPawn = lastMove.piece.type === 'pawn';
        const lastMoveWasTwoStep = Math.abs(lastMove.toSquare.row - lastMove.fromSquare.row) === 2;
        const thisMoveWasPawn = move.piece.type === 'pawn';
        const enPassantWasAvailable = move.fromSquare.row === lastMove.toSquare.row && Math.abs(lastMove.toSquare.col - move.fromSquare.col) === 1;
        const enPassantTaken = move.toSquare.col === lastMove.toSquare.col && Math.abs(lastMove.fromSquare.row - move.toSquare.row) === 1;
        
        return lastMoveWasPawn &&
                lastMoveWasTwoStep &&
                thisMoveWasPawn &&
                enPassantWasAvailable &&
                enPassantTaken;
    }

    isPromotion(move) {
        return move.piece.type === 'pawn' && ((move.piece.color === 'white' && move.toSquare.row === 0) || move.piece.color === 'black' && move.toSquare.row === 7);
    }

    isCheckMate(board, color) {
        const kingSquare = board.getKingSquare(color);
        const kingPiece = board.getPiece(kingSquare);

        const isCurrentTurn = board.getCurrentTurn() === kingPiece.color;
        const isUnderAttack = this.isUnderAttack(board, kingSquare, kingPiece);
        // no need to check castling moves bc a precondition is that the king is under attack.
        // If isUnderAttack is false, then checkmate check doesn't matter
        // If isUnderAttack is true, then castling is impossible
        const availableMoves = this.kingMoves(board, kingPiece, kingSquare);
        const availableSafeMoves = this.kingSafetyFilter(board, kingPiece, availableMoves);
        const hasNoMoves = availableSafeMoves.length === 0;

        console.log('Checkmate evaluation:');
        console.log('- Is current turn:', isCurrentTurn);
        console.log('- Is under attack:', isUnderAttack);
        console.log('- Available moves:');
        availableMoves.forEach((move) => console.log(Format.formatMove(move)));
        console.log('- Available safe moves:');
        availableSafeMoves.forEach((move) => console.log(Format.formatMove(move)));
        console.log('- Has no moves:', hasNoMoves);
        console.log('- Final result:', isCurrentTurn && isUnderAttack && hasNoMoves);

        return isCurrentTurn && isUnderAttack && hasNoMoves;
    }
}

export default Rules; 