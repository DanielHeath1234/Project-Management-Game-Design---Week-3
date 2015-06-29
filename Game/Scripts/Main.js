var player = new Player();
var keyboard = new Keyboard();
var enemy = new Enemy();
var enemies = new Enemies();

var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

var tileset = document.createElement("img");
tileset.src = "Art/tileset.png";

var heart = document.createElement("img");
heart.src = "Art/health.png";

var heart2 = document.createElement("img");
heart2.src = "Art/health2.png";

var bgMusic = new Howl({
	urls:["Audio/background.ogg"],
	loop:true,
	buffer:true,
	volume:0.5,
});

//bgMusic.play();

var MAP = {tw:70, th:20};
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

var LAYER_COUNT = 6;
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_DECOR = 2;
var LAYER_DOOR = 3;
var LAYER_BREAKABLES = 4;
var LAYER_LADDERS = 5;

var gameTimer = 0;
var textTimer = 0;

var winner = "No winner yet!";
var gameOverBool = false;

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

var cells = [];
function initialize(){
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++){
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < MyLevel2.layers[layerIdx].height; y++){
			cells[layerIdx][y] = [];
			for(var x = 0; x < MyLevel2.layers[layerIdx].width; x++){
				if(MyLevel2.layers[layerIdx].data[idx] != 0){
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}else if(cells[layerIdx][y][x] != 1){
					cells[layerIdx][y][x] = 0;
				}
				idx++;
			}
		}
	}
}

/** Axis Aligned Bounding Box checks **/
function intersects(x1, y1, w1, h1, x2, y2, w2, h2){
	if(y2 + h2 < y1 || x2 + w2 < x1 || x2 > x1 + w1 || y2 > y1 + h1){
		return false;
	}else
		return true;
}

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

function tileToPixel(tileCoord){
	return tileCoord * TILE;
}

function pixelToTile(pixel){
	return Math.floor(pixel / TILE);
}

function cellAtTileCoord(layer, tx, ty){
	if(tx<0 || tx>=MAP.tw || ty<0){
		return 1;
	}
	if(ty>=MAP.th){
		return 0;
	}
	return cells[layer][ty][tx];
}

function cellAtPixelCoord(layer, x, y){
	var tx = pixelToTile(x);
	var ty = pixelToTile(y);
	
	return cellAtTileCoord(layer, tx, ty);
}

function drawBorderedRect(x, y, width, height, insideColour, borderColour, borderWidth){
	context.fillStyle = "" + borderColour;
	context.fillRect(x, y, width, height);
	context.fillStyle = "" + insideColour;
	context.fillRect(x + borderWidth, y + borderWidth, width - (borderWidth * 2), height - (borderWidth * 2));
}

function drawMap(/*offsetX, offsetY*/){
	for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++){
		var idx = 0;
		for( var y = 0; y < MyLevel2.layers[layerIdx].height; y++ ){
			for( var x = 0; x < MyLevel2.layers[layerIdx].width; x++ ){
				if( MyLevel2.layers[layerIdx].data[idx] != 0 ){
					var tileIndex = MyLevel2.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
					//var dx = - offsetX;
					//var dy = - offsetY;
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, x*TILE, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

function gameOver(){
	gameOverBool = true;
	drawBorderedRect(0, 0, canvas.width, canvas.height, "Black", "White", 5);
	context.fillStyle = "White";
	context.font = "100px ONYX";
	context.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
	context.font = "50px ONYX";
	if(winner != "No winner yet!"){
		context.fillText("Congratulations, " + winner, canvas.width / 2, canvas.height / 2 + 50)
	}else{
		context.fillText("There was a draw!", canvas.width / 2, canvas.height / 2 + 50)
	}
	
	player.isDead = true;
	enemy.isDead = true;
	
	if(gameTimer >= 0){
		gameTimer = 0;
	}
}

var fps = 0;
var fpsCount = 0;
var fpsTime = 0;



function run()
{
	context.fillStyle = "#ccc";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();
	if(deltaTime > 0.03){
		deltaTime = 0.03;
	}
	
	gameTimer += deltaTime;
	
	for (var b = 0; b < player.bullets.length; b++){
		var hitp = intersects(player.bullets[b].xPos - player.bullets[b].width / 2, player.bullets[b].yPos - player.bullets[b].height / 2, player.bullets[b].width, player.bullets[b].height,enemy.position.x - enemy.width / 2, enemy.position.y - enemy.height / 2, enemy.width, enemy.height);
		if(hitp == true){
			//enemy.lives -= 1;
		}
	}
	
	drawMap();
	drawBorderedRect(0, canvas.height - 100, canvas.width, 100, "black", "White", 5);
	
	if((player.position.x >= canvas.width / 2 - TILE && player.position.x <= canvas.width / 2 + 70) && (player.position.y >= 64 && player.position.y <= 64 + 110)){
		if(enemy.isDead){
			winner = "Player!";
			gameOver();
		}else{
			context.fillStyle = "black";
			context.font = "100px ONYX";
			context.fillText("Locked!", player.position.x + player.width / 2 + 10, player.position.y);
		}
	}
	
	if(gameOverBool){
		gameOver();
	}
	
	if((enemy.position.x >= canvas.width / 2 - TILE && enemy.position.x <= canvas.width / 2 + 70) && (enemy.position.y >= 64 && enemy.position.y <= 64 + 110)){
		if(player.isDead){
			winner = "Enemy!";
			gameOver();
		}else{
			context.fillStyle = "black";
			context.font = "100px ONYX";
			context.fillText("Locked!", enemy.position.x + enemy.width / 2 + 10, enemy.position.y);
		}
	}
	
	var text = "Game Time: " + Math.floor(gameTimer) + " || Winner: " + winner;
	context.beginPath();
	context.fillStyle = "#FFFFFF";
	context.font="70px ONYX";
	if(!gameOverBool){
		context.fillText(text, canvas.width / 2 - 250, canvas.height - 20);
	}
	
	for(var i = 0; i < player.lives; i++){
		if(!gameOverBool)
			context.drawImage(heart, player.position.x + player.width/ 2 - ((heart.width+5) * i) - 15, player.position.y - player.height - 15);
	}
	
	for(var i = 0; i < enemy.lives; i++){
		if(!gameOverBool)
			context.drawImage(heart2, enemy.position.x + enemy.width/ 2 - ((heart.width+5) * i) - 15, enemy.position.y - enemy.height - 15);
	}
	
	player.update(deltaTime);
	player.draw();
	
	enemy.update(deltaTime);
	enemy.draw();
	
	//enemies.update(deltaTime);
	//enemies.draw();
	
	//context.beginPath();
	//context.strokeRect(player.position.x, player.position.y, TILE, TILE);
	//context.strokeRect(canvas.width / 2, 64, 70, 110);
	
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#000000";
	context.font="20px Verdana";
	//context.fillText("FPS: " + fps, 5, 20, 100);
}

initialize();
//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
