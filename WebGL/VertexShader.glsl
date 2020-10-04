attribute vec2 aVertices;
attribute vec4 aColor;

uniform mat3 uProjection;
uniform mat3 uTransformation;

varying vec4 vColor;

void main () {
    vec3 pos = uProjection * uTransformation * vec3(aVertices, 1.0);
    gl_Position = vec4(pos.xy, 0.0, pos.z);
    vColor = aColor;
}