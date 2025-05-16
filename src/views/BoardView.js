import Timer from '../models/Timer.js';
import Format from '../chess/Format.js';

class BoardView {
    constructor(board) {
        this.board = board;
        this.boardElement = document.getElementById('chessBoard');
        this.squares = new Array(8).fill(null).map(() => new Array(8).fill(null));
        this.selectedSquare = null;
        this.promotionPopup = document.getElementById('promotionPopup');
        this.promotionResolve = null;

        this.whiteTimer = new Timer(10);
        this.blackTimer = new Timer(10);
        this.timePresets = {
            '10s': 1/6,  // 10 seconds
            '1m': 1,     // 1 minute
            '5m': 5,     // 5 minutes
            '10m': 10    // 10 minutes
        };
        this.humanReadable = false;

        this.pieceSymbols = {
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            },
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            }
        };

        this.initializeBoard();
        this.setupTimers();
        this.addEventListeners();
        this.setupStartButton();
        this.setupResetButton();
        this.setupValidationToggle();
        this.setupHumanReadableToggle();
    }

    initializeBoard() {
        // Create squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const squareView = document.createElement('div');

                // Create square views
                squareView.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                // Must be primitives. Objects do not work in dataset.
                squareView.dataset.row = row;
                squareView.dataset.col = col;
                this.boardElement.appendChild(squareView);
                this.squares[row][col] = squareView;

                this.reloadSquare({row, col});
            }
        }
    }

    reloadSquare(square) {
        const piece = this.board.getPiece(square);
        const squareView = this.squares[square.row][square.col];
        
        if (piece) {
            squareView.textContent = this.pieceSymbols[piece.color][piece.type];
        } else {
            squareView.textContent = '';
        }
    }

    selectSquare(square) {
        this.selectedSquare = square;
        this.squares[square.row][square.col].classList.add('selected');
    }

    clearSelection() {
        if (this.selectedSquare) {
            const {row, col} = this.selectedSquare;
            this.squares[row][col].classList.remove('selected');
            this.selectedSquare = null;
            
            // Remove possible move indicators
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    this.squares[r][c].classList.remove('possible-move');
                }
            }
        }
    }

    showPossibleMoves() {
        const validMoves = this.board.getValidMoves(this.selectedSquare);
        
        // Show valid moves on the board
        if (Array.isArray(validMoves)) {
            validMoves.forEach(move => {
                this.squares[move.toSquare.row][move.toSquare.col].classList.add('possible-move');
            });
        }
    }

    // Prompt the user with a popup to choose the piece they would like to promote their pawn to.
    // The popup should show the valid pieces to choose from in a color which matches the player's color.
    // Once the player clicks a piece, the popup is hidden and this function returns that piece
    // in the form {type: 'queen', color: 'black'} for example
    promptUserForPromotion(color) {
        return new Promise((resolve) => {
            this.promotionResolve = resolve;
            
            // Update piece symbols to match the player's color
            const pieces = this.promotionPopup.querySelectorAll('.promotion-piece');
            pieces.forEach(piece => {
                piece.textContent = this.pieceSymbols[color][piece.dataset.piece];
            });
            
            // Show the popup
            this.promotionPopup.style.display = 'block';
            
            // Add click handlers
            pieces.forEach(piece => {
                piece.onclick = () => {
                    const pieceType = piece.dataset.piece;
                    this.promotionPopup.style.display = 'none';
                    resolve({ type: pieceType, color: color });
                };
            });
        });
    }

    async tryMovePiece(fromSquare, toSquare) {
        console.log('moving - ' + '{' +fromSquare.row + ',' +fromSquare.col + '}' + '{' +toSquare.row + ',' +toSquare.col + '}');
        let moveState = this.board.movePiece(fromSquare, toSquare);
        if(moveState.promotionSquare) {
            console.log('promotion eligible')
            const piece = this.board.getPiece(moveState.promotionSquare);
            const promotionPiece = await this.promptUserForPromotion(piece.color);
            this.board.promote(moveState.promotionSquare, promotionPiece);
        }
        if (moveState.updatedSquares.length) {
            for (const updatedSquare of moveState.updatedSquares) {
                console.log('updated square ', JSON.stringify(updatedSquare))
                this.reloadSquare(updatedSquare);
            }
            
            if(this.humanReadable) {
                console.log('Current Position:', this.board.getCurrentPosition());
            } else {
                console.log('FEN:', Format.getFEN(this.board));
            }
            
            // Switch timers
            if (this.board.isGameStarted()) {
                if (this.board.getCurrentTurn() === 'white') {
                    this.blackTimer.stop();
                    this.whiteTimer.start();
                } else {
                    this.whiteTimer.stop();
                    this.blackTimer.start();
                }
            }
        } else {
            console.log('no squares to update')
        }
    }

    setupTimers() {
        // Setup timer displays
        this.whiteTimer.onTick = (time) => {
            document.querySelector('#whiteTimer .time-display').textContent = this.whiteTimer.formatTime();
        };
        this.blackTimer.onTick = (time) => {
            document.querySelector('#blackTimer .time-display').textContent = this.blackTimer.formatTime();
        };

        // Setup timeout handlers
        this.whiteTimer.onTimeout = () => {
            alert('Black wins on time!');
            this.resetGame();
        };
        this.blackTimer.onTimeout = () => {
            alert('White wins on time!');
            this.resetGame();
        };

        // Setup time preset handlers
        document.querySelectorAll('input[name="timePreset"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (!this.board.isGameStarted()) {
                    const minutes = this.timePresets[radio.value];
                    this.whiteTimer.reset(minutes);
                    this.blackTimer.reset(minutes);
                }
            });
        });
    }

    addEventListeners() {
        this.boardElement.addEventListener('click', (e) => {
            const squareView = e.target.closest('.square');
            if (!squareView) return;

            const square = {
                row: parseInt(squareView.dataset.row),
                col: parseInt(squareView.dataset.col)
            };
            if (this.selectedSquare) {
                const fromSquare = this.selectedSquare;
                this.tryMovePiece(fromSquare, square);
                this.clearSelection();
            } else {
                // If no square was selected, try to select a piece
                const piece = this.board.getPiece(square);
                if (piece && piece.color === this.board.getCurrentTurn()) {
                    this.selectSquare(square);
                    this.showPossibleMoves();
                }
            }
        });
    }

    setupStartButton() {
        document.getElementById('startButton').addEventListener('click', () => {
            if (!this.board.isGameStarted()) {
                this.startGame();
            }
        });
    }

    setupResetButton() {
        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetGame();
        });
    }

    startGame() {
        this.board.startGame();
        this.whiteTimer.start(); // White moves first
        document.getElementById('startButton').textContent = 'Game In Progress';
        document.getElementById('startButton').disabled = true;
    }

    resetGame() {
        this.board.reset();
        const selectedPreset = document.querySelector('input[name="timePreset"]:checked').value;
        const minutes = this.timePresets[selectedPreset];
        this.whiteTimer.reset(minutes);
        this.blackTimer.reset(minutes);

        document.getElementById('startButton').textContent = 'Start Game';
        document.getElementById('startButton').disabled = false;
        this.clearSelection();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.reloadSquare({row,col});
            }
        }
    }

    setupValidationToggle() {
        const toggle = document.getElementById('validationToggle');
        toggle.addEventListener('change', (e) => {
            this.board.setStrictValidation(e.target.checked);
        });
    }

    setupHumanReadableToggle() {
        const toggle = document.getElementById('humanReadableToggle');
        toggle.addEventListener('change', (e) => {
            this.humanReadable = e.target.checked;
        });
    }
}

export default BoardView; 