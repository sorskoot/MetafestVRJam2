import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes";
import EntityBase from "./entityBase";
import { MultiplyQuaternionByVector } from "./quaternion-utils";

export default class RandomEntity extends EntityBase {
    constructor(scene, name = "entity", center, diameter) {
        
        const rotationX = Quaternion.RotationAxis(Vector3.Right(), Math.random() * 2 * Math.PI);        
        const rotationZ = Quaternion.RotationAxis(Vector3.Forward(), Math.random() * 2 * Math.PI);

        const inbtw = MultiplyQuaternionByVector(rotationZ.multiply(rotationX), Vector3.Up());
        
        const position = inbtw.multiplyByFloats(diameter, diameter, diameter).add(center);

        super(scene, name, position, rotationZ.multiply(rotationX).toEulerAngles() );
    }

    buildMesh(){
        return MeshBuilder.CreateCylinder(this.name, {diameterBottom:2, diameterTop:0,height:5}, this.scene);
    }
}

