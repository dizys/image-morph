attribute vec2 a_toPosition;
attribute vec2 a_fromPositionA;
attribute vec2 a_fromPositionB;

varying vec2 v_textureACoord;
varying vec2 v_textureBCoord;

void main() {
    v_textureACoord = a_fromPositionA * vec2(0.5, -0.5) + vec2(0.5, 0.5);
    v_textureBCoord = a_fromPositionB * vec2(0.5, -0.5) + vec2(0.5, 0.5);
    gl_Position = vec4(a_toPosition, 0, 1);
}