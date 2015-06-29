var Bullet = function(x, y, moveRight)
{
	this.sprite = document.createElement("img")
	this.sprite.src = "Art/laser.png";

	this.position = new Vector2();
	this.position.set(x, y);
	
	this.velocity = new Vector2();
	
	this.moveRight = moveRight;
	
	if(this.moveRight){
		this.velocity.set(500 *2, 0);
	}else{
		this.velocity.set(-500 *2, 0);
	}
	
	this.isDead = false;
}

Bullet.prototype.update = function(deltaTime){
	this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
	if ( this.position.x < 0 || this.position.x > MAP.tw * TILE)
	{
		isDead = true;
	}
}

Bullet.prototype.draw = function(){
	context.drawImage(this.sprite, this.position.x, this.position.y);
}