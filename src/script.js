import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { RedFormat } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/2.png')

/**
 * Particles
 */

const particlesGeometry = new THREE.BufferGeometry()
const count = 20000

const particlesPositions = new Float32Array(count * 3)
const particlesColors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
  particlesPositions[i] = (Math.random() - 0.5) * 10
  particlesColors[i] = Math.random()
}

particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(particlesPositions, 3)
)

particlesGeometry.setAttribute(
  'color',
  new THREE.BufferAttribute(particlesColors, 3)
)

// Material
const particlesMaterial = new THREE.PointsMaterial({
  //   color: new THREE.Color('#ff88cc'),
  size: 0.1,
  sizeAttenuation: true,
  transparent: true,
  alphaMap: particleTexture,
  //   alphaTest doesn't work too well...
  //   alphaTest: 0.001,
  //   depthTest can create bugs with other objects in scene
  //   depthTest: false,
  //   depthWrite works great with other objects in scene
  depthWrite: false,
  //   webGL drawls pixels on top of eachother
  //    with blending, the two pixel's colors are added together when on top of eachother
  blending: THREE.AdditiveBlending,
  vertexColors: true,
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial()
)
// scene.add(cube)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

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
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update Particles
  // animate all particles simultaneously
  // particles.rotation.y =   elapsedTime * .02

  for (let i = 0; i < count; i++) {
    //   this technique works for a small number of particles
    // but for lots of particles, is a huge load on gpu. performance will suffer.
    const i3 = i * 3
    const x = particlesGeometry.attributes.position.array[i3]
    // access y axis of each particle
    particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(
      elapsedTime + x
    )
  }
  // need to tell threejs to update the position attribute in order to animate
  particlesGeometry.attributes.position.needsUpdate = true

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
