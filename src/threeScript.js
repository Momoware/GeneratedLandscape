import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import settings from './settings';
import * as dat from 'lil-gui';
import { map_range, minmax } from './utility';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Controls from './controls';
import Raycast from './raycast';
import testVertexShader from './shaders/vertex.glsl';
import testFragmentShader from './shaders/fragment.glsl';
import { mergeUniforms } from 'three/src/renderers/shaders/UniformsUtils.js'
import { UniformsLib } from 'three/src/renderers/shaders/UniformsLib.js'

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
    camera.position.x = 150;
    camera.position.z = 150;

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
    const light = new THREE.PointLight(0xfcfaed, 0.5);
    light.position.set(500, 500, 500);
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


    const light2 = new THREE.PointLight(0xfcfaed, 0.15);
    light2.position.set(camera.position.x, camera.position.y, camera.position.z);
    light2.castShadow = true;

    //Set up shadow properties for the light
    light2.shadow.mapSize.width = 512; // default
    light2.shadow.mapSize.height = 512; // default
    light2.shadow.camera.near = 0.5; // default
    light2.shadow.camera.far = 500; // default

    scene.add(light2);

    const sphereSize2 = 25;
    const pointLightHelper2 = new THREE.PointLightHelper(light2, sphereSize2);
    //scene.add(pointLightHelper2);

    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.1);
    //scene.add(ambient);

    /**
     * Fog
     */
    scene.fog = new THREE.FogExp2(0xefd1b5, 1.0);

    /**
     * Raycaster
     */
    const raycast = new THREE.Raycaster();

    const pointer = new THREE.Vector2();
    function onPointerMove(event) {

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    }

    document.addEventListener('pointermove', onPointerMove);

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

        controls.handleResize();
    });


    /**
     * Control
     */

    /*
    const controls = new OrbitControls(camera, document.querySelector('canvas'));
    controls.target = new THREE.Vector3(500, 100, 500);
    */


    const controls = new Controls(camera, renderer.domElement);
    controls.movementSpeed = 150;
    controls.lookSpeed = 0.1;


    /*
    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    */

    /**
     * GUI
     */
    const gui = new dat.GUI()
    const debugObject = {};

    debugObject.depthColor = '#292f22'
    debugObject.surfaceColor = '#cddca3'


    const material = new THREE.MeshStandardMaterial({ color: 0xE8E8E8 });
    const materialHighlight = new THREE.MeshStandardMaterial({ color: 0xed2f21 });

    const waterMaterial = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: testFragmentShader,
        side: THREE.DoubleSide,
        uniforms:
        {
            uBigWavesElevation: { value: 0.747 },
            uBigWavesFrequency: { value: new THREE.Vector3(0.7, 0.3, 0.4) },
            uTime: { value: 0 },
            uBigWavesSpeed: { value: 0.3 },
            uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
            uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
            uColorOffset: { value: 1.125 },
            uColorMultiplier: { value: 0.345 },
            uSmallWavesElevation: { value: 1.5 },
            uSmallWavesFrequency: { value: 0.2 },
            uSmallWavesSpeed: { value: 0.2 },
            lightPosition: { type: 'v3', value: new THREE.Vector3(700, 700, 700) },
        }
    })


    gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(5).step(0.001).name('uBigWavesElevation');
    gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(2).step(0.001).name('uBigWavesFrequencyX')
    gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(2).step(0.001).name('uBigWavesFrequencyY')
    gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'z').min(0).max(2).step(0.001).name('uBigWavesFrequencyY')
    gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')
    gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
    gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })

    gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
    gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(0.5).step(0.001).name('uColorMultiplier')
    gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(5).step(0.001).name('uSmallWavesElevation')
    gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(2).step(0.001).name('uSmallWavesFrequency')
    gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(2).step(0.001).name('uSmallWavesSpeed')

    /**
     * GeometryArray
     */
    let data = settings.data;
    let dataRange = minmax(data);
    let xnum = settings.width / settings.cellUnit;
    let ynum = settings.height / settings.cellUnit;
    let geometries = [];
    let geometries_top = [];

    let cameraX = Math.floor(camera.position.x / (settings.baseWdith + settings.baseSpacing));
    let cameraY = Math.floor(camera.position.z / (settings.baseWdith + settings.baseSpacing));
    let cameraZ = data[cameraX, cameraY];

    camera.position.y = cameraZ - 100;

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
            let heightDiv = Math.floor(map_range(height, minHeight, maxHeight, 10, 80));


            let geometry = new THREE.BoxBufferGeometry(baseWdith, height, baseWdith, 30, heightDiv, 30);
            let geometry_top = new THREE.BoxBufferGeometry(baseWdith, height, baseWdith, 30, heightDiv, 30);
            geometry.translate(position.x * (baseWdith + settings.baseSpacing), height / 2, position.y * (baseWdith + settings.baseSpacing));
            geometry_top.translate(position.x * (baseWdith + settings.baseSpacing), height / 2, position.y * (baseWdith + settings.baseSpacing));
            //let geometry = new THREE.CylinderBufferGeometry(baseWdith / 2, baseWdith / 2, height, 5, 5);
            //geometry.translate(position.x * baseWdith, 0, position.y * baseWdith);

            let mesh = new THREE.Mesh(geometry, waterMaterial);
            let mesh_top = new THREE.Mesh(geometry_top, waterMaterial);
            mesh_top.rotateX(Math.PI);
            //mesh_top.rotateZ(Math.PI);
            mesh_top.translateY(- maxHeight - 250);
            mesh_top.translateZ(- settings.width / settings.cellUnit * baseWdith);

            geometries.push({
                height: height,
                position: position,
                geometry: geometry,
                mesh: mesh
            });

            geometries_top.push({
                height: height,
                position: position,
                geometry: geometry_top,
                mesh: mesh_top
            })

            scene.add(mesh);
            scene.add(mesh_top);
        }
    }

    console.log(geometries);

    const clock = new THREE.Clock();
    let counter = 0;

    let lastX = Math.floor(camera.position.x / (settings.baseWdith + settings.baseSpacing));
    let lastY = Math.floor(camera.position.z / (settings.baseWdith + settings.baseSpacing));

    let INTERSECTED;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        cameraX = Math.floor(camera.position.x / (settings.baseWdith + settings.baseSpacing));
        cameraY = Math.floor(camera.position.z / (settings.baseWdith + settings.baseSpacing));

        /*
        if (cameraX !== lastX && cameraY !== lastY) {
            console.log("cameraX " + cameraX);
            console.log("cameraY " + cameraY);
            console.log("cameraZ " + cameraZ);
            console.log("  ");

            lastX = cameraX;
            lastY = cameraY;
            cameraZ = data[cameraX, cameraY];
        }
        */

        /**
         * Raycasting
         */
        // find intersections

        raycast.setFromCamera(pointer, camera);

        const intersects = raycast.intersectObjects(scene.children, false);
        

        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {

                if ( INTERSECTED ) INTERSECTED.material = waterMaterial;

                INTERSECTED = intersects[0].object;
                INTERSECTED.material = materialHighlight;
            }
        } else {
            if ( INTERSECTED ) INTERSECTED.material = waterMaterial;
            INTERSECTED = null;
        }

        let delta = clock.getDelta();
        controls.update(delta, cameraZ);
        counter += 0.1;
        waterMaterial.uniforms.uTime.value = counter;
    }

    //console.log(merged);
    animate();
}
