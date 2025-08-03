// ===== HERO ÉPICO - THREE.JS AVANZADO =====

class EpicHero3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.planet = null;
    this.nodes = [];
    this.connections = [];
    this.particles = [];
    this.energyRings = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.animationId = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
    this.setupScene();
    this.createPlanet();
    this.createNodes();
    this.createConnections();
      this.createParticles();
      this.createEnergyRings();
      this.createDataStreams();
      this.setupLighting();
      this.setupEventListeners();
    this.animate();
      this.isInitialized = true;
      console.log('🚀 Hero 3D Épico inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar Hero 3D:', error);
    }
  }

  setupScene() {
    const container = document.getElementById('hero3dWorld');
    if (!container) {
      console.error('❌ No se encontró el contenedor hero3dWorld');
      return;
    }

    // Escena
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 50, 200);

    // Cámara
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 50);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    container.appendChild(this.renderer.domElement);
  }

  createPlanet() {
    // Geometría del planeta
    const planetGeometry = new THREE.SphereGeometry(8, 64, 64);
    
    // Material del planeta con textura
    const planetMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x004422,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });

    this.planet = new THREE.Mesh(planetGeometry, planetMaterial);
    this.planet.castShadow = true;
    this.planet.receiveShadow = true;
    this.scene.add(this.planet);

    // Atmósfera
    const atmosphereGeometry = new THREE.SphereGeometry(8.5, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.scene.add(atmosphere);

    // Anillos de energía
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(10 + i * 2, 10.5 + i * 2, 64);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.1 - i * 0.02,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = i * 0.5;
      this.scene.add(ring);
    }
  }

  createNodes() {
    const nodeCount = 12;
    const radius = 25;
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 10;

      // Geometría del nodo
      const nodeGeometry = new THREE.SphereGeometry(0.8, 16, 16);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6b35,
        emissive: 0x442211,
        shininess: 100
      });

      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(x, y, z);
      node.castShadow = true;
      this.scene.add(node);

      // Aura del nodo
      const auraGeometry = new THREE.SphereGeometry(1.2, 16, 16);
      const auraMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      });

      const aura = new THREE.Mesh(auraGeometry, auraMaterial);
      aura.position.set(x, y, z);
      this.scene.add(aura);

      this.nodes.push({ mesh: node, aura: aura, originalPosition: { x, y, z } });
    }
  }

  createConnections() {
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        if (Math.random() < 0.3) { // 30% de probabilidad de conexión
          const startNode = this.nodes[i].mesh.position;
          const endNode = this.nodes[j].mesh.position;

          const direction = new THREE.Vector3().subVectors(endNode, startNode);
          const length = direction.length();
          direction.normalize();

          const connectionGeometry = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
          const connectionMaterial = new THREE.MeshPhongMaterial({
            color: 0x4ecdc4,
            transparent: true,
            opacity: 0.6
          });
          
          const connection = new THREE.Mesh(connectionGeometry, connectionMaterial);
          connection.position.copy(startNode).add(direction.clone().multiplyScalar(length / 2));
          connection.lookAt(endNode);
          this.scene.add(connection);

          this.connections.push(connection);
        }
      }
    }
  }

  createParticles() {
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);
  }

  createEnergyRings() {
    for (let i = 0; i < 5; i++) {
      const ringGeometry = new THREE.RingGeometry(15 + i * 3, 15.5 + i * 3, 64);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.1 - i * 0.015,
        side: THREE.DoubleSide
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = i * 2;
      this.scene.add(ring);
      this.energyRings.push(ring);
    }
  }

  createDataStreams() {
    const streamCount = 8;
    
    for (let i = 0; i < streamCount; i++) {
      const angle = (i / streamCount) * Math.PI * 2;
      const radius = 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const streamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 40, 8);
      const streamMaterial = new THREE.MeshPhongMaterial({
        color: 0x4ecdc4,
        transparent: true,
        opacity: 0.4
      });

      const stream = new THREE.Mesh(streamGeometry, streamMaterial);
      stream.position.set(x, 0, z);
      stream.rotation.z = Math.PI / 2;
      this.scene.add(stream);
    }
  }

  setupLighting() {
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Luz direccional principal
    const directionalLight = new THREE.DirectionalLight(0x00ff88, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Luz puntual para el planeta
    const planetLight = new THREE.PointLight(0x00ff88, 2, 100);
    planetLight.position.set(0, 0, 0);
    this.scene.add(planetLight);

    // Luces de los nodos
    this.nodes.forEach((node, index) => {
      const nodeLight = new THREE.PointLight(0xff6b35, 1, 20);
      nodeLight.position.copy(node.mesh.position);
      this.scene.add(nodeLight);
    });
  }

  setupEventListeners() {
    // Mouse movement
    document.addEventListener('mousemove', (event) => {
      this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Window resize
    window.addEventListener('resize', () => {
      const container = document.getElementById('hero3dWorld');
      if (container && this.camera && this.renderer) {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
      }
    });

    // Scroll effect
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = 500;
      const progress = Math.min(scrollY / maxScroll, 1);
      
      if (this.camera) {
        this.camera.position.z = 50 + progress * 20;
      }
    });
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Rotación del planeta
    if (this.planet) {
      this.planet.rotation.y += 0.005;
      this.planet.rotation.x = Math.sin(time * 0.5) * 0.1;
    }

    // Animación de los nodos
    this.nodes.forEach((node, index) => {
      const angle = time + index * 0.5;
      const radius = 25;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 5;

      node.mesh.position.set(x, y, z);
      node.aura.position.set(x, y, z);
      node.aura.rotation.y += 0.02;

      // Efecto de pulso
      const scale = 1 + Math.sin(time * 3 + index) * 0.1;
      node.mesh.scale.setScalar(scale);
      node.aura.scale.setScalar(scale * 1.2);
    });

    // Animación de las conexiones
    this.connections.forEach((connection, index) => {
      connection.material.opacity = 0.3 + Math.sin(time * 2 + index) * 0.3;
    });

    // Animación de los anillos de energía
    this.energyRings.forEach((ring, index) => {
      ring.rotation.z += 0.01 + index * 0.005;
      ring.material.opacity = 0.1 + Math.sin(time + index) * 0.05;
    });

    // Animación de las partículas
    this.particles.forEach((particleSystem) => {
      particleSystem.rotation.y += 0.001;
      particleSystem.rotation.x += 0.0005;
    });

    // Efecto de cámara con mouse
    if (this.camera) {
      this.camera.position.x += (this.mouseX * 10 - this.camera.position.x) * 0.05;
      this.camera.position.y += (this.mouseY * 10 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);
    }

    // Render
    if (this.renderer && this.scene && this.camera) {
    this.renderer.render(this.scene, this.camera);
    }
  }

  // Métodos públicos para control externo
  setIntensity(intensity) {
    if (this.planet) {
      this.planet.material.emissive.setHex(0x004422 * intensity);
    }
  }

  addExplosion(x, y, z) {
    const explosionGeometry = new THREE.SphereGeometry(1, 16, 16);
    const explosionMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 1
    });

    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.set(x, y, z);
    this.scene.add(explosion);

    // Animación de explosión
    let scale = 1;
    const animateExplosion = () => {
      scale += 0.1;
      explosion.scale.setScalar(scale);
      explosion.material.opacity -= 0.02;

      if (explosion.material.opacity > 0) {
        requestAnimationFrame(animateExplosion);
      } else {
        this.scene.remove(explosion);
      }
    };
    animateExplosion();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      const container = document.getElementById('hero3dWorld');
      if (container && this.renderer.domElement) {
        container.removeChild(this.renderer.domElement);
    }
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.epicHero3D = new EpicHero3D();
}); 

// Exportar para uso global
window.EpicHero3D = EpicHero3D; 