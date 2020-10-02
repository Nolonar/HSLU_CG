attribute vec4 aVertices;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main () {
    gl_Position = aVertices;
    vTextureCoord = aTextureCoord;
    vColor = aColor;
}