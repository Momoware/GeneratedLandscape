import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import settings from './settings';
import * as dat from 'dat.gui';
import { map_range, minmax } from './utility';

export function threeScript() {
    /**
    * Sizes
    */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1c1c1c);

    /**
     * Axis Helper
     */
    const axesHelper = new THREE.AxesHelper(200);
    scene.add(axesHelper);

    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 5000);
    camera.position.x = 50;
    camera.position.z = 50;
    camera.position.y = 100;
    camera.rotation.y = Math.PI / 2;

    /**
     * Material
     */
    const textureLoader = new THREE.TextureLoader();

    const lightColors = {
        Directional1: 0xfff9f5,
        Directional2: 0xfff9f5
    }

    /**
     * Fog
     */
    //scene.fog = new THREE.FogExp2(0xfff9f5, 0.01);

    /**
     * Light
     */
    const light = new THREE.PointLight(0xfcfaed, 1);
    light.position.set(150, 100, 200);
    light.castShadow = true;

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default

    scene.add(light);

    const sphereSize = 25;
    const pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
    scene.add(pointLightHelper);


    const light2 = new THREE.PointLight(0xfcfaed, 0.25);
    light2.position.set(5000, 5000, 300);
    light2.castShadow = true;

    //Set up shadow properties for the light
    light2.shadow.mapSize.width = 512; // default
    light2.shadow.mapSize.height = 512; // default
    light2.shadow.camera.near = 0.5; // default
    light2.shadow.camera.far = 500; // default

    scene.add(light2);

    const sphereSize2 = 25;
    const pointLightHelper2 = new THREE.PointLightHelper(light2, sphereSize2);
    scene.add(pointLightHelper2);

    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.1);
    scene.add(ambient);



    /**
     * Renderer
    */
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(sizes.width, sizes.height);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    //resize
    window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    });

    /**
     * Control
     */
    const controls = new OrbitControls(camera, document.querySelector('canvas'));
    controls.target = new THREE.Vector3(500, 100, 500);

    /*
    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    */

    const material = new THREE.MeshStandardMaterial({ color: 0xE8E8E8 });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    /**
     * GeometryArray
     */
    let data = settings.data;
    let dataRange = minmax(data);
    let xnum = settings.width / settings.cellUnit;
    let ynum = settings.height / settings.cellUnit;
    let geometries = [];

    for (let i = 0; i < xnum; i++) {
        for (let j = 0; j < ynum; j++) {

            let position = { x: j, y: i };
            let baseWdith = settings.baseWdith;

            let dataLow = dataRange.min;
            let dataHigh = dataRange.max;
            let minHeight = settings.minHeight;
            let maxHeight = settings.maxHeight;
            let curData = data[j + i * ynum];

            let height = map_range(curData, dataLow, dataHigh, minHeight, maxHeight);
            //let height = 20;

            //let geometry = new THREE.BoxBufferGeometry(baseWdith, height, baseWdith, 2, 2, 2);
            let geometry = new THREE.CylinderBufferGeometry(baseWdith / 2, baseWdith / 2, height, 5, 5);

            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = position.x * baseWdith;
            mesh.position.z = position.y * baseWdith;
            mesh.position.y += height / 2;

            geometries.push({
                height: height,
                position: position,
                geometry: geometry,
                mesh: mesh
            });

            scene.add(mesh);
        }
    }

    console.log(geometries);
    animate();
}
