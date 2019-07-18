precision mediump float;

uniform sampler2D u_imageA;
uniform sampler2D u_imageB;
uniform float u_alpha;

varying vec2 v_textureACoord;
varying vec2 v_textureBCoord;

void main(){
    vec4 colorA = texture2D(u_imageA, v_textureACoord);
    vec4 colorB = texture2D(u_imageB, v_textureBCoord);
    gl_FragColor=colorA * (1.0 - u_alpha) + colorB * u_alpha;
}
