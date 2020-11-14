attribute vec3 vertices;
attribute vec3 normals;
attribute vec2 textureCoord;
attribute vec4 color;

uniform mat4 uProjection;
uniform mat4 uModel;
uniform mat3 uNormals;

varying vec3 vVertexPosition;
varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec4 vColor;

void main () {
    vec4 vertexPos = uModel * vec4(vertices, 1.0);

    vVertexPosition = vertexPos.xyz / vertexPos.w;
    vNormal = normalize(uNormals * normals);
    vTextureCoord = textureCoord;
    vColor = color;

    gl_Position = uProjection * vertexPos;
}