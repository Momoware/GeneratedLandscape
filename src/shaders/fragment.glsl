uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform vec3 lightPosition;
varying float vElevation;
uniform float uColorOffset;
uniform float uColorMultiplier;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec4 vModelPosition;
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

void main() {
    float shadowPower = 0.5;
    vec3 shadowColor = vec3(0, 0, 0);
    vec3 lightDirection = normalize(lightPosition - vWorldPosition);
    vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor(vUv.y * 10.0) / 10.0);

    float mixStrength = step(0.4, (vElevation + uColorOffset) * uColorMultiplier);

    float mixStrength_2 = random(gridUv) * (vElevation + uColorOffset) * uColorMultiplier;


    vec2 wavedUv = vec2(
        vUv.x + sin(vUv.y * 50.0) * 0.1* vElevation,
        vUv.y + sin(vUv.x * 50.0) * 0.1* vElevation
    );
    float mixStrength_3 = 1.0 - step(0.05 * vElevation, abs(distance(wavedUv, vec2(vElevation * 0.1)) - 0.25));


    float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (PI * 2.0) + 0.5;
    float mixStrength_4 = sin(angle * 5.0 * vElevation);

    vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5));
    float mixStrength_5 = 0.15 / (distance(vec2(rotatedUv.x, (rotatedUv.y - 0.5) * vElevation + 0.5), vec2(0.5)));
    mixStrength_5 *= 0.15 / (distance(vec2(rotatedUv.y, (rotatedUv.x - 0.5) * vElevation + 0.5), vec2(0.5)));

    vec3 color;


    if (vModelPosition.x > 800.0) {
        color = mix(uDepthColor, uSurfaceColor, mixStrength_2);
    } else if (vModelPosition.x > 600.0) {
        color = mix(uDepthColor, uSurfaceColor, mixStrength_3);
    } else if (vModelPosition.x > 400.0) {
        color = mix(uDepthColor, uSurfaceColor, mixStrength_4);
    } else if (vModelPosition.x > 200.0) {
        color = mix(uDepthColor, uSurfaceColor, mixStrength_5);
    } else {
        color = mix(uDepthColor, uSurfaceColor, mixStrength);
    };
    
    gl_FragColor = vec4(color, 1.0);
}