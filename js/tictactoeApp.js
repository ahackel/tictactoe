import {TicTacToeGame} from './TicTacToeGame';

var blockSize;
var game;

function adjustSize(){
	let portrait = window.innerWidth < window.innerHeight;
	let nx = window.innerWidth / 6;
	let ny = window.innerHeight / 5;
	let n = (portrait) ? ny : nx;
	blockSize = Math.min(128, Math.floor(n));
	$('html').css('font-size', blockSize);
	if (game != null)
		game.board.blockSize = blockSize;
	window.scrollTo(0, 0);
}

$(document).ready(function() {
	adjustSize();
	game = new TicTacToeGame(blockSize);

	$(window).on('resize', adjustSize);

	document.ontouchmove = function(e){ e.preventDefault(); }
});
