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
        console.log(JSON.stringify(lastMove), lastMoveWasPawn, lastMoveWasTwoStep, enPassantIsAvailable)
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
        console.log('validate qs castle - ', JSON.stringify(board.getPiece({row: fromSquare.row, col: 0})))
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
            if(this.isUnderAttack(board, piece.color, {row: fromSquare.row, col: i})) {
                return false;
            }
        }
        return true;
    }

    kingCastleValid(board, piece, fromSquare) {
        console.log('validate ks castle - ', JSON.stringify(board.getPiece({row: fromSquare.row, col: 0})))
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
            if(this.isUnderAttack(board, piece.color, {row: fromSquare.row, col: i})) {
                return false;
            }
        }
        return true;
    }

    castlingMoves(board, piece, fromSquare) {
        console.log('castle moves, piece - ', piece, ' from square - ', fromSquare)
        let validMoves = [];
        if (piece.has_moved) {
            console.log('king has already movevd')
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

        // validate king safety
        const kingOg = board.getKingSquare(piece.color);
        moves = moves.filter(move => {
            // Create a deep copy of the board
            const tempBoard = board.copy();
            const tempMove = structuredClone(move)
            
            // Make the move on the temporary board
            tempBoard.movePieceWithoutValidation(tempMove);

            // Check if the king would be in check
            const kingCurr = piece.type === 'king' ? move.toSquare : kingOg;
            return !this.isUnderAttack(tempBoard, piece.color, {row: kingCurr.row, col: kingCurr.col});
        });

        return moves;
    }

    isValidMove(board, fromSquare, toSquare) {
        const validMoves = this.getValidMoves(board, fromSquare);
        const valid = validMoves.some(move => {
            return move.toSquare.row === toSquare.row && move.toSquare.col === toSquare.col
        });
        console.log('is valid move - ', valid)
        return valid;
    }

    isUnderAttack(board, color, square) {
        // First check if the position is valid
        if (square.row < 0 || square.row >= 8 || square.col < 0 || square.col >= 8) {
            return false;
        }

        const direction = color === 'white' ? -1 : 1;

        // Check pawn attacks with bounds checking
        if (square.row + direction >= 0 && square.row + direction < 8) {
            if (square.col > 0) {
                let potentialPawnLeft = board.getPiece({row: square.row + direction, col: square.col - 1});
                if (potentialPawnLeft && potentialPawnLeft.type === 'pawn' && potentialPawnLeft.color !== color) {
                    return true;
                }
            }
            if (square.col < 7) {
                let potentialPawnRight = board.getPiece({row: square.row + direction, col: square.col + 1});
                if (potentialPawnRight && potentialPawnRight.type === 'pawn' && potentialPawnRight.color !== color) {
                    return true;
                }
            }
        }

        // Create a dummy piece for getting moves
        const dummyPiece = { color: color };
        
        // Check knight attacks
        const knightMoves = this.knightMoves(board, dummyPiece, square);
        if (knightMoves.some(move => {
            const piece = board.getPiece(move.toSquare);
            return piece && piece.type === 'knight' && piece.color !== color;
        })) {
            return true;
        }

        // Check bishop attacks
        const bishopMoves = this.bishopMoves(board, dummyPiece, square);
        if (bishopMoves.some(move => {
            const piece = board.getPiece(move.toSquare);
            return piece && piece.type === 'bishop' && piece.color !== color;
        })) {
            return true;
        }

        // Check rook attacks
        const rookMoves = this.rookMoves(board, dummyPiece, square);
        if (rookMoves.some(move => {
            const piece = board.getPiece(move.toSquare);
            return piece && piece.type === 'rook' && piece.color !== color;
        })) {
            return true;
        }

        // Check queen attacks
        const queenMoves = this.queenMoves(board, dummyPiece, square);
        if (queenMoves.some(move => {
            const piece = board.getPiece(move.toSquare);
            return piece && piece.type === 'queen' && piece.color !== color;
        })) {
            return true;
        }

        // Check king attacks
        const kingMoves = this.kingMoves(board, dummyPiece, square);
        if (kingMoves.some(move => {
            const piece = board.getPiece(move.toSquare);
            return piece && piece.type === 'king' && piece.color !== color;
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
        
        console.log('En Passant Check:', {
            lastMove: JSON.stringify(lastMove),
            currentMove: JSON.stringify(move),
            lastMoveWasPawn,
            lastMoveWasTwoStep,
            thisMoveWasPawn,
            enPassantWasAvailable,
            enPassantTaken,
            result: lastMoveWasPawn && lastMoveWasTwoStep && thisMoveWasPawn && enPassantWasAvailable && enPassantTaken
        });
        
        return lastMoveWasPawn &&
                lastMoveWasTwoStep &&
                thisMoveWasPawn &&
                enPassantWasAvailable &&
                enPassantTaken;
    }

    isPromotion(move) {
        console.log('promotion move check: ', move)
        return move.piece.type === 'pawn' && ((move.piece.color === 'white' && move.toSquare.row === 0) || move.piece.color === 'black' && move.toSquare.row === 7);
    }
}

export default Rules; 