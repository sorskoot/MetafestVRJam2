const { RedIntegerFormat } = require("three");

AFRAME.registerComponent('game', {
   schema: {},
   init: function () {
      this.world = document.getElementById('world');
      this.rotation = 0;
      this.timer = 25000;
      this.orbs = [];
      this.lefthand = document.getElementById('left-hand');
      this.righthand = document.getElementById('right-hand');
      this.scoreOrb = document.getElementById('orb-score')
      this.scoreLoop = document.getElementById('loop-score')
      this.scoreTimer = document.getElementById('timer')
      this.score = {
         loops: 0,
         orbs: 0
      }
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
      this.speed = 0;
      this.prevDif = 0;
      this.jumpHeight = 0;
      this.deltaJump = 0;
      this.isReadyToJump = true;
      this.isRunning = false;
      this.createOrbs();
   },
   update: function (oldData) { },
   tick: function (time, timeDelta) {
      if (timeDelta === 0) return;
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
            // GAME OVER!
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
      //<a-entity position="-1.5 -22 0" ></a-entity>
      this.orbs = []
      for (let i = 1; i < 16; i++) {
         const orb = document.createElement("a-entity");

         orb.setAttribute('mixin', 'orb');
         const orbRot = (2 * Math.PI) / 16 * i;
         const y = Math.cos(orbRot) * 22;
         const z = -Math.sin(orbRot) * 22;
         orb.setAttribute('position', { x: 0, y, z })
         this.world.appendChild(orb);
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
   }

});





// export default class Game {
//     constructor() {

//         this.controller = {
//             /** @type {AbstractMesh} */
//             left: null,
//             /** @type {AbstractMesh} */
//             right: null
//         };
//         /** @type {Engine} */
//         var engine = null;
//         /** @type {Scene} */
//         var scene = null;
//         /** @type {Scene} */
//         var sceneToRender = null;
//         /** @type {Mesh} */
//         this.GUIPlane = null;

//         /** @type {TextBlock} */
//         this.score = null;
//         /** @type {Mesh} */
//         this.world = null;


//         try {
//             engine = this.createDefaultEngine();
//         } catch (e) {
//             console.log("the available createEngine function failed. Creating the default engine instead");
//             engine = createDefaultEngine();
//         }
//         if (!engine) throw 'engine should not be null.';
//         this.createScene(engine).then(returnedScene => {
//             sceneToRender = returnedScene;

//             sceneToRender.registerBeforeRender(() => {
//                 //time += scene.deltaTime;
//                 if (this.controller.right) {
//                     const c = Vector3.Dot(this.controller.left.position.normalize(), this.controller.right.position.normalize());
//                     this.score.text = `c:${c}`;
//                 }
//                 //if (this.world) {
//                 this.world.rotate(Vector3.Right(), -sceneToRender.deltaTime / 10000, Space.WORLD);
//                 //}
//             });

//             engine.runRenderLoop(() => {

//                 if (sceneToRender && sceneToRender.activeCamera) {
//                     sceneToRender.render();
//                 }

//             })
//         });
//         // Resize
//         window.addEventListener("resize", function () {
//             engine.resize();
//         });
//     }

//     async createScene(engine) {
//         const canvas = document.getElementById('renderCanvas');
//         // This creates a basic Babylon Scene object (non-mesh)        
//         var scene = new Scene(engine);
//         scene.gravity = new Vector3(0, -9.81, 0);
//         //Inspector.Show(scene);
//         // This creates and positions a free camera (non-mesh)

//         var camera = new FreeCamera("camera1", new Vector3(0, 1.6, 0), scene);

//         // This targets the camera to scene origin
//         camera.setTarget(Vector3.Forward());

//         // This attaches the camera to the canvas
//         camera.attachControl(canvas, true);
//         camera.applyGravity = true;

//         this.world = new Mesh("world", scene);

//         // GUI
//         this.GUIPlane = Mesh.CreatePlane("plane", 2, scene);
//         this.GUIPlane.position.y = .2;
//         var advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.GUIPlane);
//         this.score = new TextBlock('text', 'HELLO!')
//         advancedTexture.addControl(this.score);

//         // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
//         var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
//         light.parent = this.world;
//         // Default intensity is 1. Let's dim the light a small amount
//         light.intensity = 0.7;

//         var material = new GridMaterial("grid", scene);
//         // Our built-in 'sphere' shape.
//         var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 40, segments: 32 }, scene);
//         sphere.material = material;

//         sphere.setParent(this.world)
//         // Move the sphere upward 1/2 its height
//         //sphere.position.y = -20;

//         for (let i = 0; i < 250; i++) {
//             const o = new RandomEntity(scene, 'randomEntity' + i, new Vector3(0, 0, 0), 20);
//             o.mesh.parent = this.world;
//             o.mesh.material = material;
//         }

//         scene.createDefaultEnvironment();
//         // XR
//         const xrHelper = await scene.createDefaultXRExperienceAsync();
//         // xrHelper.baseExperience.camera.on
//         xrHelper.input.onControllerAddedObservable.add((controller, s) => {
//             this.controller[controller.inputSource.handedness] = controller.grip;
//             if (controller.inputSource.handedness == 'right') {
//                 this.GUIPlane.parent = controller.grip;
//             }
//             // controller.onMotionControllerInitObservable.add((motionController, s2) => {
//             //     if (motionController.handness === 'right') {
//             //         this.controller[motionController.handness] = motionController;
//             //     }
//             //     // e2.components['xr-standard-thumbstick'].onAxisValueChangedObservable.add((stickE,stickS)=>{
//             //     //     //     console.dir(stickE.x+'--'+stickE.y);
//             //     //     // });                
//             // });
//             // e.onMeshLoadedObservable.add((e3,s3)=>{
//             //     console.dir(e3);    
//             // })
//         });


//         this.world.position.set(0, -20, 0);

//         return scene;

//     }

//     createDefaultEngine() {
//         var canvas = document.getElementById("renderCanvas");
//         return new Engine(canvas, true, {
//             preserveDrawingBuffer: true, stencil: true
//         });
//     }
// }

