var canvas = document.getElementById("gameCanvas");

var LEFT = 0;
var RIGHT = 1;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_IDLE_RIGHT = 3;
var ANIM_JUMP_RIGHT = 4;
var ANIM_WALK_RIGHT = 5;
var ANIM_CLIMB = 6;
var ANIM_SHOOT_LEFT = 7;
var ANIM_SHOOT_RIGHT = 8;
var ANIM_MAX = 9;

var moveLeft = false;
var moveRight = false;
var enemyJump = false;

var Enemy = function() {
	this.sprite = new Sprite("Art/ChuckNorris2.png");
	this.sprite.buildAnimation(12, 8, 165, 126, 0.10, [0, 1, 2, 3, 4, 5, 6, 7]);//idle left
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [8, 9, 10, 11, 12]);// LEFT_JUMP
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);//LEFT_WALK
	this.sprite.buildAnimation(12, 8, 165, 126, 0.10, [52, 53, 54, 55, 56, 57, 58, 59]);//RIGHT IDLE
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [60, 61, 62, 63, 64]);//RIGHT JUMP
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);//RIGHT WALK
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 51]);//climb
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);//shoot left
	this.sprite.buildAnimation(12, 8, 165, 126, 0.05, [79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92]);//shoot right

	this.position = new Vector2();
	this.position.set(canvas.width - 55, canvas.height - 200);
	
	this.width = 119;
	this.height = 103;
	
	this.isDead = false;
	
	for(var i=0; i<ANIM_MAX; i++){
	if(!this.isDead){
			this.sprite.setAnimationOffset(i, -this.width/2, -this.height + 14);
		}
	}
	
	this.jumping = false;
	this.falling = false;
	this.shooting = false;
	this.climbing = false;
	
	this.bulletTimer1 = 0;
	this.bullets1 = [];
	
	this.velocity = new Vector2();
	
	this.rotation = 0;
	
	this.direction = LEFT;
	
	this.lives = 3;
	
	this.collidedLeft = false;
	this.collidedRight = false;
};

Enemy.prototype.update = function(deltaTime){
	if(!this.isDead){
		this.sprite.update(deltaTime);
		this.bulletTimer1 -= deltaTime;

		var acceleration = new Vector2();
		var EnemyAccel = 3000;
		var EnemyDrag = 7;
		var EnemyGravity = TILE * 9.8 * 6;
		var jumpForce = 50000;
		
		moveLeft = false;
		moveRight = false;
		
		if(!this.climbing){
			acceleration.y = EnemyGravity;	
		}
		
		var currFrame = this.sprite.currentFrame;
		
		if(this.lives <= 0){
			this.isDead = true;
		}
		
		if(keyboard.isKeyDown(keyboard.KEY_LEFT) == true  || moveLeft){
			acceleration.x -= EnemyAccel;
			left = true;
			this.direction = LEFT;
			if(this.sprite.currentAnimation != ANIM_WALK_LEFT && this.jumping == false && this.falling == false)
				this.sprite.setAnimation(ANIM_WALK_LEFT);
		}else if(keyboard.isKeyDown(keyboard.KEY_RIGHT) == true || moveRight){
			acceleration.x += EnemyAccel;
			right = true;
			this.direction = RIGHT;
			if(this.sprite.currentAnimation != ANIM_WALK_RIGHT && this.jumping == false && this.falling == false)
				this.sprite.setAnimation(ANIM_WALK_RIGHT);
		}else if(keyboard.isKeyDown(190) == true ){
			if ( this.bulletTimer1 < 0 ){
				this.bullets1.push(new Bullet(this.position.x, this.position.y, this.direction));
				this.bulletTimer1 = 0.25;
			}
			if(this.direction == LEFT){  
				if(this.sprite.currentAnimation != ANIM_SHOOT_LEFT){
					this.sprite.setAnimation(ANIM_SHOOT_LEFT);
				}	
			}else{
				if(this.sprite.currentAnimation != ANIM_SHOOT_RIGHT){
					this.sprite.setAnimation(ANIM_SHOOT_RIGHT);
				}	
			}}else{
			if(this.jumping == false && this.falling == false){
				if(this.direction == LEFT){
					if(this.sprite.currentAnimation != ANIM_IDLE_LEFT)
					this.sprite.setAnimation(ANIM_IDLE_LEFT);
				}else{
					if(this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
					this.sprite.setAnimation(ANIM_IDLE_RIGHT);
				}
			}
		}
		
		if(this.jumping || this.falling ){
			if(this.direction == LEFT){
				if(this.sprite.currentAnimation != ANIM_JUMP_LEFT)
				this.sprite.setAnimation(ANIM_JUMP_LEFT);
			}else{
				if(this.sprite.currentAnimation != ANIM_JUMP_RIGHT)
				this.sprite.setAnimation(ANIM_JUMP_RIGHT);
			}
		}
		
		if ( this.velocity.y > 0 ){
			this.falling = true;
		}else{
			this.falling = false;
		}
		
		if ( keyboard.isKeyDown(keyboard.KEY_UP) && !this.jumping && !this.falling || enemyJump){
			acceleration.y -= jumpForce;
			this.jumping = true;
			if(this.direction == LEFT){
				this.sprite.setAnimation(ANIM_JUMP_LEFT)
			}else{
				this.sprite.setAnimation(ANIM_JUMP_RIGHT)
			}
		}
		
		var dragVector = this.velocity.multiplyScalar(EnemyDrag);
		dragVector.y = 0;
		acceleration = acceleration.subtract(dragVector);
		
		this.velocity = this.velocity.add(acceleration.multiplyScalar(deltaTime));
		this.position = this.position.add(this.velocity.multiplyScalar(deltaTime));
		
		var tx = pixelToTile(this.position.x);
		var ty = pixelToTile(this.position.y);
		
		var nx = this.position.x % TILE;
		var ny = this.position.y % TILE;
		
		var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);	
		var cellRight = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty);
		var cellDown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty+1);
		var cellDiag = cellAtTileCoord(LAYER_PLATFORMS, tx+1, ty+1);
		
		if (cellAtTileCoord(LAYER_LADDERS, tx, ty) || (cellAtTileCoord(LAYER_LADDERS, tx+1, ty) && nx) || (cellAtTileCoord(LAYER_LADDERS, tx, ty+1) && ny)){
			if(this.sprite.currentAnimation != ANIM_CLIMB){
				this.sprite.setAnimation(ANIM_CLIMB);
				this.sprite.currentFrame = currFrame;
			}		
			if(keyboard.isKeyDown(keyboard.KEY_UP)){
				this.velocity.y = -500;
			}else if(keyboard.isKeyDown(keyboard.KEY_DOWN)){
				this.velocity.y = 300;
			}else{
				this.velocity.y = 0;
			}
			this.climbing = true;
		}else{
			this.climbing = false;
		}
		
		if(this.velocity.y > 0 ){//down
			if((cellDown && !cell) || (cellDiag && !cellRight && nx)){
				this.position.y = tileToPixel(ty);
				this.velocity.y = 0;
				this.jumping = false;
				ny = 0;
			}
		}else if(this.velocity.y < 0){//up
			if((cell && !cellDown) || (cellRight && !cellDiag && nx)){
				if(this.climbing){
					this.position.y -= this.height;
				}else{
					this.position.y = tileToPixel(ty + 1);
					this.velocity.y = 0;
					
					cell = cellDown;
					cellRight = cellDiag;
					cellDown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 2);
					cellDiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 2);
					ny = 0;
				}
			}
		}	
		
		if(this.velocity.x > 0){//right
			if((cellRight && !cell) || (cellDiag && !cellDown && ny)){
				this.position.x = tileToPixel(tx)/* - this.width/2*/;
				this.velocity.x = 0;
				this.collidedRight = true;
				this.collidedLeft = false;
			}
		}else if(this.velocity.x < 0){//left
			if((cell && !cellRight) || (cellDown && !cellDiag && ny)){
				this.position.x = tileToPixel(tx + 1)/* + this.width/2*/;
				this.velocity.x = 0;
				this.collidedLeft = true;
				this.collidedRight = false;
			}
		}
	}
	for ( var b = 0 ; b < this.bullets1.length ; ++b)
	{
		this.bullets1[b].update(deltaTime);
		
		if ( this.bullets1[b].isDead )
		{
			this.bullets1[b] = this.bullets1[this.bullets1.length-1];
			this.bullets1.length -= 1;
		}
	}
}

Enemy.prototype.draw = function(){
	if(!this.isDead){
		this.sprite.draw(context, this.position.x, this.position.y);
		for (var b = 0; b < this.bullets1.length; b++){
			this.bullets1[b].draw();
		}
	}
}