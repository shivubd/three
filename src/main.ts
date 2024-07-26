import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'

import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'



//SCENE
const scene = new THREE.Scene()

// Create a white background
const data = { color: 0x00ff00, lightColor: 0xffffff, dark: 0x000000 };
scene.background = new THREE.Color(0xdfdfdf);
scene.background = new THREE.Color( data.dark );
scene.fog = new THREE.Fog( data.dark, 10, 60 );

//GUI
const gui = new GUI();

//LIGHTING
const ambientLight = new THREE.AmbientLight(data.lightColor, Math.PI)
ambientLight.visible = false
scene.add(ambientLight)

//DIRECTIONAL LIGHT
let directionalLight = new THREE.DirectionalLight(data.lightColor, Math.PI)
const lightFixedPoint = new THREE.Vector3(-2, 10, -2);
directionalLight.position.copy(lightFixedPoint)
directionalLight.castShadow = true
scene.add(directionalLight)

//POINT LIGHT
const pointLight = new THREE.PointLight(data.lightColor, Math.PI)
pointLight.position.set(2, 0, 0)
pointLight.visible = false
scene.add(pointLight)

//SPOT LIGHT
const spotLight = new THREE.SpotLight(data.lightColor, Math.PI)
spotLight.position.set(3, 2.5, 1)
spotLight.visible = false
spotLight.target.position.set(5, 0, -5)
scene.add(spotLight)

//RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 2
renderer.shadowMap.enabled = true
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

//CAMERA
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 10000)
camera.position.x = 10;
camera.position.y = 1;
camera.position.z = 0;
camera.lookAt(0,0,0)
//CAMERA ASPECT RATIO UPDATE ACCORDING TO WINDOW SIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

//ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

//F1 CAR GLTF (GLB)
let x: GLTF;
new GLTFLoader().load('/models/F1Custom.glb', (gltf) => {
  const model = gltf.scene
  scene.add(model)
  // model.castShadow = true
  // model.traverse(function (node) {
  //   if (node instanceof THREE.Mesh) {
  //       node.castShadow = true;
  //       if(node.userData.led) {
  //         //this is the node which is tail lamps
  //       }
  //   }
  // });

  //GUI FOR F1 CAR CONTROLS
  const carGUI = gui.addFolder('Car');
  carGUI.add(model.position, 'x', 0, 100);
  carGUI.add(model.position, 'y', 0, 100);
  carGUI.add(model.position, 'z', 0, 100);
  carGUI.add(model.rotation, 'x', 0, Math.PI * 2);
  carGUI.add(model.rotation, 'y', 0, Math.PI * 2);
  carGUI.add(model.rotation, 'z', 0, Math.PI * 2);
})

//PLANE TO RECIEVE SHADOW
const material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 50, side: THREE.DoubleSide }); // Adjust shininess as needed
const plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 200), material);
plane.rotation.x = -Math.PI / 2
plane.position.y = -1.05
plane.receiveShadow = true
// plane.castShadow = true
scene.add(plane)

directionalLight.shadow.mapSize.width = 2048; // optional
directionalLight.shadow.mapSize.height = 2048; // optional
directionalLight.shadow.camera.near = 0.1; // optional
directionalLight.shadow.camera.far = 1000;

//FONT LOADER
const fontLoader = new FontLoader();
const ttfLoader = new TTFLoader();
ttfLoader.load('/fonts/Formula1-Bold.ttf', (json) => {
  // First parse the font.
  const f1Font = fontLoader.parse(json);
  // Use parsed font as normal.
  const textGeometry = new TextGeometry('hello world', {
    // height: 2,
    // size: 3,
    font: f1Font,
  });
  const textMaterial = new THREE.MeshNormalMaterial();
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.x = 1;
  textMesh.position.y = 1;
  textMesh.scale.set(0.01, 0.01, 0.01);
  scene.add(textMesh);
});



//ANIMATION OF CAMERA AND CAR
// const orbitRadius = 8; // Radius of the circular orbit
// let angle = 0;
function animate() {
  requestAnimationFrame(animate)

  //CAMERA REVOLVING
  // camera.position.x = orbitRadius * Math.sin(angle)
  // camera.position.z = orbitRadius * Math.cos(angle);
  // angle +=0.001

  //CAR ROTATION
  // model.rotation.x += 0.002;
  // model.rotation.y += 0.002;
  // model.rotation.z += 0.002;

  if(x) {
    directionalLight.shadow.camera.position.copy(x.scene.position); // Update shadow camera position
    directionalLight.shadow.camera.lookAt(x.scene.position);
    directionalLight.castShadow = true
    x.scene.castShadow = true
  }
  plane.receiveShadow = true
  controls.update()
  renderer.render(scene, camera)
  stats.update()
}

animate()

//
//
//
//
//
//
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
//AMBIENT LIGHT GUI CONTROLS
const ambientLightFolder = gui.addFolder('AmbientLight')
ambientLightFolder.add(ambientLight, 'visible')
ambientLightFolder.addColor(data, 'lightColor').onChange(() => {
  ambientLight.color.set(data.lightColor)
})
ambientLightFolder.add(ambientLight, 'intensity', 0, Math.PI)

//DIRECTIONAL LIGHT GUI CONTROLS
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
directionalLightHelper.visible = false
scene.add(directionalLightHelper)
const directionalLightFolder = gui.addFolder('DirectionalLight')
directionalLightFolder.add(directionalLight, 'visible')
directionalLightFolder.addColor(data, 'lightColor').onChange(() => {
  directionalLight.color.set(data.lightColor)
})
directionalLightFolder.add(directionalLight, 'intensity', 0, Math.PI * 10)
const directionalLightFolderControls = directionalLightFolder.addFolder('Controls')
directionalLightFolderControls.add(directionalLight.position, 'x', -10, 10, 0.001).onChange(() => {
  directionalLightHelper.update()
})
directionalLightFolderControls.add(directionalLight.position, 'y', -10, 10, 0.001).onChange(() => {
  directionalLightHelper.update()
})
directionalLightFolderControls.add(directionalLight.position, 'z', -10, 10, 0.001).onChange(() => {
  directionalLightHelper.update()
})
directionalLightFolderControls.add(directionalLightHelper, 'visible').name('Helper Visible')
directionalLightFolderControls.close()

//POINT LIGHT GUI CONTROLS
const pointLightHelper = new THREE.PointLightHelper(pointLight)
pointLightHelper.visible = false
scene.add(pointLightHelper)
const pointLightFolder = gui.addFolder('Pointlight')
pointLightFolder.add(pointLight, 'visible')
pointLightFolder.addColor(data, 'lightColor').onChange(() => {
  pointLight.color.set(data.lightColor)
})
pointLightFolder.add(pointLight, 'intensity', 0, Math.PI * 10)
const pointLightFolderControls = pointLightFolder.addFolder('Controls')
pointLightFolderControls.add(pointLight.position, 'x', -10, 10)
pointLightFolderControls.add(pointLight.position, 'y', -10, 10)
pointLightFolderControls.add(pointLight.position, 'z', -10, 10)
pointLightFolderControls.add(pointLight, 'distance', 0, 20).onChange(() => {
  spotLightHelper.update()
})
pointLightFolderControls.add(pointLight, 'decay', 0, 10).onChange(() => {
  spotLightHelper.update()
})
pointLightFolderControls.add(pointLightHelper, 'visible').name('Helper Visible')
pointLightFolderControls.close()

//SPOT LIGHT GUI CONTROLS
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
spotLightHelper.visible = false
scene.add(spotLightHelper)
const spotLightFolder = gui.addFolder('Spotlight')
spotLightFolder.add(spotLight, 'visible')
spotLightFolder.addColor(data, 'lightColor').onChange(() => {
  spotLight.color.set(data.lightColor)
})
spotLightFolder.add(spotLight, 'intensity', 0, Math.PI * 10)
const spotLightFolderControls = spotLightFolder.addFolder('Controls')
spotLightFolderControls.add(spotLight.position, 'x', -10, 10).onChange(() => {
  spotLightHelper.update()
})
spotLightFolderControls.add(spotLight.position, 'y', -10, 10).onChange(() => {
  spotLightHelper.update()
})
spotLightFolderControls.add(spotLight.position, 'z', -10, 10).onChange(() => {
  spotLightHelper.update()
})
spotLightFolderControls.add(spotLight, 'distance', 0, 20).onChange(() => {
  spotLightHelper.update()
})
spotLightFolderControls.add(spotLight, 'decay', 0, 10).onChange(() => {
  spotLightHelper.update()
})
spotLightFolderControls.add(spotLight, 'angle', 0, 1).onChange(() => {
  spotLightHelper.update()
})
spotLightFolderControls.add(spotLight, 'penumbra', 0, 1, 0.001).onChange(() => {
  spotLightHelper.update()
})
spotLightFolderControls.add(spotLightHelper, 'visible').name('Helper Visible')
spotLightFolderControls.close()

//FPS TRACKER
const stats = new Stats()
document.body.appendChild(stats.dom)

//GUI FOR CAMERA CONTROLS
const cameraGUI = gui.addFolder('Camera');
cameraGUI.add(camera.position, 'x', -100, 100);
cameraGUI.add(camera.position, 'y', -100, 100);
cameraGUI.add(camera.position, 'z', -100, 100);
cameraGUI.add(camera.rotation, 'x', 0, Math.PI * 2);
cameraGUI.add(camera.rotation, 'y', 0, Math.PI * 2);
cameraGUI.add(camera.rotation, 'z', 0, Math.PI * 2);

//SHADOW HELPER
// const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(shadowHelper);