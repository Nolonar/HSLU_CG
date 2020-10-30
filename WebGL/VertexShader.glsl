attribute vec3 vertices;
attribute vec2 textureCoord;
attribute vec4 color;

uniform mat4 uProjection;
uniform mat4 uCamera;
uniform mat4 uModel;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main () {
    gl_Position = uProjection * uCamera * uModel * vec4(vertices, 1.0);
    vTextureCoord = textureCoord;
    vColor = color;
}