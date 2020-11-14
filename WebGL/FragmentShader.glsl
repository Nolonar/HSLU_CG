precision mediump float;

uniform bool uIsLit;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform bool uHasTexture;
uniform sampler2D uSampler;

varying vec3 vVertexPosition;
varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec4 vColor;

const float ambientLight = 0.2;
const float shininess = 10.0;
const vec3 specularMaterialColor = vec3 (0.4 , 0.4 , 0.4);

void main() {
    vec4 color = uHasTexture ? texture2D(uSampler, vTextureCoord) : vColor;

    if (uIsLit) {
        vec3 ambientColor = color.rgb * ambientLight;

        float diffuseFactor = dot(normalize(-uLightDirection), vNormal);
        vec3 diffuseColor = color.rgb * uLightColor * diffuseFactor;

        vec3 specularColor = vec3(0, 0, 0);
        /*
        if (diffuseFactor > 0.0) {
            vec3 reflectionDir = ; // TODO
            vec3 eyeDir = ; // TODO
            float cosPhi = ; // TODO
            float specularFactor = ; // TODO
            specularColor = ; // TODO
        }
        */

        color = vec4(ambientColor + diffuseColor + specularColor, color.a);
    }

    gl_FragColor = color;
}