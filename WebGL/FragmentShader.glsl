precision mediump float;

uniform bool uHasTexture;
uniform sampler2D uSampler;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main() {
    gl_FragColor = uHasTexture ? texture2D(uSampler, vTextureCoord) : vColor;
}