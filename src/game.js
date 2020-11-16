import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { sceneHelpers } from "@babylonjs/core/Helpers"
import { Inspector } from "@babylonjs/inspector"
import { WebXRAbstractMotionController, WebXRDefaultExperience } from "@babylonjs/core/XR";
import { Color3, Color4, Space, Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { AbstractMesh, Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { GridMaterial } from "@babylonjs/materials/grid";
import * as GUI from "@babylonjs/gui/3D";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import { RenderingGroup } from "@babylonjs/core/Rendering/renderingGroup";
import { WebVRFreeCamera } from "@babylonjs/core/Cameras/VR/webVRCamera";
import RandomEntity from "./classes/randomEntity";
import { VRExperienceHelper } from "@babylonjs/core/Cameras/VR/vrExperienceHelper";
import { Ray } from "@babylonjs/core/Culling/ray";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

let lightsaber;

export default class Game {
    constructor() {

        this.controller = {
            /** @type {AbstractMesh} */
            left: null,
            /** @type {AbstractMesh} */
            right: null
        };
        /** @type {Engine} */
        var engine = null;
        /** @type {Scene} */
        var scene = null;
        /** @type {Scene} */
        var sceneToRender = null;
        /** @type {Mesh} */
        this.GUIPlane = null;

        /** @type {TextBlock} */
        this.score = null;
        /** @type {Mesh} */
        this.world = null;


        try {
            engine = this.createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            engine = createDefaultEngine();
        }
        if (!engine) throw 'engine should not be null.';
        this.createScene(engine).then(returnedScene => {
            sceneToRender = returnedScene;

            sceneToRender.registerBeforeRender(() => {
                //time += scene.deltaTime;
                if (this.controller.right) {
                    const c = Vector3.Dot(this.controller.left.position.normalize(), this.controller.right.position.normalize());
                    this.score.text = `c:${c}`;
                }
                //if (this.world) {
                this.world.rotate(Vector3.Right(), -sceneToRender.deltaTime / 10000, Space.WORLD);
                //}
            });

            engine.runRenderLoop(() => {

                if (sceneToRender && sceneToRender.activeCamera) {
                    sceneToRender.render();
                }

            })
        });
        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });
    }

    async createScene(engine) {
        const canvas = document.getElementById('renderCanvas');
        // This creates a basic Babylon Scene object (non-mesh)        
        var scene = new Scene(engine);
        scene.gravity = new Vector3(0, -9.81, 0);
        //Inspector.Show(scene);
        // This creates and positions a free camera (non-mesh)

        var camera = new FreeCamera("camera1", new Vector3(0, 1.6, 0), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Forward());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        camera.applyGravity = true;

        this.world = new Mesh("world", scene);

        // GUI
        this.GUIPlane = Mesh.CreatePlane("plane", 2, scene);
        this.GUIPlane.position.y = .2;
        var advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.GUIPlane);
        this.score = new TextBlock('text', 'HELLO!')
        advancedTexture.addControl(this.score);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.parent = this.world;
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        var material = new GridMaterial("grid", scene);
        // Our built-in 'sphere' shape.
        var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 40, segments: 32 }, scene);
        sphere.material = material;

        sphere.setParent(this.world)
        // Move the sphere upward 1/2 its height
        //sphere.position.y = -20;

        for (let i = 0; i < 250; i++) {
            const o = new RandomEntity(scene, 'randomEntity' + i, new Vector3(0, 0, 0), 20);
            o.mesh.parent = this.world;
            o.mesh.material = material;
        }

        scene.createDefaultEnvironment();
        // XR
        const xrHelper = await scene.createDefaultXRExperienceAsync();
        // xrHelper.baseExperience.camera.on
        xrHelper.input.onControllerAddedObservable.add((controller, s) => {
            this.controller[controller.inputSource.handedness] = controller.grip;
            if (controller.inputSource.handedness == 'right') {
                this.GUIPlane.parent = controller.grip;
            }
            // controller.onMotionControllerInitObservable.add((motionController, s2) => {
            //     if (motionController.handness === 'right') {
            //         this.controller[motionController.handness] = motionController;
            //     }
            //     // e2.components['xr-standard-thumbstick'].onAxisValueChangedObservable.add((stickE,stickS)=>{
            //     //     //     console.dir(stickE.x+'--'+stickE.y);
            //     //     // });                
            // });
            // e.onMeshLoadedObservable.add((e3,s3)=>{
            //     console.dir(e3);    
            // })
        });


        this.world.position.set(0, -20, 0);

        return scene;

    }

    createDefaultEngine() {
        var canvas = document.getElementById("renderCanvas");
        return new Engine(canvas, true, {
            preserveDrawingBuffer: true, stencil: true
        });
    }
}

