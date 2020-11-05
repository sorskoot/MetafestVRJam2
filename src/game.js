import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { sceneHelpers } from "@babylonjs/core/Helpers"
import { Inspector } from "@babylonjs/inspector"
import { WebXRDefaultExperience } from "@babylonjs/core/XR";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { GridMaterial } from "@babylonjs/materials/grid";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import { RenderingGroup } from "@babylonjs/core/Rendering/renderingGroup";
import { WebVRFreeCamera } from "@babylonjs/core/Cameras/VR/webVRCamera";
import RandomEntity from "./classes/randomEntity";

export default class Game {
    constructor() {
        

        var engine = null;
        var scene = null;
        var sceneToRender = null;

        var engine;
        try {
            engine = this.createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            engine = createDefaultEngine();
        }
        if (!engine) throw 'engine should not be null.';
        scene = this.createScene(engine);
        scene.then(returnedScene => { sceneToRender = returnedScene; });
        
        
        engine.runRenderLoop(function () {
            if (sceneToRender && sceneToRender.activeCamera) {
                sceneToRender.render();
            }
        })
        
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

        this.world = new Mesh("world",scene);
        
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.parent = this.world;
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;
        
        var material = new GridMaterial("grid", scene);
        // Our built-in 'sphere' shape.
        var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 40, segments: 32 }, scene);
        sphere.material= material;
        
        sphere.setParent(this.world)
        // Move the sphere upward 1/2 its height
        sphere.position.y =-20;

        for (let i = 0; i < 250; i++) {
            const o = new RandomEntity(scene, 'randomEntity'+i, new Vector3(0,-20, 0), 20);
            o.mesh.parent = this.world;            
        }

        scene.createDefaultEnvironment();
        
        // XR
        const xrHelper = await scene.createDefaultXRExperienceAsync();

        return scene;

    }

    createDefaultEngine() {
        var canvas = document.getElementById("renderCanvas");
        return new Engine(canvas, true, {
            preserveDrawingBuffer: true, stencil: true
        });
    }
}