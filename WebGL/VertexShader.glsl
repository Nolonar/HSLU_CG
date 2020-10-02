attribute vec2 aVertices;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main () {
    gl_Position = vec4(aVertices, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
    vColor = aColor;
}