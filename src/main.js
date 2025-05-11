import Board from './models/Board.js';
import BoardView from './views/BoardView.js';

window.onload = () => {
    const board = new Board();
    const boardView = new BoardView(board);
}; 