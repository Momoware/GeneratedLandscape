import * as THREE from 'three';

export default class {
    constructor(camera, terrain) {
        this.camera = camera;
        this.terrain = terrain; 
        this.intersect;
        this.lastUpdate = 0;
        this.interval = 500;
        this.raycaster;
    }

    init() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.set(this.camera.position, new THREE.Vector3(0, -1, 0));
        this.intersect = this.raycaster.intersectObject(this.terrain);
    }

    update() {
        if (Date.now() - this.lastUpdate > this.interval) {
            this.lastUpdate = Date.now();
            return true
        } else {
            return false
        }
    }

    handleRaycast() {
        console.log('raycaster updated');
        this.raycaster.set(this.camera.position, new THREE.Vector3(0, -1, 0));
        this.intersect = this.raycaster.intersectObject(this.terrain);
    }
}

