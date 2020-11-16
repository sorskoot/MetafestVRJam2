import fragShader from '../shaders/fragShader.frag';
import vertShader from '../shaders/vertShader.vert';

const texture = new THREE.ImageUtils.loadTexture('./textures/mfvr.png');
const textureLookup = new THREE.ImageUtils.loadTexture('./textures/mfvr.png');

/**
 * Creates a pixel shader material
 * @param {number} tileIndex index of the sprite to use as a map
 * @param {string} color Hex color - defaults to #ffffff
 */
function createPixelMaterial(
    tileIndex,
    color = '#ffffff',
    lookupIndex = -1,
    repeatX = 1,
    repeatY = 1,
    transparent = false,
    twosided = false) {
    texture.minFilter = texture.magFilter = 1003;
    textureLookup.minFilter = textureLookup.magFilter = 1003;
    var material = new THREE.ShaderMaterial({
        extensions: {
            derivatives: true
        },
        uniforms: { // some parameters for the shader
            time: { value: 0.0 },
            index: { value: tileIndex },
            DiffuseTexture: { value: texture },
            Lookup: { value: textureLookup },
            lookupIndex: { value: lookupIndex },
            lookupShift: { value: 0.0 },
            color: { value: new THREE.Color(color) },
            spriteDimensions: { value: { x: 22.0, y: 1.0 } },
            repeat: { value: { x: repeatX, y: repeatY } },
            tint: { value: new THREE.Color(255, 255, 255) },
            tintAmount: { value: 0 }
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
    });
    material.transparent = transparent;
    if (twosided) material.side = THREE.DoubleSide;
    material.needsUpdate = true;
    return material;
}

AFRAME.registerComponent("pixel-material", {
    schema: {
      index: { type: "int", default: 0 },
      color: { default: "#ffffff" },
      lookup: { type: "int", default: -1 },
      animationSpeed: { default: 0 },
      repeat:{type:"vec2", default:{x:1, y:1}},
      transparent:{default:false},
      twosided:{default:false}
    },
  
    init: function () {  },
  
    update: function () {
      this.material = createPixelMaterial(
          this.data.index, 
          this.data.color, 
          this.data.lookup,
          this.data.repeat.x,
          this.data.repeat.y,
          this.data.transparent,
          this.data.twosided);
      this.el.getObject3D("mesh").depthWrite = false;
      this.el.getObject3D("mesh").material = this.material;
    },
  });
  