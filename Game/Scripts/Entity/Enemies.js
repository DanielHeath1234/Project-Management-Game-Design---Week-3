var Enemies = function(){
	this.image = document.createElement("img");
	this.image.src = "Art/laser.png";
	
	this.width = 0;
	this.height = 0;
}

Enemies.prototype.update = function(deltaTime){

}

Enemies.prototype.draw = function(){
	context.drawImage(this.image, 100 , 100);
}