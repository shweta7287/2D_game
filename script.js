window.addEventListener("load", function () {
  const tune = new Audio("shoot02wav-14562.mp3")
  const luckyCollide = new Audio("086354_8-bit-arcade-video-game-start-sound-effect-gun-reload-and-jump-81124.mp3")
  const hitEnemy = new Audio("negative_beeps-6008.mp3")
  const hitEnemyPlayer = new Audio("080205_life-lost-game-over-89697.mp3")
  const hive = new Audio("big-impact-7054.mp3");
  const victory = new Audio("goodresult-82807.mp3")
  const back = new Audio("orcs-loop-21568.mp3")

  //canvas setup
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d"); //A built in object that conatins all methods and properties that allows us to draw animate colors,shapes and other graphics on the html canvas
  canvas.width = 1500;
  canvas.height = 500;

  class InputHandler {
    constructor(game) {
      this.game = game;
      //On the keydown event i check if the key that was pressed is arrow up and at the same time arrowup is not yet in the array only then push the arrowup key in this.game.keys.array
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
          this.game.keys.indexOf(e.key) === -1
        ) {
          this.game.keys.push(e.key);
        } else if (e.key === " ") {
          tune.play();
          this.game.player.shootTop();
        } else if (e.key === "d") {
          this.game.debug = !this.game.debug;
        } 
      });
      // On the keyup event i check if the key we are releasing is present in the array the remove it using the splice method
      window.addEventListener("keyup", (e) => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
      });
    }
  }
  class Projectile {
    //Handle the laser
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 3;
      this.speed = 3;
      this.markedForDeletion = false;
      this.image = document.getElementById("projectile");
      
    }
    update() {
      //increase horizontal x coordinates by speed given in the object
     
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y );
    }
  }
  class Particle {
    //Falling screws and bolts that comes from the damaged enemies
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById('gears');
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1;
      this.bounced = false;
      this.bottomBouncedBoundary = Math.random() * 80 + 60;
    }
    update() {
      this.angle += this.va;
      this.speedY += this.gravity;
      this.x -= this.speedX + this.game.speed;
      this.y += this.speedY;
      if (this.y > this.game.height + this.size || this.x < 0 - this.size) {
        this.markedForDeletion = true;
      }
      if(this.y > this.game.height - this.bottomBouncedBoundary && this.bounced < 2) {
        this.bounced++;
        this.speedY *= -0.5;
      }
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(this.image,this.frameX * this.spriteSize,this.frameY * this.spriteSize,this.spriteSize,
                        this.spriteSize, this.size * -0.5, this.size * -0.5,this.size,this.size);
      context.restore();

    }
  }
  class Player {
    //animate player character
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20; //horizontal position
      this.y = 140; //vertical position
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
      this.speedY = 0;
      this.maxSpeed = 5;
      this.projectiles = [];
      this.image = document.getElementById("player");
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
     
    }
    update(deltaTime) {
      //To move around
      if (this.game.keys.includes("ArrowUp") && this.y >= 20)
        this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown") && this.y <= 350)
        this.speedY = this.maxSpeed;
      else this.speedY = 0;
      this.y += this.speedY; //Increasing vertical y position by speedY

      //handle projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update();
      });
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
      // sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
      //power up
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0;
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1;
          this.game.ammo += 0.1;
        }
      }
    }
    draw(context) {
      //Draw graphics by representing the player this will specify which canvas element we want to draw

      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 30)
        );
        this.game.ammo--;
      }
      if (this.powerUp) this.shootBottom();
    }

    shootBottom() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 175)
        );
      }
    }

    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      if(this.game.ammo < this.game.maxAmmo)this.game.ammo = this.game.maxAmmo;
    }
  }
  class Enemy {
    //Handle different enemy types
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -3.0 - 1.0;
      this.markedForDeletion = false;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }
    update() {
      this.x += this.speedX - this.game.speed;
      if (this.x + this.width < 0) {
        this.markedForDeletion = true;
      }
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }
    draw(context) {
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      if (this.game.debug) {
        context.font = "20px Helvetica";
        context.fillText(this.lives, this.x, this.y);
      }
    }
  }
  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.lives = 5;
      this.score = this.lives;
      this.y = Math.random() * (this.game.height * 0.99 - this.height + 20);
      this.image = document.getElementById("angler1");
      this.frameY = Math.floor(Math.random() * 3);
    }
  }
  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.lives = 3;
      this.score = this.lives;
      this.y = Math.random() * (this.game.height * 0.99- this.height + 20);
      this.image = document.getElementById("angler2");
      this.frameY = Math.floor(Math.random() * 3);
    }
  }
  class LuckyFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.lives = 1;
      this.score = this.lives;
      this.y = Math.random() * (this.game.height * 0.99 - this.height + 20);
      this.image = document.getElementById("lucky");
      this.frameY = Math.floor(Math.random() * 2);
      this.score = 15;
      this.type = "lucky";
    }
  }
  class hiveWhale extends Enemy {
    constructor(game) {
      super(game);
      this.width = 400;
      this.height = 227;
      this.lives = 15;
      this.score = this.lives;
      this.y = Math.random() * (this.game.height * 0.99 - this.height + 20);
      this.image = document.getElementById("hiveWhale");
      this.frameY = 0;
      this.type = "hive";
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  class Layer {
    //handle individual backround layers in our parallax
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 800;
      this.x = 0;
      this.y = 0;
    }

    update() {
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.speed * this.speedModifier;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }
  class Background {
    //Pull all object layers to animate entire game
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }
    update() {
      this.layers.forEach((layer) => layer.update());
    }
    draw(context) {
      this.layers.forEach((layer) => layer.draw(context));
    }
  }
   class Explosion{
    constructor(game, x, y) {
      this.game = game;
      this.frameX = 0;
      this.spriteHeight = 200;
      this.spriteWidth = 200;
      this.fps = 15;
      this.timer = 0;
      this.interval = 1000/this.fps;
      this.markedForDeletion = false;
      this.maxFrame = 8;
      this.height = this.spriteHeight; 
      this.width = this.spriteWidth;
      this.x = x - this.width * 0.5;
      this.y = y - this.height * 0.5;
    
    }
    update(deltaTime) {
      if(this.timer > this.interval){
        this.frameX++;
        this.timer = 0;
      } else{
        this.timer += deltaTime;
      }
      if(this.frameX > this.maxFrame) this.markedForDeletion = true;
    }

    draw(context) {
      context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteHeight, this.spriteWidth, this.x, this.y, this.width, this.height);
    
    }
   }
   class SmokeExplosion extends Explosion{
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById('smokeExplosion');

    }


   }

   class FireExplosion extends Explosion{
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById('fireExplosion');
      
      
    }

   }





  class UI {
    // Display timer, score and information needs to displayed for the user
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Bangers";
      this.color = "papayawhip";
    }
    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontSize + "px " + this.fontFamily;
      //score
      context.fillText("Score: " + this.game.score, 20, 40);

      //Timer
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer : " + formattedTime, 20, 100);
      
      //stamina
      context.fillText("Stamina: " + this.game.stamina, 1250, 40);

      //game over message
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        if (this.game.score > this.game.winningScore) {
         
          message1 = "Most wondrous!";
          message2 = "Well done explorer";
        } else {
          message1 = "Blazes ! ";
          message2 = "Get my repair kit and try again !";
        }

        context.font = "100px " + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 40
        );
        context.font = "60px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 40
        );
      }
      //ammo
      if (this.game.player.powerUp) context.fillStyle = "#ffffbd";
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 15);
      }

      context.restore();
    }
  }

  class Game {
    // Brain of the project
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.keys = []; //keys that are currently active
      this.enemies = []; //hold all current enemy objects
      this.particles = [];
      this.explosions = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;
      this.ammo = 20;
      this.maxAmmo = 40;
      this.ammoTimer = 0;
      this.ammoInterval = 500;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 100;
      this.gameTime = 0;
      this.timeLimit = 15000;
      this.speed = 1;
      this.debug = false;
      this.stamina = 3;
      this.maxStamina = 3;
    }
    update(deltaTime) {
      if (!this.gameOver){
         this.gameTime += deltaTime;
         back.play();
      }
      if (this.stamina <= 0 ||  this.score > this.winningScore){
        victory.play();
       this.gameOver = true;
       setTimeout(function(){
       victory.play();
    
        setTimeout(function(){
           victory.pause();
           victory.currentTime = 0;
        }, 2000);
    }, 1000);
      }
    
        
      this.background.update();
      this.background.layer4.update();

      this.player.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }

      this.particles.forEach(particle => particle.update());
      this.particles = this.particles.filter(
        particle => !particle.markedForDeletion
      );
      this.explosions.forEach(explosion => explosion.update(deltaTime));
      this.explosions = this.explosions.filter(
        explosion => !explosion.markedForDeletion
      );

      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
          this.addExplosion(enemy);
          if(!this.gameOver){
            for (let i = 0; i < 10; i++) {
              this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            }
          }

          if( enemy.type !=="lucky" && this.stamina > 0  && !this.gameOver ){
            hitEnemyPlayer.play();
            this.stamina--;
          }
          else if(enemy.type === "lucky" && !this.gameOver){
            luckyCollide.play();
            this.stamina = this.maxStamina;
            this.player.enterPowerUp();
            
          }
          else if(!this.gameOver && this.score >0){ 
            this.score--;
           
          }
        }

        this.player.projectiles.forEach(projectile => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            if(!this.gameOver){
            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            }
            if (enemy.lives <= 0) {
              for (let i = 0; i < 10; i++) {
                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
              }
              enemy.markedForDeletion = true;
              this.addExplosion(enemy);
              if (!this.gameOver && enemy.type !='lucky') {
                hitEnemy.play();
                this.score += enemy.score;
                if(enemy.type == 'hive'){
                  hive.play();

                }
              }
              if(enemy.type == 'lucky' &&!this.gameOver  && this.score > 0) this.score -=1;
              if (this.stamina <= 0) this.gameOver = true;
            }
          }
        });
      });
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }
    draw(context) {
      this.background.draw(context);
      this.ui.draw(context);
      this.player.draw(context);
      this.particles.forEach(particle => particle.draw(context));
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.explosions.forEach((explosion) => {
        explosion.draw(context);
      });
      this.background.layer4.draw(context);
    }

    addEnemy() {
      const randomize = Math.random() * 0.5;
     if (randomize < 0.01) this.enemies.push(new hiveWhale(this));
      else if (randomize < 0.2) this.enemies.push(new Angler1(this));
      else if (randomize < 0.28) this.enemies.push(new LuckyFish(this));
      else if (randomize < 0.4) this.enemies.push(new Angler2(this));
    }

    addExplosion(enemy) {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5 , enemy.y + enemy.height * 0.5));
       } 
      else {
         this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5 , enemy.y + enemy.height * 0.5));
       }

    }
    checkCollision(rect1, rect2) {
      return (
        
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
      );
    }
  }
  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime; // deltaTime stores the timeStamp from this loop and this timeStamp from previous loop
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx); //which canvas element we are drawing
    requestAnimationFrame(animate); // Tells browser that we wish to perform an animation and it request that the browser calls a specified function to update an animation before the next repaint//we will pass here animate its parent function to create an endless loop
    // requestAnimationFrame has a feature that it automaticaaly passes timeStamp as an argument to the function it calls
  }
  animate(0);
});


// if player collide with lucky fish then increase the stamina by maxstamina and projectile will doubled
//if player harm the lucky fish then decrese the score by 1

//if player collide with other than lucky fish then decrese the score by 1 
//if play kills the other fish then increse the score by its lives