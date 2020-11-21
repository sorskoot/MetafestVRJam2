import { levels } from '../classes/levels'
import { InitAudio, sound, soundfx } from '../classes/sound'

const GAMESTATE_TITLE = 0;
const GAMESTATE_PLAY = 1;
const GAMESTATE_GAMEOVER = 2;
const ZeroVector = new THREE.Vector3();

AFRAME.registerComponent('game', {
   schema: {},
   init: function () {
      this.camera = document.querySelector('[camera]');
      this.musicIntro = document.getElementById('music-intro');
      this.musicIntro.loop = true;
      this.musicIntro.volume = .5;
      this.musicGame = document.getElementById('music-game');
      this.musicGame.loop = true;
      this.musicGame.volume = .5;

      this.world = document.getElementById('world');
      this.lefthand = document.getElementById('left-hand');
      this.righthand = document.getElementById('right-hand');
      this.titlescreen = document.getElementById('title-screen');
      this.gameoverscreen = document.getElementById('gameover-screen');
      this.scorescreen = document.getElementById('score-screen');
      this.scoreOrb = document.getElementById('orb-score');
      this.scoreLoop = document.getElementById('loop-score');
      this.scoreTimer = document.getElementById('timer');
      this.orbscontainer = document.getElementById('orbs-container');

      for (let i = 0; i < 500; i++) {
         const z = Math.random() * 360;
         if ((z > 5 && z < 175) || (z > 185 && z < 355)) {
            const coneRoot = document.createElement('a-entity')
            const cone = document.createElement('a-entity');
            cone.setAttribute('geometry', `primitive: cone; radiusBottom: 1; radiusTop: 0; height:${Math.random() * 4 + 3}`);
            cone.setAttribute('position', '0 20 0');
            cone.setAttribute('pixel-material', 'index:0;repeat:5 10;')
            coneRoot.appendChild(cone);
            coneRoot.setAttribute('rotation',
               {
                  x: Math.random() * 180,
                  y: 0,
                  z: z
               });
            this.world.appendChild(coneRoot);
         }
      }

      this.isMusicPlaying = false;
      this.el.addEventListener('enter-vr', () => {
         InitAudio();
         this.musicGame.pause();
         this.musicIntro.play();
         this.camera.object3D.position.y=2;
      });
      this.reset();
      this.gamestate = GAMESTATE_TITLE;
      this.updateScreens();

   },
   update: function (oldData) { },
   tick: function (time, timeDelta) {
      if (timeDelta === 0 || this.gamestate !== GAMESTATE_PLAY) return;
      this.world.setAttribute('rotation', { x: this.rotation });
      this.world.setAttribute('position', { y: -20 - this.jumpHeight });
      this.rotation = this.rotation + this.speed;

      if (this.checkWallCollision()){
         this.timer = 0;
         this.orbscontainer.innerHTML = ''
         sound.play(soundfx.gameover);
         this.gamestate = GAMESTATE_GAMEOVER;
         this.updateScreens();
         return;
      } 

      if (this.rotation > 360) {
         this.rotation -= 360;
         if (this.jumpHeight < 5) {
            this.score.loops++;
            sound.play(soundfx.checkpoint);
            this.updateScore();
            this.createLevel(this.score.loops);
         }
      }
      this.updateSpeed(timeDelta);

      if (this.isRunning) {
         this.timer -= timeDelta;
         if (this.timer <= 0) {
            this.timer = 0;
            this.orbscontainer.innerHTML = ''
            sound.play(soundfx.gameover);
            this.gamestate = GAMESTATE_GAMEOVER;
            this.updateScreens();
         }
      }
      this.scoreTimer.setAttribute('text', { value: (~~this.timer) / 1000 });
   },
   tock: function (time, timeDelta, camera) { },
   remove: function () { },
   pause: function () { },
   play: function () { },
   updateSchema: function (data) { },

   updateSpeed: function (timeDelta) {
      const ly = this.lefthand.object3D.position.y;
      const ry = this.righthand.object3D.position.y;
      const dif = (ly - ry);
      const newSpeed = Math.abs(this.prevDif - dif) / timeDelta * 100;
      if (newSpeed > 0) this.isRunning = true;
      let slowdownSpeed = 0.002;
      const speedupspeed = 0.05;
      const maxspeed = 1;
      const jumpspeed = .04;
      const fallspeed = .1;
      if (!this.isReadyToJump) {
         slowdownSpeed = 0;
      }
      this.speed = newSpeed < this.speed ? Math.max(this.speed - slowdownSpeed, 0) : Math.min(Math.min(this.speed + speedupspeed, newSpeed), maxspeed);
      this.prevDif = dif;

      const avg = (ly + ry) / 2;
      const deltaAvg = avg - this.prefAvg;

      if (this.isReadyToJump) {
         if (deltaAvg > .02) { // moving Up;         
            if (deltaAvg > .03 && !this.jumping) {
               sound.play(soundfx.jump);
               this.jumping = true;
            }
            this.deltaJump += jumpspeed;//jump
         } else {
            this.isReadyToJump = false;
         }
      } else {
         this.deltaJump = Math.max(0, this.deltaJump - jumpspeed * 2);
      }

      this.jumpHeight += this.deltaJump;
      this.jumpHeight = Math.max(0, this.jumpHeight - fallspeed);
      if (this.jumpHeight === 0) {
         if (this.jumping === true) {
            sound.play(soundfx.land);
         }
         this.isReadyToJump = true;
         this.jumping = false;
      }
      this.prefAvg = avg;
   },

   updateScore: function () {
      this.scoreOrb.setAttribute('text', { value: this.score.orbs });
      this.scoreLoop.setAttribute('text', { value: this.score.loops });
   },

   createLevel: function (index = 0) {
      this.orbscontainer.innerHTML = '';
      this.orbs = [];
      this.platforms = [];
      if (index >= levels.length - 1) index = levels.length - 1;
      this.timer = levels[index].levelTime;

      for (let i = 0; i < levels[index].orbs.length; i++) {
         const orb = levels[index].orbs[i];
         const orbElement = document.createElement("a-entity");
         orbElement.setAttribute('mixin', 'orb');
         const orbRot = (Math.PI / 180) * orb.rot;
         const y = Math.cos(orbRot) * (22 + orb.height);
         const z = -Math.sin(orbRot) * (22 + orb.height);
         orbElement.setAttribute('position', { x: orb.offset, y, z })
         this.orbscontainer.appendChild(orbElement);
         orbElement.rotation = orbRot;
         this.orbs.push(orbElement);
      }

      for (let i = 0; i < levels[index].obstacles.length; i++) {
         const platform = levels[index].obstacles[i];
         const platformElement = document.createElement("a-entity");
         const platformElementContainer = document.createElement("a-entity");
         switch (platform.type) {
            case 1:
               platformElement.setAttribute('mixin', 'platform1');
               platformElement.setAttribute('position', '0 21 0');
               break;
            case 2:
               platformElement.setAttribute('mixin', 'platform2');
               platformElement.setAttribute('position', '0 21.5 0');
               break;
            case 3:
               platformElement.setAttribute('mixin', 'platform3');
               platformElement.setAttribute('position', '0 22 0');
               break;
            case 4:
               platformElement.setAttribute('mixin', 'platform4');
               platformElement.setAttribute('position', '1 24 0');
               break;
            case 5:
               platformElement.setAttribute('mixin', 'platform4');
               platformElement.setAttribute('position', '-1 24 0');
               break;
            case 6:
               platformElement.setAttribute('mixin', 'platform3');
               platformElement.setAttribute('position', '0 24 0');
               break;
         }

         platformElementContainer.setAttribute('rotation',
            {
               x: -platform.rot,
               y: 0,
               z: 0
            });
         platformElementContainer.appendChild(platformElement)
         this.orbscontainer.appendChild(platformElementContainer);
         platformElement.rotation = platform.rot;
         platformElement.type = platform.type;
         this.platforms.push(platformElement);
      }
   },

   getOrbs: function () {
      return this.orbs;
   },

   addOrbScore: function (orb) {
      this.orbs.splice(orb, 1);
      sound.play(soundfx.orb);
      this.score.orbs++;
      this.updateScore();
   },

   buttondown: function () {
      if (this.gamestate === GAMESTATE_PLAY) return;
      this.reset();
      this.gamestate = GAMESTATE_PLAY;
      this.updateScreens();
   },

   updateScreens: function () {
      switch (this.gamestate) {
         case GAMESTATE_GAMEOVER:
            this.musicGame.pause();
            setTimeout(() => { this.musicIntro.play() }, 2000);
            this.musicIntro.currentTime = 0;
            this.scorescreen.setAttribute('visible', 'false');
            this.gameoverscreen.setAttribute('visible', 'true');
            this.titlescreen.setAttribute('visible', 'false');
            break;
         case GAMESTATE_PLAY:
            this.musicGame.currentTime = 0;
            this.musicGame.play();
            this.musicIntro.pause();
            this.scorescreen.setAttribute('visible', 'true');
            this.gameoverscreen.setAttribute('visible', 'false');
            this.titlescreen.setAttribute('visible', 'false');
            break;
         case GAMESTATE_TITLE:
            this.musicGame.pause();
            this.musicIntro.play();
            this.scorescreen.setAttribute('visible', 'false');
            this.gameoverscreen.setAttribute('visible', 'false');
            this.titlescreen.setAttribute('visible', 'true');
            break;
      }
   },
   reset: function () {
      this.score = {
         loops: 0,
         orbs: 0
      }
      this.rotation = 0;
      this.timer = 25000;
      this.orbs = [];
      this.speed = 0;
      this.prevDif = 0;
      this.jumpHeight = 0;
      this.deltaJump = 0;
      this.isReadyToJump = true;
      this.isRunning = false;

      this.updateScore();
      this.createLevel();
   },
   checkWallCollision: function () {
      let collision = false;

      for (let i = 0; i < this.platforms.length; i++) {
         const platform = this.platforms[i];
         if(Math.abs(this.rotation - platform.rotation) < 1){           
            
            switch(platform.type){
               case 1:
                  if(this.jumpHeight < 1) return true;
                  break
               case 2:
                  if(this.jumpHeight < 1.5) return true;
                  break;
               case 3:
                  if(this.jumpHeight < 2) return true;
                  break;
               case 4:
                  var worldPos = this.camera.object3D.position;
                  if(worldPos.x > 0) return true;
                  break;                  
               case 5:
                  var worldPos = this.camera.object3D.position;
                  if(worldPos.x < 0) return true;
                  break;
               case 6:
                  var worldPos = this.camera.object3D.position;
                  if(worldPos.y > 1.8) return true;
                  break;
                  
            }
         }
      }

      return collision;
   }

});
