import {Block} from './Block';
import {Game} from './Game';
import {GameState, MCTS} from './MCTS';

"use strict";

const EMPTY = 0;
const RED = 1;
const BLUE = 2;
const DRAW = 0;
const CONNECT_LENGTH = 3;
const WIDTH = 3;
const HEIGHT = 3;
const MAXITER = 300;

class TicTacToeGameState extends GameState{

	constructor(player){
		super();
		this.player = player;
		this.winner = null;
		this.lastPosition = null;
		for (let i=0; i<WIDTH * HEIGHT; i++)
			this.values.push(EMPTY);
	}

	get(x, y) {
		if (x < 0 || y < 0 || x > WIDTH - 1 || y > HEIGHT - 1)
			return null;
		return this.values[x + y * WIDTH];
	}

	getMoves(){
		let moves = [];
		if (this.winner == null) {
			// Game is not over, so there are moves:
			for (let i = 0; i < WIDTH * HEIGHT; i++) {
				if (this.values[i] == EMPTY) {
					moves.push(i);
				}
			}
		}
		return moves;
	}

	doMove(move){
		this.player = 3 - this.player;

		this.lastPosition = move;
		this.values[this.lastPosition] = this.player;
		this.winner = this.getWinner();
	}

	copy(){
		let s = new TicTacToeGameState();
		s.values = this.values.slice(0);
		s.player = this.player;
		s.winner = this.winner;
		s.lastPosition = this.lastPosition;
		return s;
	}

	checkLine(dx, dy){
		let count = 0;

		let x = this.lastPosition % WIDTH;
		let y = Math.floor(this.lastPosition / WIDTH);
		x -= dx * (CONNECT_LENGTH-1);
		y -= dy * (CONNECT_LENGTH-1);

		for (let i = 0; i < CONNECT_LENGTH * 2 - 1; i++) {
			if (this.get(x + dx * i, y + dy * i) == this.player)
				count++;
			else
				count = 0;
			if (count == CONNECT_LENGTH) {
				this.wonPosition = [];
				for (let p = 0; p<CONNECT_LENGTH; p++){
					this.wonPosition.push({
						x: x + dx * (i - p),
						y: y + dy * (i - p)
					})
				}
				return true;
			}
		}
		return false;
	}


	getWinner(){
		if (this.checkLine(1, 0)) return this.player;
		if (this.checkLine(0, 1)) return this.player;
		if (this.checkLine(1, 1)) return this.player;
		if (this.checkLine(1, -1)) return this.player;

		if (this.isFull())
			return DRAW;
		else
			return null;
	}

	getResult(player){
		if (this.winner == player)
			return 1;
		if (this.winner == 3 - player)
			return 0;
		return 0.5;
	}

	isFull(){
		for (let v of this.values) {
			if (v == EMPTY)
				return false;
		}
		return true;
	}

	toString(){
		let s = "";
		for (let i=0; i<this.values.length; i++) {
			let v = this.values[i];
			if (v == RED) s += 'X';
			else if (v == BLUE) s += 'O';
			else s += '.';
			if (i % WIDTH == WIDTH-1)
				s += "\n";
		}
		return s;
	}
}



class TicTacToeBlock extends Block {
	constructor (game, x, y, color) {
		let colorClass = (color == RED) ? 'red' : 'blue';
		super(game, x, y, 1, 1, 'block ' + colorClass);
		this.color = color;
	}
}

export class TicTacToeGame extends Game {
	constructor(blockSize) {
		var that = this;
		this.gameOver = $('#gameover').hide().on('touchstart mousedown', function(){
			that.reset();
		});
		this.gameOverText = $('#gameover-text');
		super(WIDTH, HEIGHT, blockSize);
		this.winsRed = 0;
		this.winsBlue = 0;
		this.reset();
	}

	click(e){
		// the player can only move if the last player has been the computer:
		if (this.over || this.gameState.player == RED)
		    return;

		if (!this.placeBlock(e.x + e.y * WIDTH))
			return;

		if (!this.checkGameOver())
			this.opponentMove();
	}

	placeBlock(move){
		console.log(this.gameState.player);
		if (this.gameState.values[move] == EMPTY) {
			let x = move % WIDTH;
			let y = Math.floor(move / WIDTH);

			this.gameState.doMove(move);

			this.board.addBlock(new TicTacToeBlock(this, x, y, this.gameState.player));
			return true;
		}
		return false;
	}

	checkGameOver(){
		if (this.gameState.winner != null) {

			if (this.gameState.wonPosition) {
				for (let p of this.gameState.wonPosition) {
					this.board.getBlockAt(p.x, p.y).element.addClass('won');
				}
			}

			let s = 'DRAW';
			if (this.gameState.winner == RED){
				s = "YOU WON";
				this.winsRed++;
				$('.wins.red').text(this.winsRed);
			}
			if (this.gameState.winner == BLUE){
				s = "COMPUTER WON";
				this.winsBlue++;
				$('.wins.yellow').text(this.winsBlue);
			}
			this.gameOverText.text(s);
			this.gameOver.show();
			this.over = true;
			return true;
		}
		return false;
	}

	opponentMove(){
		var that = this;
		setTimeout(function(){
			let move = MCTS.search(that.gameState, MAXITER); //, Math.random() * 100);
			that.placeBlock(move);
			that.checkGameOver();
		}, 500);
	}

	reset(){
		super.reset();
		this.gameOver.fadeOut(500);
		this.gameState = new TicTacToeGameState((Math.random() > 0.5) ? RED : BLUE);
		if (this.gameState.player == RED)
			this.opponentMove();
	}


}