uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform vec3 lightPosition;
varying float vElevation;
uniform float uColorOffset;
uniform float uColorMultiplier;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec4 vModelPosition;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform vec3 uCameraPosition;
uniform float uBaseWidth;
uniform float uBaseSpacing;
float PI = 3.1415;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

float distance(vec3 camera, vec3 model) {
    float x = abs(camera.x - model.x);
    float y = abs(camera.z - model.y);
    return sqrt(x * x + y * y);
}

void main() {
    float shadowPower = 0.5;
    vec3 shadowColor = vec3(0, 0, 0);
    vec3 lightDirection = normalize(lightPosition - vWorldPosition);
    vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5));
    float mixStrength_5 = 0.15 / (distance(vec2(rotatedUv.x, (rotatedUv.y - 0.5) * vElevation + 0.5), vec2(0.5)));
    
    mixStrength_5 *= 0.15 / (distance(vec2(rotatedUv.y * uColorMultiplier, ((rotatedUv.x - 0.5) * vElevation + 0.5)) * uColorMultiplier, vec2(uColorOffset)));

    vec3 color;

    color = mix(uDepthColor, uSurfaceColor, mixStrength_5);

    gl_FragColor = vec4(color, 1.0);
    /*
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep( fogNear, fogFar, depth );
    */
    /*
    vec3 currentPosition = vec3(vModelPosition.x + vModelPosition.x * (uBaseWidth + uBaseSpacing),
    vModelPosition.y + vModelPosition.y * (uBaseWidth + uBaseSpacing), vWorldPosition.z);
    float depth = distance(uCameraPosition, vWorldPosition);
    float fogFactor;
    if (depth > fogFar) {
        fogFactor = 1.0;
    } else if (depth < fogNear) {
        fogFactor = 0.0;
    } else {
        fogFactor = smoothstep( fogNear, fogFar, depth);
    }
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
    */
    float depth = distance(uCameraPosition, vModelPosition.xyz);
    float fogFactor;
    if (depth > fogFar) {
        fogFactor = 1.0;
    } else if (depth < fogNear) {
        fogFactor = 0.0;
    } else {
        fogFactor = smoothstep( fogNear, fogFar, depth);
    }
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
}