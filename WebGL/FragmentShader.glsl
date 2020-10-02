precision mediump float;

uniform sampler2D uSampler;
uniform vec3 uColor;
uniform float uTime;

varying vec2 vTextureCoord;
varying vec4 vColor;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float hue = mod(uTime, 1.0);
    vec3 hsv = vec3(hue, 1.0, 1.0);
    //gl_FragColor = vec4(hsv2rgb(hsv), 1.0);
    //gl_FragColor = vec4(uColor, 1.0);
    //gl_FragColor = vColor;
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}