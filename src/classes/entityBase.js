import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes";

export default class EntityBase {
    constructor(scene, name = "entity", position, rotation) {
        this.scene = scene;
        this.name = `${name}_${this.scene.meshes.length}`;
        this.position = position;
        this.rotation = rotation;

        this.mesh = this.buildMesh();
       // this.mat = new StandardMaterial("mat", this.scene);
       // this.mesh.material = this.mat;
        this.mesh.position = this.position;
        this.mesh.rotation = this.rotation;
    }

    buildMesh(){
        return new Mesh(this.name, this.scene);
    }
}