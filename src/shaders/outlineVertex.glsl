uniform float offset;

void main() {
    vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );
    gl_Position = projectionMatrix * pox;
}