import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math";

/**
 * Multiply Quaternion By Vector
 * @param {Quaternion} quaternion 
 * @param {Vector3} vector 
 * @returns {Vector3} vector
 */
export function MultiplyQuaternionByVector(quaternion, vector){
    const result = Vector3.Zero();
    MultiplyQuaternionByVectorToRef(quaternion, vector, result);
    return result;
}

/**
 * 
 * @param {Quaternion} quaternion 
 * @param {Vector3} vector 
 * @param {Vector3} result
 */
export function MultiplyQuaternionByVectorToRef(quaternion, vector, result){
    const x = vector.x;
    const y = vector.y;
    const z = vector.z;
    // Quaternion
    const qx = quaternion.x;
    const qy = quaternion.y;
    const qz = quaternion.z;
    const qw = quaternion.w;
    // Quaternion * Vector
    const ix =  qw * x + qy * z - qz * y;
    const iy =  qw * y + qz * x - qx * z;
    const iz =  qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;
    // Final Quaternion * Vector = Result
    result.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    result.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    result.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
}
