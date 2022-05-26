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
import pattern1Fragment from './shaders/fragmentPattern1.glsl';
import pattern2Fragment from './shaders/fragmentPattern2.glsl';
import pattern3Fragment from './shaders/fragmentPattern3.glsl';
import pattern4Fragment from './shaders/fragmentPattern4.glsl';
import pattern5Fragment from './shaders/fragmentPattern5.glsl';
import outlineVertex from './shaders/outlineVertex.glsl';
import outlineFragment from './shaders/outlineFragment.glsl';
import { mergeUniforms } from 'three/src/renderers/shaders/UniformsUtils.js'
import { UniformsLib } from 'three/src/renderers/shaders/UniformsLib.js'
import { color } from 'dat.gui';
import bgm from './bgm/bgm.mp3';

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
    camera.position.x = 530;
    camera.position.y = 181;
    camera.position.z = 348;
    camera.lookAt(1500, 181, 1500)

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
    scene.background = new THREE.Color(0xfff9f5);
    scene.fog = new THREE.Fog(0xfff9f5, 0, 2000);

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
     * Audio
     */

    /*
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener)
    //const audioSrc = '/bgm/bgm.mp3'
    //const mediaElement = new Audio(audioSrc);

    //const mediaElement = document.getElementById('bgm');
    //sound.setMediaStreamSource(mediaElement);
    //sound.loop = true;
    //sound.play()

    //sound.setMediaElementSource(mediaElement)

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(bgm, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        //sound.autoplay = true;
        sound.play();
    });
    */

    /*
    let audio = new Audio(bgm);
    audio.play();
    */

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(bgm, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(1.0);
        sound.play();
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
    gui.hide();

    debugObject.depthColor = '#292f22';
    debugObject.surfaceColor = '#cddca3';
    

    const materialHighlight = new THREE.MeshToonMaterial({ color: 0xffcf54 });

    const outlineMaterial = new THREE.ShaderMaterial({
        vertexShader: outlineVertex,
        fragmentShader: outlineFragment,
        uniforms:
        {
            offset: { type: "f", value: 1 }
        }
    })

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
            uCameraPosition: { value: camera.position },
            uBaseSpacing: { value: settings.baseSpacing },
            uBaseWidth: { value: settings.baseWdith },

            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 },
            fogColor: { type: "c", value: scene.fog.color },
            fogNear: { type: "f", value: scene.fog.near },
            fogFar: { type: "f", value: scene.fog.far }
        },
        //fog: true
    })


    const pattern1Material = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: pattern1Fragment,
        side: THREE.DoubleSide,
        uniforms:
        {
            uBigWavesElevation: { value: 3.0 },
            uBigWavesFrequency: { value: new THREE.Vector3(0.0, 0.5, 0.4) },
            uTime: { value: 0 },
            uBigWavesSpeed: { value: 0.3 },
            uDepthColor: { value: new THREE.Color(0x1f231a) },
            uSurfaceColor: { value: new THREE.Color(0xcddca3) },
            uColorOffset: { value: 0.3 },
            uColorMultiplier: { value: 1.0 },
            uSmallWavesElevation: { value: 0.4 },
            uSmallWavesFrequency: { value: 0.0 },
            uSmallWavesSpeed: { value: 0.0 },
            lightPosition: { type: 'v3', value: new THREE.Vector3(700, 700, 700) },
            uCameraPosition: { value: camera.position },
            uBaseSpacing: { value: settings.baseSpacing },
            uBaseWidth: { value: settings.baseWdith },
            uPosition: { value: new THREE.Vector3(0, 0, 0) },

            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 },
            fogColor: { type: "c", value: scene.fog.color },
            fogNear: { type: "f", value: scene.fog.near },
            fogFar: { type: "f", value: scene.fog.far }
        },
        //fog: true
    })


    const pattern2Material = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: pattern2Fragment,
        side: THREE.DoubleSide,
        uniforms:
        {
            uBigWavesElevation: { value: 4.5 },
            uBigWavesFrequency: { value: new THREE.Vector3(0.0, 3.0, 0.4) },
            uTime: { value: 0 },
            uBigWavesSpeed: { value: 0.1 },
            uDepthColor: { value: new THREE.Color(0x1f231a) },
            uSurfaceColor: { value: new THREE.Color(0xcddca3) },
            uColorOffset: { value: 0.3 },
            uColorMultiplier: { value: 0.15 },
            uSmallWavesElevation: { value: 6.6 },
            uSmallWavesFrequency: { value: 0.0 },
            uSmallWavesSpeed: { value: 0.2 },
            lightPosition: { type: 'v3', value: new THREE.Vector3(700, 700, 700) },
            uCameraPosition: { value: camera.position },
            uBaseSpacing: { value: settings.baseSpacing },
            uBaseWidth: { value: settings.baseWdith },
            uPosition: { value: new THREE.Vector3(0, 0, 0) },

            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 },
            fogColor: { type: "c", value: scene.fog.color },
            fogNear: { type: "f", value: scene.fog.near },
            fogFar: { type: "f", value: scene.fog.far }
        },
        //fog: true
    })

    const pattern3Material = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: pattern3Fragment,
        side: THREE.DoubleSide,
        uniforms:
        {
            uBigWavesElevation: { value: 0.125 },
            uBigWavesFrequency: { value: new THREE.Vector3(0.5, 0.5, 0.4) },
            uTime: { value: 0 },
            uBigWavesSpeed: { value: 0.3 },
            uDepthColor: { value: new THREE.Color(0x1f231a) },
            uSurfaceColor: { value: new THREE.Color(0xcddca3) },
            uColorOffset: { value: 0.2 },
            uColorMultiplier: { value: 0.6 },
            uSmallWavesElevation: { value: 1.7 },
            uSmallWavesFrequency: { value: 0.2 },
            uSmallWavesSpeed: { value: 0.2 },
            lightPosition: { type: 'v3', value: new THREE.Vector3(700, 700, 700) },
            uCameraPosition: { value: camera.position },
            uBaseSpacing: { value: settings.baseSpacing },
            uBaseWidth: { value: settings.baseWdith },
            uPosition: { value: new THREE.Vector3(0, 0, 0) },

            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 },
            fogColor: { type: "c", value: scene.fog.color },
            fogNear: { type: "f", value: scene.fog.near },
            fogFar: { type: "f", value: scene.fog.far }
        },
        //fog: true
    })

    const pattern4Material = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: pattern4Fragment,
        side: THREE.DoubleSide,
        uniforms:
        {
            uBigWavesElevation: { value: 2.1 },
            uBigWavesFrequency: { value: new THREE.Vector3(2.1, 2.3, 2.3) },
            uTime: { value: 0 },
            uBigWavesSpeed: { value: 0.1 },
            uDepthColor: { value: new THREE.Color(0x1f231a) },
            uSurfaceColor: { value: new THREE.Color(0xcddca3) },
            uColorOffset: { value: 0.7 },
            uColorMultiplier: { value: 1.25 },
            uSmallWavesElevation: { value: 3.0 },
            uSmallWavesFrequency: { value: 0.02 },
            uSmallWavesSpeed: { value: 0.2 },
            lightPosition: { type: 'v3', value: new THREE.Vector3(700, 700, 700) },
            uCameraPosition: { value: camera.position },
            uBaseSpacing: { value: settings.baseSpacing },
            uBaseWidth: { value: settings.baseWdith },
            uPosition: { value: new THREE.Vector3(0, 0, 0) },

            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 },
            fogColor: { type: "c", value: scene.fog.color },
            fogNear: { type: "f", value: scene.fog.near },
            fogFar: { type: "f", value: scene.fog.far }
        },
        //fog: true
    })

    const pattern5Material = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: pattern5Fragment,
        side: THREE.DoubleSide,
        uniforms:
        {
            uBigWavesElevation: { value: 4.0 },
            uBigWavesFrequency: { value: new THREE.Vector3(1.0, 0.45, 0.4) },
            uTime: { value: 0 },
            uBigWavesSpeed: { value: 0.1 },
            uDepthColor: { value: new THREE.Color(0x1f231a) },
            uSurfaceColor: { value: new THREE.Color(0xcddca3) },
            uColorOffset: { value: 0.45 },
            uColorMultiplier: { value: 0.25 },
            uSmallWavesElevation: { value: 1.0 },
            uSmallWavesFrequency: { value: 0.4 },
            uSmallWavesSpeed: { value: 0.2 },
            lightPosition: { type: 'v3', value: new THREE.Vector3(700, 700, 700) },
            uCameraPosition: { value: camera.position },
            uBaseSpacing: { value: settings.baseSpacing },
            uBaseWidth: { value: settings.baseWdith },
            uPosition: { value: new THREE.Vector3(0, 0, 0) },
            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 },
            fogColor: { type: "c", value: scene.fog.color },
            fogNear: { type: "f", value: scene.fog.near },
            fogFar: { type: "f", value: scene.fog.far }
        },
        //fog: true
    })

    const pattern6Material = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: pattern5Fragment,
        side: THREE.DoubleSide,
        uniforms:
        {
            uBigWavesElevation: { value: 3.0 },
            uBigWavesFrequency: { value: new THREE.Vector3(0.02, 2.3, 2.3) },
            uTime: { value: 0 },
            uBigWavesSpeed: { value: 0.1 },
            uDepthColor: { value: new THREE.Color(0x1f231a) },
            uSurfaceColor: { value: new THREE.Color(0xcddca3) },
            uColorOffset: { value: 1.0 },
            uColorMultiplier: { value: 0.3 },
            uSmallWavesElevation: { value: 7.5 },
            uSmallWavesFrequency: { value: 0.2 },
            uSmallWavesSpeed: { value: 0.2 },
            lightPosition: { type: 'v3', value: new THREE.Vector3(700, 700, 700) },
            uCameraPosition: { value: camera.position },
            uBaseSpacing: { value: settings.baseSpacing },
            uBaseWidth: { value: settings.baseWdith },
            uPosition: { value: new THREE.Vector3(0, 0, 0) },

            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 },
            fogColor: { type: "c", value: scene.fog.color },
            fogNear: { type: "f", value: scene.fog.near },
            fogFar: { type: "f", value: scene.fog.far }
        },
        //fog: true
    })

    /*
    gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(10).step(0.001).name('uBigWavesElevation');
    gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(5).step(0.001).name('uBigWavesFrequencyX')
    gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(5).step(0.001).name('uBigWavesFrequencyY')
    gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'z').min(0).max(5).step(0.001).name('uBigWavesFrequencyY')
    gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')
    gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) })
    gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })

    gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
    gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(0.5).step(0.001).name('uColorMultiplier')
    gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(10).step(0.001).name('uSmallWavesElevation')
    gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(5).step(0.001).name('uSmallWavesFrequency')
    gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(5).step(0.001).name('uSmallWavesSpeed')
    */

    /**
     * GUI Custom Adjustment
     */

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function intRGB(val) {
        return map_range(val, 0.0, 1.0, 0, 255);
    }

    //console.log(rgbToHex(25, 37, 156));

    const gui2 = new dat.GUI({ autoPlace: false });
    gui2.domElement.id = 'gui2';
    gui_container.appendChild(gui2.domElement);

    let button = document.createElement('button');
    button.id = 'button';
    button.innerHTML = "Save";
    gui_container.appendChild(button);


    let tempColorHolder = {};

    tempColorHolder.depthColor = '#292f22'
    tempColorHolder.surfaceColor = '#cddca3'

    let tempValHolder = {
        BigWaveElevation: 0,
        BigWaveFrequencyX: 0,
        BigWaveFrequencyY: 0,
        BigWaveFrequencyZ: 0,
        BigWaveSpeed: 0.1,
        ColorOffset: 1.0,
        ColorMultiplier: 0.3,
        DepthColor: new THREE.Color(0xff5733),
        SurfaceColor: new THREE.Color(0xcddca3),
        //DepthColor: new THREE.Color(0x1f231a),
        //SurfaceColor: new THREE.Color(0xcddca3),
        SmallWaveElevation: 0,
        SmallWaveFrequency: 0,
        SmallWaveSpeed: 0,
    }


    gui2.add(tempValHolder, "BigWaveElevation").min(0).max(40).step(0.001).name('Amplitude 1').listen();
    gui2.add(tempValHolder, "BigWaveFrequencyX").min(0).max(5).step(0.001).name('Frequency X1').listen();
    gui2.add(tempValHolder, "BigWaveFrequencyY").min(0).max(5).step(0.001).name('Frequency Y1').listen();
    gui2.add(tempValHolder, "BigWaveFrequencyZ").min(0).max(5).step(0.001).name('Frequency Z1').listen();
    gui2.add(tempValHolder, "BigWaveSpeed").min(0).max(4).step(0.001).name('Speed 1').listen();
    gui2.add(tempValHolder, "SmallWaveElevation").min(0).max(40).step(0.001).name('Amplitude 2').listen();
    gui2.add(tempValHolder, "SmallWaveFrequency").min(0).max(5).step(0.001).name('Frequency 2').listen();
    gui2.add(tempValHolder, "SmallWaveSpeed").min(0).max(5).step(0.001).name('Speed 2').listen();

    gui2.add(tempValHolder, "ColorOffset").min(0).max(2.0).step(0.001).name('Color Offset').listen();
    gui2.add(tempValHolder, "ColorMultiplier").min(0).max(5.0).step(0.001).name('Color Contrast').listen();

    let colorControl1 = gui2.addColor(tempColorHolder, 'surfaceColor').listen().onChange(() => { currentGeo.material.uniforms.uSurfaceColor.value.set(tempColorHolder.surfaceColor) });
    let colorControl2 = gui2.addColor(tempColorHolder, 'depthColor').listen().onChange(() => { currentGeo.material.uniforms.uDepthColor.value.set(tempColorHolder.depthColor) });

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
            //geometry.translate(position.x * (baseWdith + settings.baseSpacing), height / 2, position.y * (baseWdith + settings.baseSpacing));
            //geometry_top.translate(position.x * (baseWdith + settings.baseSpacing), height / 2, position.y * (baseWdith + settings.baseSpacing));
            //let geometry = new THREE.CylinderBufferGeometry(baseWdith / 2, baseWdith / 2, height, 5, 5);
            //geometry.translate(position.x * baseWdith, 0, position.y * baseWdith);
            let mesh;
            if (Math.random() < 0.167) {
                mesh = new THREE.Mesh(geometry, pattern1Material);
                mesh.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else if (Math.random() < 0.33) {
                mesh = new THREE.Mesh(geometry, pattern2Material);
                mesh.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else if (Math.random() < 0.5) {
                mesh = new THREE.Mesh(geometry, pattern3Material);
                mesh.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else if (Math.random() < 0.665) {
                mesh = new THREE.Mesh(geometry, pattern4Material);
                mesh.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else if (Math.random() < 0.831) {
                mesh = new THREE.Mesh(geometry, pattern5Material);
                mesh.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else {
                mesh = new THREE.Mesh(geometry, pattern6Material);
                mesh.userData.position = new THREE.Vector3(position.x, position.y, height);
            }
            mesh.translateX(position.x * (baseWdith + settings.baseSpacing));
            mesh.translateY(height / 2);
            mesh.translateZ(position.y * (baseWdith + settings.baseSpacing));

            let mesh_top;
            if (Math.random() < 0.167) {
                mesh_top = new THREE.Mesh(geometry, pattern1Material);
                mesh_top.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else if (Math.random() < 0.33) {
                mesh_top = new THREE.Mesh(geometry, pattern2Material);
                mesh_top.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else if (Math.random() < 0.5) {
                mesh_top = new THREE.Mesh(geometry, pattern3Material);
                mesh_top.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else if (Math.random() < 0.665) {
                mesh_top = new THREE.Mesh(geometry, pattern4Material);
                mesh_top.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else if (Math.random() < 0.831) {
                mesh_top = new THREE.Mesh(geometry, pattern5Material);
                mesh_top.userData.position = new THREE.Vector3(position.x, position.y, height);
            } else {
                mesh_top = new THREE.Mesh(geometry, pattern6Material);
                mesh_top.userData.position = new THREE.Vector3(position.x, position.y, height);
            }


            //mesh_top.rotateZ(Math.PI);
            /*
            mesh_top.translateY(- maxHeight - 200);
            mesh_top.translateZ(- settings.width / settings.cellUnit * baseWdith);
            */

            mesh_top.translateX(position.x * (baseWdith + settings.baseSpacing));
            mesh_top.translateY(- height / 2 + 200 + maxHeight);
            mesh_top.translateZ(position.y * (baseWdith + settings.baseSpacing));

            mesh_top.rotateX(Math.PI);

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

    /**
     * Geometry generation
     */
    let currentGeo;

    function generateGeo() {
        let currentPos = currentGeo.position;
        let geometrySide = settings.baseWdith / 2;
        let geometry = new THREE.BoxBufferGeometry(geometrySide, geometrySide, geometrySide, 30, 30, 30);
        /*
        geometry.translate(currentGeo.geometry.attributes.position[0], 
            currentGeo.geometry.attributes.position[1] + currentGeo.geometry.parameters.height, 
            currentGeo.geometry.attributes.position[2]);
        */
        let mesh = new THREE.Mesh(geometry, waterMaterial);
        mesh.translateX(currentGeo.userData.position.x * (settings.baseWdith + settings.baseSpacing));
        mesh.translateY(-currentGeo.position.y / 2 + currentGeo.userData.position.z + geometrySide);
        mesh.translateZ(currentGeo.userData.position.y * (settings.baseWdith + settings.baseSpacing));
        scene.add(mesh);
        console.log(currentGeo.position.y);
        console.log(currentGeo);
    }

    /**
     * Keyboard Listeners
     */
    window.addEventListener('keyup', (event) => {
        if (event.key == 'q' || event.key == 'Q') {
            generateGeo();
        }
    })

    function popUp() {
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
    }

    let menuDown = true;
    let changed = false;

    window.addEventListener('contextmenu', (event) => {
        console.log('rightclick!');
        if (menuDown) {
            document.getElementById("gui_container").style.display = "flex";
            //console.log(tempValHolder);
            let btn = document.getElementById('button');
            btn.addEventListener('click', saveChange);
            indicator();
            menuDown = false;
        } else {
            document.getElementById("gui_container").style.display = "none";
            let btn = document.getElementById('button');
            btn.removeEventListener('click', saveChange);
            if (!changed) {
                currentGeo.material = lastMaterial;
                //debugObject2 = lastColors;
                //updateTempMaterial();
                console.log(lastMaterial.uniforms.uBigWavesElevation.value);
            } else {
                console.log("apply changes!")
            }
            indicator();
            menuDown = true;
        }
    })

    let indicatorGeo = new THREE.SphereBufferGeometry(15, 20, 20);
    let indicatorMesh = new THREE.Mesh(indicatorGeo, materialHighlight);
    let singleFocus = false;

    function indicator() {

        /*
        geometry.translate(currentGeo.geometry.attributes.position[0], 
            currentGeo.geometry.attributes.position[1] + currentGeo.geometry.parameters.height, 
            currentGeo.geometry.attributes.position[2]);
        */

        if (!menuDown) {
            colorIntersected = true;
            singleFocus = false;
            scene.remove(indicatorMesh);
        } else {
            indicatorMesh.position.x = currentGeo.userData.position.x * (settings.baseWdith + settings.baseSpacing);
            indicatorMesh.position.y = -currentGeo.position.y / 2 + currentGeo.userData.position.z + 15 * 5;
            indicatorMesh.position.z = currentGeo.userData.position.y * (settings.baseWdith + settings.baseSpacing);
            colorIntersected = false;
            //currentGeo.material = lastMaterial;
            scene.add(indicatorMesh);
            updateTempVal();
            materialSwap();
            singleFocus = true;
            //console.log(indicatorMesh);
        }
    }

    function saveChange() {
        changed = true;
        menuDown = true;
        colorIntersected = true;
        singleFocus = false;
        scene.remove(indicatorMesh);

        document.getElementById("gui_container").style.display = "none";
        let textbox = document.getElementById('comment');
        let content = textbox.value;
        if (content != "") {
            if (!currentGeo.userData.message) currentGeo.userData.message = [];
            currentGeo.userData.message.push(content);
        }
        //console.log(currentGeo.userData.message);
        //console.log(content);
        textbox.value = "";
        //console.log('hello?');
        //indicator();
        lastMaterial = currentGeo.material;
        lastColors = tempColorHolder;
        //lastColors = newColorHolder; 
        //lastColors = debugObject2;
    }


    function materialSwap() {

        //let newColors = tempValHolder.Color;

        const newMaterial = new THREE.ShaderMaterial({
            vertexShader: lastMaterial.vertexShader,
            fragmentShader: lastMaterial.fragmentShader,
            side: THREE.DoubleSide,
            uniforms:
            {
                uBigWavesElevation: { value: tempValHolder.BigWaveElevation },
                uBigWavesFrequency: { value: new THREE.Vector3(tempValHolder.BigWaveFrequencyX, tempValHolder.BigWaveFrequencyY, tempValHolder.BigWaveFrequencyZ) },
                uTime: { value: lastMaterial.uniforms.uTime.value },
                uBigWavesSpeed: { value: tempValHolder.BigWaveSpeed },

                uDepthColor: { value: new THREE.Color(tempColorHolder.depthColor) },
                uSurfaceColor: { value: new THREE.Color(tempColorHolder.surfaceColor) },

                uColorOffset: { value: tempValHolder.ColorOffset },
                uColorMultiplier: { value: tempValHolder.ColorMultiplier },
                uSmallWavesElevation: { value: tempValHolder.SmallWaveElevation },
                uSmallWavesFrequency: { value: tempValHolder.SmallWaveFrequency },
                uSmallWavesSpeed: { value: tempValHolder.SmallWaveSpeed },
                lightPosition: { type: 'v3', value: new THREE.Vector3(700, 700, 700) },
                uCameraPosition: { value: camera.position },
                uBaseSpacing: { value: settings.baseSpacing },
                uBaseWidth: { value: settings.baseWdith },
                uPosition: { value: lastMaterial.uniforms.uPosition.value },

                topColor: { type: "c", value: new THREE.Color(0x0077ff) },
                bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
                offset: { type: "f", value: 33 },
                exponent: { type: "f", value: 0.6 },
                fogColor: { type: "c", value: scene.fog.color },
                fogNear: { type: "f", value: scene.fog.near },
                fogFar: { type: "f", value: scene.fog.far }
            },
            //fog: true
        })


        materials.push(newMaterial);
        currentGeo.material = newMaterial;
        console.log("temp");
        console.log(tempColorHolder);
        let newColorHolder = {};
        newColorHolder.surfaceColor = tempColorHolder.surfaceColor;
        newColorHolder.depthColor = tempColorHolder.depthColor;

        //gui2.remove(colorControl1);
        colorControl1.destroy();
        colorControl2.destroy();
        colorControl1 = gui2.addColor(newColorHolder, 'surfaceColor').listen().onChange(() => { newMaterial.uniforms.uSurfaceColor.value.set(newColorHolder.surfaceColor) });
        //gui2.remove(colorControl2);
        colorControl2 = gui2.addColor(newColorHolder, 'depthColor').listen().onChange(() => { newMaterial.uniforms.uDepthColor.value.set(newColorHolder.depthColor) });

    }

    function updateTempMaterial() {
        /*
        gui2.add(currentGeo.material.uniforms.uBigWavesElevation, 'value').min(0).max(10).step(0.001).name('uBigWavesElevation');
        gui2.add(currentGeo.material.uniforms.uBigWavesFrequency.value, 'x').min(0).max(5).step(0.001).name('uBigWavesFrequencyX')
        gui2.add(currentGeo.material.uniforms.uBigWavesFrequency.value, 'y').min(0).max(5).step(0.001).name('uBigWavesFrequencyY')
        gui2.add(currentGeo.material.uniforms.uBigWavesFrequency.value, 'z').min(0).max(5).step(0.001).name('uBigWavesFrequencyY')
        gui2.add(currentGeo.material.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')
        gui2.addColor(debugObject, 'depthColor').onChange(() => { currentGeo.material.uniforms.uDepthColor.value.set(debugObject.depthColor) })
        gui2.addColor(debugObject, 'surfaceColor').onChange(() => { currentGeo.material.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })
    
        gui2.add(currentGeo.material.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
        gui2.add(currentGeo.material.uniforms.uColorMultiplier, 'value').min(0).max(0.5).step(0.001).name('uColorMultiplier')
        gui2.add(currentGeo.material.uniforms.uSmallWavesElevation, 'value').min(0).max(10).step(0.001).name('uSmallWavesElevation')
        gui2.add(currentGeo.material.uniforms.uSmallWavesFrequency, 'value').min(0).max(5).step(0.001).name('uSmallWavesFrequency')
        gui2.add(currentGeo.material.uniforms.uSmallWavesSpeed, 'value').min(0).max(5).step(0.001).name('uSmallWavesSpeed')
        */
        currentGeo.material.uniforms.uBigWavesElevation.value = tempValHolder.BigWaveElevation;
        currentGeo.material.uniforms.uBigWavesFrequency.value.x = tempValHolder.BigWaveFrequencyX;
        currentGeo.material.uniforms.uBigWavesFrequency.value.y = tempValHolder.BigWaveFrequencyY;
        currentGeo.material.uniforms.uBigWavesFrequency.value.z = tempValHolder.BigWaveFrequencyZ;
        currentGeo.material.uniforms.uBigWavesSpeed.value = tempValHolder.BigWaveSpeed;
        currentGeo.material.uniforms.uColorOffset.value = tempValHolder.ColorOffset;
        currentGeo.material.uniforms.uColorMultiplier.value = tempValHolder.ColorMultiplier;
        currentGeo.material.uniforms.uSmallWavesElevation.value = tempValHolder.SmallWaveElevation;
        currentGeo.material.uniforms.uSmallWavesFrequency.value = tempValHolder.SmallWaveFrequency;
        currentGeo.material.uniforms.uSmallWavesSpeed.value = tempValHolder.SmallWaveSpeed;

        //currentGeo.material.uniforms.uDepthColor.value.set(tempColorHolder.depthColor);
        //currentGeo.material.uniforms.uSurfaceColor.value.set(tempColorHolder.surfaceColor);

        //currentGeo.material.uniforms.uDepthColor.value = tempValHolder.DepthColor.value;
        //currentGeo.material.uniforms.uSurfaceColor.value = tempValHolder.SurfaceColor.value;
        //debugObject2.depthColor = tempValHolder.DepthColor;
        //debugObject2.surfaceColor = tempValHolder.SurfaceColor;
    }

    function updateTempVal() {
        tempValHolder.BigWaveElevation = lastMaterial.uniforms.uBigWavesElevation.value;
        tempValHolder.BigWaveFrequencyX = lastMaterial.uniforms.uBigWavesFrequency.value.x;
        tempValHolder.BigWaveFrequencyY = lastMaterial.uniforms.uBigWavesFrequency.value.y;
        tempValHolder.BigWaveFrequencyZ = lastMaterial.uniforms.uBigWavesFrequency.value.z;
        tempValHolder.BigWaveSpeed = lastMaterial.uniforms.uBigWavesSpeed.value;
        tempValHolder.ColorOffset = lastMaterial.uniforms.uColorOffset.value;
        tempValHolder.ColorMultiplier = lastMaterial.uniforms.uColorMultiplier.value;
        tempValHolder.SmallWaveElevation = lastMaterial.uniforms.uSmallWavesElevation.value;
        tempValHolder.SmallWaveFrequency = lastMaterial.uniforms.uSmallWavesFrequency.value;
        tempValHolder.SmallWaveSpeed = lastMaterial.uniforms.uSmallWavesSpeed.value;

        /*
        tempValHolder.SurfaceColor = lastMaterial.uniforms.uSurfaceColor.value;
        tempValHolder.DepthColor = lastMaterial.uniforms.uDepthColor.value;
        */

        tempColorHolder.surfaceColor = lastColors.surfaceColor;
        tempColorHolder.depthColor = lastColors.depthColor;

        /*
        debugObject2.depthColor = lastMaterial.uniforms.uDepthColor.value; 
        debugObject2.surfaceColor.set(lastMaterial.uniforms.uSurfaceColor.value);
        */

        /*
        debugObject2.depthColor = rgbToHex(intRGB(lastMaterial.uniforms.uDepthColor.value.r),
        intRGB(lastMaterial.uniforms.uDepthColor.value.g),intRGB(lastMaterial.uniforms.uDepthColor.value.b));
        debugObject2.surfaceColor = rgbToHex(intRGB(lastMaterial.uniforms.uSurfaceColor.value.r),
        intRGB(lastMaterial.uniforms.uSurfaceColor.value.g),intRGB(lastMaterial.uniforms.uSurfaceColor.value.b));
        */

        /*
        console.log(lastMaterial.uniforms.uDepthColor.value);
        console.log(tempValHolder);
        */
        /*
        for (var i in gui2.__controllers) {
            gui2.__controllers[i].updateDisplay();
        }
        */
    }


    dragElement(document.getElementById("gui_container"));

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById("gui_containerheader")) {
            // if present, the header is where you move the DIV from:
            document.getElementById("gui_containerheader").onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            if (document.getElementById("gui_container") === document.activeElement) {
                elmnt.onmousedown = dragMouseDown;
            }
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }


    let change = false;

    let lastMaterial = pattern1Material;
    let lastColors = {};

    let currentMaterial = null;
    let colorIntersected = true;
    let materials = [pattern1Material, pattern2Material, pattern3Material, pattern4Material, pattern5Material,
        pattern6Material];

    let messageDisplayed = false;

    function updateMaterialsTime() {
        for (let i = 0; i < materials.length; i++) {
            materials[i].uniforms.uTime.value = counter;
            materials[i].uniforms.uCameraPosition.value = camera.position;
        }
        //console.log(camera.position);
    }


    let msg_board = document.createElement('div');
    msg_board.id = "message_board";
    document.body.appendChild(msg_board);

    function animate() {

        //console.log(lastMaterial);


        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        cameraX = Math.floor(camera.position.x / (settings.baseWdith + settings.baseSpacing));
        cameraY = Math.floor(camera.position.z / (settings.baseWdith + settings.baseSpacing));

        //console.log(camera.position);
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

        if (singleFocus) {
            updateTempMaterial();
        }

        if (!singleFocus) {

            raycast.setFromCamera(pointer, camera);

            const intersects = raycast.intersectObjects(scene.children, false);


            if (intersects.length > 0) {
                if (INTERSECTED != intersects[0].object) {
                    if (INTERSECTED) {
                        /*
                        if (INTERSECTED.position.x > 12 * settings.baseWdith) {
                            INTERSECTED.material = pattern1Material;
                        } else {
                            INTERSECTED.material = waterMaterial;
                        }
                        */
                        INTERSECTED.material = lastMaterial;
                        tempColorHolder.surfaceColor = lastColors.surfaceColor;
                        tempColorHolder.depthColor = lastColors.depthColor;
                        //debugObject2 = lastColors;

                        let messageBoard = document.getElementById('message_board');
                        messageBoard.style.display = "none";
                        messageDisplayed = false;
                    }
                    //if (INTERSECTED) INTERSECTED.material = waterMaterial;

                    INTERSECTED = intersects[0].object;
                    lastMaterial = INTERSECTED.material;

                    lastColors.depthColor = rgbToHex(intRGB(lastMaterial.uniforms.uDepthColor.value.r),
                        intRGB(lastMaterial.uniforms.uDepthColor.value.g), intRGB(lastMaterial.uniforms.uDepthColor.value.b));
                    lastColors.surfaceColor = rgbToHex(intRGB(lastMaterial.uniforms.uSurfaceColor.value.r),
                        intRGB(lastMaterial.uniforms.uSurfaceColor.value.g), intRGB(lastMaterial.uniforms.uSurfaceColor.value.b));


                    console.log("last");
                    console.log(lastColors);
                    //lastColors = debugObject2;


                    console.log("lastMaterial changed!");


                    /*
                    INTERSECTED.material = outlineMaterial;
                    INTERSECTED.material.depthWrite = false;
                    */

                    change = true;
                    currentGeo = INTERSECTED;

                    if (currentGeo.userData.message) {
                        if (!messageDisplayed) {
                            let messageBoard = document.getElementById('message_board');
                            messageBoard.style.display = "inline-flex";
                            messageBoard.innerHTML = "";
                            for (let i = 0; i < currentGeo.userData.message.length; i++) {
                                let msg = document.createElement('p');
                                msg.classList.add('message');
                                msg.innerHTML = currentGeo.userData.message[i];
                                messageBoard.appendChild(msg);
                            }
                            messageDisplayed = true;
                            console.log("MESSAGE");
                        }
                    } else if (colorIntersected) {
                        INTERSECTED.material = materialHighlight;
                    }


                }
            } else {
                if (INTERSECTED) {
                    /*
                    if (INTERSECTED.position.x > 12 * settings.baseWdith) {
                        INTERSECTED.material = pattern1Material;
                    } else {
                        INTERSECTED.material = waterMaterial;
                    }
                    */
                    INTERSECTED.material = lastMaterial;
                    //debugObject2 = lastColors;
                    tempColorHolder.surfaceColor = lastColors.surfaceColor;
                    tempColorHolder.depthColor = lastColors.depthColor;
                    let messageBoard = document.getElementById('message_board');
                    messageBoard.style.display = "none";
                    messageDisplayed = false;
                }
                INTERSECTED = null;
                change = false;
            }
        }

        let delta = clock.getDelta();
        controls.update(delta, cameraZ);
        if (document.getElementById("comment") === document.activeElement) {
            controls.movementSpeed = 0;
        } else {
            controls.movementSpeed = 150;
        }
        counter += 0.1;
        //waterMaterial.uniforms.uTime.value = counter;
        //waterMaterial.uniforms.uCameraPosition.value = camera.position;
        updateMaterialsTime();
        /*
        pattern1Material.uniforms.uTime.value = counter;
        pattern1Material.uniforms.uCameraPosition.value = camera.position;
        pattern2Material.uniforms.uTime.value = counter;
        pattern2Material.uniforms.uCameraPosition.value = camera.position;
        pattern3Material.uniforms.uTime.value = counter;
        pattern3Material.uniforms.uCameraPosition.value = camera.position;
        pattern4Material.uniforms.uTime.value = counter;
        pattern4Material.uniforms.uCameraPosition.value = camera.position;
        pattern5Material.uniforms.uTime.value = counter;
        pattern5Material.uniforms.uCameraPosition.value = camera.position;
        */
        //console.log(camera.position);
    }

    //console.log(merged);
    animate();
}
