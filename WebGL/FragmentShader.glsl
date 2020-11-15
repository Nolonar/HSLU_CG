precision mediump float;

uniform bool uIsLit;
uniform bool uIsShiny;
uniform float uAmbientLight;
uniform float uShininess;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform bool uHasTexture;
uniform sampler2D uSampler;

varying vec3 vVertexPosition;
varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec4 vColor;

const vec3 specularMaterialColor = vec3 (0.8 , 0.8 , 0.8);

void main() {
    vec4 color = uHasTexture ? texture2D(uSampler, vTextureCoord) : vColor;

    if (uIsLit) {
        vec3 ambientColor = color.rgb * uAmbientLight;

        float diffuseFactor = max(dot(uLightDirection, vNormal), 0.0);
        vec3 diffuseColor = color.rgb * uLightColor * diffuseFactor;

        vec3 specularColor = vec3(0, 0, 0);
        if (uIsShiny && diffuseFactor > 0.0) {
            vec3 reflectionDir = 2.0 * diffuseFactor * vNormal - uLightDirection;
            vec3 eyeDir = normalize(vVertexPosition);
            float cosPhi = max(dot(reflectionDir, eyeDir), 0.0);
            float specularFactor = pow(cosPhi, uShininess);
            specularColor = max(specularMaterialColor * specularFactor, 0.0);
        }

        color = vec4(ambientColor + diffuseColor + specularColor, color.a);
    }

    gl_FragColor = color;
}