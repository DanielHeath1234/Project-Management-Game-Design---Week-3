var canvas = document.getElementById("gameCanvas");

var dirLeft = 0;
var dirRight = 1;

var player = function()
{
	this.xPos = 0,
	this.yPos = 0,
	this.direction = dirRight,
	
	this.height = 0,
	this.width = 0,
	
	this.speed = 0,
	this.jumpHeight = 0,
	
	this.onGround = false,
	this.isMoving = false,
	this.isDead = false,
	this.isClimbing = false
}

Player.prototype.update = function(deltaTime)
{
	
}

Player.prototype.draw = function()
{
	
}