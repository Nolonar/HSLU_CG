precision mediump float;

uniform bool uHasTexture;
uniform sampler2D uSampler;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main() {
    if (uHasTexture) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    } else {
        gl_FragColor = vColor;
    }
}