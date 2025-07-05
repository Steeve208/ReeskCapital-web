/* ================================
   HERO-3D.JS — EFECTOS 3D AVANZADOS
================================ */

class Hero3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = [];
    this.mouse = { x: 0, y: 0 };
    this.time = 0;
    this.init();
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.createObjects();
    this.setupLights();
    this.setupEvents();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x131626);
    this.scene.fog = new THREE.Fog(0x131626, 10, 100);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 5);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);
  }

  createObjects() {
    // Geometría principal - Torus Knot
    const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const torusKnotMaterial = new THREE.MeshPhongMaterial({
      color: 0x7657fc,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });
    this.torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    this.torusKnot.castShadow = true;
    this.torusKnot.receiveShadow = true;
    this.scene.add(this.torusKnot);
    this.objects.push(this.torusKnot);

    // Esferas flotantes
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.7, 0.5),
        transparent: true,
        opacity: 0.6
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      sphere.userData = {
        originalPosition: sphere.position.clone(),
        speed: Math.random() * 0.02 + 0.01,
        rotationSpeed: Math.random() * 0.02 + 0.01
      };
      this.scene.add(sphere);
      this.objects.push(sphere);
    }

    // Partículas
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.7, 0.5);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);
    this.objects.push(this.particles);

    // Líneas de conexión
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];

    for (let i = 0; i < 50; i++) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      linePositions.push(start.x, start.y, start.z, end.x, end.y, end.z);
      
      const color = new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.7, 0.5);
      lineColors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3
    });

    this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.lines);
    this.objects.push(this.lines);
  }

  setupLights() {
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0x7657fc, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Luz puntual
    const pointLight = new THREE.PointLight(0x3fd8c2, 1, 100);
    pointLight.position.set(-5, 5, 5);
    this.scene.add(pointLight);

    // Luz de relleno
    const fillLight = new THREE.DirectionalLight(0xe0c64a, 0.5);
    fillLight.position.set(-5, -5, -5);
    this.scene.add(fillLight);
  }

  setupEvents() {
    // Mouse move
    document.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });

    // Touch events para móviles
    document.addEventListener('touchmove', (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.time += 0.01;

    // Rotar torus knot
    this.torusKnot.rotation.x += 0.01;
    this.torusKnot.rotation.y += 0.01;
    this.torusKnot.scale.setScalar(1 + Math.sin(this.time) * 0.1);

    // Animar esferas
    this.objects.forEach((object, index) => {
      if (index > 0 && index <= 8) { // Esferas
        const userData = object.userData;
        object.position.x = userData.originalPosition.x + Math.sin(this.time * userData.speed) * 2;
        object.position.y = userData.originalPosition.y + Math.cos(this.time * userData.speed) * 2;
        object.rotation.x += userData.rotationSpeed;
        object.rotation.y += userData.rotationSpeed;
      }
    });

    // Animar partículas
    if (this.particles) {
      this.particles.rotation.x += 0.001;
      this.particles.rotation.y += 0.001;
    }

    // Animar líneas
    if (this.lines) {
      this.lines.rotation.x += 0.002;
      this.lines.rotation.y += 0.002;
    }

    // Mover cámara con mouse
    this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  // Métodos públicos para control externo
  setIntensity(intensity) {
    this.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity = intensity;
      }
    });
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.animate();
  }

  destroy() {
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
  const heroContainer = document.getElementById('hero-3d-container');
  if (heroContainer && typeof THREE !== 'undefined') {
    window.hero3D = new Hero3D(heroContainer);
  }
});

// Exportar para uso global
window.Hero3D = Hero3D; 