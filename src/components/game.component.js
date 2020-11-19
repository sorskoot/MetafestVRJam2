const GAMESTATE_TITLE = 0;
const GAMESTATE_PLAY = 1;
const GAMESTATE_GAMEOVER = 2;

AFRAME.registerComponent('game', {
   schema: {},
   init: function () {
      
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
      if (this.rotation > 360) {
         this.rotation -= 360;
         if (this.jumpHeight < 5) {
            this.score.loops++;
            this.updateScore();
         }
      }
      this.updateSpeed(timeDelta);
      if (this.isRunning) {
         this.timer -= timeDelta;
         if (this.timer <= 0) {
            this.timer = 0;
            this.orbscontainer.innerHTML = ''  
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
      if(newSpeed>0) this.isRunning = true;
      let slowdownSpeed = 0.002;
      const speedupspeed = 0.05;
      const maxspeed = 1;
      const jumpspeed = .1;
      const fallspeed = .35;
      if (!this.isReadyToJump) {
         slowdownSpeed = 0;
      }
      this.speed = newSpeed < this.speed ? Math.max(this.speed - slowdownSpeed, 0) : Math.min(Math.min(this.speed + speedupspeed, newSpeed), maxspeed);
      this.prevDif = dif;

      const avg = (ly + ry) / 2;
      const deltaAvg = avg - this.prefAvg

      // todo: prevent double/tripple/etc jump
      if (this.isReadyToJump) {
         if (deltaAvg > .02) { // moving Up;         
            this.deltaJump += jumpspeed//jump
         } else {
            this.isReadyToJump = false;
         }
      } else {
         this.deltaJump = Math.max(0, this.deltaJump - jumpspeed * 2);
      }
      this.jumpHeight += this.deltaJump;
      this.jumpHeight = Math.max(0, this.jumpHeight - fallspeed);
      if (this.jumpHeight === 0) {
         this.isReadyToJump = true;
      }
      this.prefAvg = avg;
   },

   updateScore: function () {
      this.scoreOrb.setAttribute('text', { value: this.score.orbs });
      this.scoreLoop.setAttribute('text', { value: this.score.loops });
   },

   createOrbs: function () {      
      this.orbscontainer.innerHTML = ''      
      this.orbs = []
      for (let i = 1; i < 16; i++) {
         const orb = document.createElement("a-entity");

         orb.setAttribute('mixin', 'orb');
         const orbRot = (2 * Math.PI) / 16 * i;
         const y = Math.cos(orbRot) * 22;
         const z = -Math.sin(orbRot) * 22;
         orb.setAttribute('position', { x: 0, y, z })
         this.orbscontainer.appendChild(orb);
         orb.rotation = orbRot;
         this.orbs.push(orb);
      }
   },

   getOrbs: function () {
      return this.orbs;
   },

   addOrbScore: function () {
      this.score.orbs++;
      this.updateScore();
   },

   buttondown: function(){
      if(this.gamestate === GAMESTATE_PLAY) return;
      this.reset();
      this.gamestate = GAMESTATE_PLAY;
      this.updateScreens();
   },

   updateScreens:function(){
      switch(this.gamestate){
         case GAMESTATE_GAMEOVER:
            this.scorescreen.setAttribute('visible','false');
            this.gameoverscreen.setAttribute('visible','true');
            this.titlescreen.setAttribute('visible','false');
            break;
         case GAMESTATE_PLAY:
            this.scorescreen.setAttribute('visible','true');
            this.gameoverscreen.setAttribute('visible','false');
            this.titlescreen.setAttribute('visible','false');
            break;
         case GAMESTATE_TITLE:
            this.scorescreen.setAttribute('visible','false');
            this.gameoverscreen.setAttribute('visible','false');
            this.titlescreen.setAttribute('visible','true');
            break;
      }
   },
   reset:function(){
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
      
      this.createOrbs();
   }

});
