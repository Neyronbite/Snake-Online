//main windows
let gameOverDiv;
let gamePausedDiv;
let gameDiv;
let startOptionsDiv;
let scoreText;
let bestScoreText;

//canvas details
let canvas;
let ctx;

//Main bool variables
let gameOver;
let gamePaused;
let retry;
let started;
let pressed;

//matrix details
let matrix;
const length = 64;
const height = 32;
const xScale = 16;
const yScale = 16;

//player details
let player;
let stepCount;
let score;

let speed;
let mapOriginal;

//game starting function
function start(map, speedStart){
	speed = speedStart;

	//Initializing game windows
	gameDiv = $("#game");
	gameOverDiv = $("#game-over-window");
	gamePausedDiv = $("#pause-window");
	startOptionsDiv = $("#start-options");
	scoreText = $(".score-text");
	bestScoreText = $(".best-score-text");

	startOptionsDiv.addClass("d-none");
	gameDiv.removeClass("d-none");

	//geting canvas
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	//adding keys controll
	document.onkeydown = checkKey;

	//adding pause and game over buttons logic
	$(".retry").click(e => {restart(); });
	$(".continue").click (e => {pause(); });
	$(".gameOver").click (e => {finishGame(); });
	$(".exit").click(e => {dispose(); });

	//TODO map from server
	//TODO other propertioes before game starting

	mapOriginal = map;
	startGame();
}

function dispose() {
	document.onkeydown = () => false;

	gameOver = true;
	gamePaused = undefined;

	$(".retry").click(e => {})
	$(".continue").click (e => {});
	$(".fameOver").click (e => {});
	$(".exit").click(e => {});

	gameOverDiv.addClass("d-none");
	gamePausedDiv.addClass("d-none");

	gameDiv.addClass("d-none");
	startOptionsDiv.removeClass("d-none");
}

function checkKey(e) {
    e = e || window.event;
    console.log("key pressed");

    if (!started) {
        player.directionX = 1;
        started = true;
        pressed = true;
        return;
    }

    if(e.keyCode == '27'){
    	// Esc
		pause();
    	return;
    }
    else if (e.keyCode == '82') {
    	// R
		if(gamePaused) {
			restart();
		}
		else {
			pause();
			gamePausedDiv.addClass("d-none");

			setTimeout(() => { 
				restart();
			}, speed * 2);
			return;
		}
    }

    if (pressed) {
    	return;
    }

    if (e.keyCode == '38') {
        // up arrow
        if (player.directionY == 1) {return}
        player.directionY = -1
        player.directionX = 0
    }
    else if (e.keyCode == '40') {
        // down arrow
        if (player.directionY == -1) {return}
        player.directionY = 1;
        player.directionX = 0
    }
    else if (e.keyCode == '37') {
       // left arrow
        if (player.directionX == 1) {return}
    	player.directionX = -1;
    	player.directionY = 0
    }
    else if (e.keyCode == '39') {
       // right arrow
        if (player.directionX == -1) {return}
    	player.directionX = 1;
    	player.directionY = 0
    }
    
    pressed = true;
}

function initPlayer(x, y) {
	player = {
		X: x,
		Y: y,

		length: 3,
		body: new Queue(),

		directionY: 0,
		directionX: 0
	};
	player.body.enqueue({x: x - 2, y: y, isEaten: false});
	player.body.enqueue({x: x - 1, y: y, isEaten: false});
	player.body.enqueue({x: x, y: y, isEaten: false});

	debugger;
	matrix[y][x] = 2;
	matrix[y][x - 1] = 2;
	matrix[y][x - 2] = 2;
}

function initMap() {
	var newMap = JSON.parse(JSON.stringify(mapOriginal))
	matrix = newMap.matrix;
}

function getScaledX(x){
	return x * xScale;
}
function getScaledY(y){
	return y * yScale;
}

function drawMatrix(){
	for(let i = 0; i < height; i++){
		for(let j = 0; j < length; j++){
			let temp = matrix[i][j];
			drawBlock(temp, j, i)
		}
	}
}

function drawBlock(block, x, y) {
	switch(block) {
		//floor block - fills black
		case 0:
			ctx.fillStyle = "#000000"
			ctx.beginPath();
			ctx.fillRect(getScaledX(x), getScaledY(y), xScale, yScale);
			ctx.stroke();
			break;
		//wall block - fills magenta
		case 1:
			ctx.beginPath();
			ctx.fillStyle = "#FF00FF"
			ctx.fillRect(getScaledX(x), getScaledY(y), xScale, yScale);
			
			// ctx.fillStyle = "#FFC0CB"
			// ctx.fillRect(getScaledX(x) + 4, getScaledY(y) + 4, 8, 8);

			ctx.stroke();
			break;
		//snakes body
		case 2:
			ctx.beginPath();
			ctx.fillStyle = "#00FF00"
			ctx.fillRect(getScaledX(x), getScaledY(y), xScale, yScale);

			ctx.fillStyle = "#023020"
			ctx.fillRect(getScaledX(x), getScaledY(y), 4, 4);
			ctx.fillRect(getScaledX(x), getScaledY(y) + 12, 4, 4);
			ctx.fillRect(getScaledX(x) + 4, getScaledY(y) + 4, 8, 8);
			ctx.fillRect(getScaledX(x) + 12, getScaledY(y), 4, 4);
			ctx.fillRect(getScaledX(x) + 12, getScaledY(y) + 12, 4, 4);

			ctx.stroke();
			break;
		//bonus
		case 3:
			ctx.beginPath();

			ctx.fillStyle = "#E0FFFF"
			ctx.fillRect(getScaledX(x) + 3, getScaledY(y) + 3, xScale - 6, yScale - 6);

			ctx.fillStyle = "#FF0000"
			ctx.fillRect(getScaledX(x) + 6, getScaledY(y) + 2, xScale - 12, yScale - 4);
			ctx.fillRect(getScaledX(x) + 2, getScaledY(y) + 6, xScale - 4, yScale - 12);
			
			ctx.stroke();
			break;
	}
}

function drawHead() {
	ctx.beginPath();
	ctx.fillStyle = "#00FF00";
	ctx.fillRect(getScaledX(player.X), getScaledY(player.Y), xScale - 2, yScale);

	// ctx.fillStyle = "#AA336A";
	// ctx.fillRect(getScaledX(player.X) + 14, getScaledY(player.Y) + 6, 2, 4);

	// ctx.fillStyle = "#FFFFFF";
	// ctx.fillRect(getScaledX(player.X) + 11, getScaledY(player.Y) + 3, 2, 2);
	// ctx.fillRect(getScaledX(player.X) + 11, getScaledY(player.Y) + yScale - 3, 2, 2);

	ctx.stroke();
}

function startGame(){

	started = false;
	pressed = false;
	score = 0;
	updateScore();

	//matrix = map.matrix;
	initMap();
	initPlayer(Number(mapOriginal.playerX), Number(mapOriginal.playerY));

	stepCount = 0;
	gameOver = false;
	gamePaused = false;

	drawMatrix();
	spawnBonus();
	drawHead();
	gameStep();
}

function gameStep() {
	if(gameOver){
		finishGame();
		return;
	}
	else if(gamePaused){
	}
	else{
		stepCount++;
		playerMove();

		//Repeat
		setTimeout(() => {
			gameStep();
		}, speed)
	}
}

function playerMove(){
	let nextX = player.X;
	let nextY = player.Y;

	function next(x, y) {
		let moveing = false;
		let eating = false;

		if(x >= length) {
			x = 0;
		}
		else if(x < 0) {
			x = length - 1;
		}
		else if(y >= height) {
			y = 0;
		}
		else if(y < 0) {
			y = height - 1;
		}

		if (matrix[y][x] == 1 || matrix[y][x] == 2) {
			gameOver = true;
		}
		else if(matrix[y][x] == 0){
			moveing = true;
		}
		else if (matrix[y][x] == 3) {
			moveing = true;
			eating = true;
		}

		if (moveing) {
			player.body.enqueue({x: x, y: y, isEaten: eating})

			if (eating) {
				score++;
				updateScore();
				spawnBonus();
			}

			player.X = x;
			player.Y = y;

			matrix[y][x] = 2;
			drawHead();

			let last = player.body.peek();
			if (!last.isEaten) {
				player.body.dequeue();
				matrix[last.y][last.x] = 0;
				drawBlock(0, last.x, last.y);
			}
			else {
				last.isEaten = false;
			}
		}

		pressed = false;
	}
	
	//moveing
	if (player.directionX > 0) {
		drawBlock(2, player.X, player.Y);	
		next(player.X + 1, player.Y);
	}
	else if (player.directionX < 0) {
		drawBlock(2, player.X, player.Y);
		next(player.X - 1, player.Y);
	}
	else if (player.directionY > 0) {
		drawBlock(2, player.X, player.Y);
		next(player.X, player.Y + 1);
	}
	else if (player.directionY < 0) {
		drawBlock(2, player.X, player.Y);
		next(player.X, player.Y - 1);
	}
}

function spawnBonus(){
	while(true){
		let x = getRandomInt(0, length - 1);	
		let y = getRandomInt(0, height - 1);

		if (matrix[y][x] == 0) {
			matrix[y][x] = 3;
			drawBlock(3,x,y);

			return;
		}
	}
}

function updateScore() {
	scoreText.html("Score: " + score);
	if(score > bestScore) {
		bestScore = score;
		bestScoreText.html("Best Score: " + score);
	}
}

function finishGame() {
	//TODO save score
	gameOver = true;
	gamePausedDiv.addClass("d-none");
	gameOverDiv.removeClass("d-none");
	gamePaused = false;
	//gameStep();
}
function pause() {
	if(gameOver) {return; }

	gamePaused = !gamePaused;
	if(gamePaused) {
		gamePausedDiv.removeClass("d-none");
	}
	else {
		gamePausedDiv.addClass("d-none");
		gameStep();
	}
}

function restart() {
	gamePausedDiv.addClass("d-none");
	gameOverDiv.addClass("d-none");

	startGame();
}

class Queue {
    constructor() {
        this.items = {}
        this.frontIndex = 0
        this.backIndex = 0
    }
    enqueue(item) {
        this.items[this.backIndex] = item
        this.backIndex++
        return item + ' inserted'
    }
    dequeue() {
        const item = this.items[this.frontIndex]
        delete this.items[this.frontIndex]
        this.frontIndex++
        return item
    }
    peek() {
        return this.items[this.frontIndex]
    }
    get printQueue() {
        return this.items;
    }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}