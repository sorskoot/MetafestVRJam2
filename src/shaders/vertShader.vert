
precision highp float;

varying vec2 FragTexcoord;
varying float fogDepth;

uniform vec2 repeat;

void main(){
    FragTexcoord=vec2(uv.x*repeat.x,uv.y*repeat.y);
    gl_Position=projectionMatrix * modelViewMatrix*vec4(position,1.);
    
    float fogDistance=length(gl_Position.xyz);
    fogDepth=-(modelViewMatrix*vec4(position,1.)).z;
}
