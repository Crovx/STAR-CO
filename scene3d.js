/**
 * STARCO 3D - Coordinador de Escena Three.js, Luces de Galería Monocromática y Scroll Parallax
 */

class Scene3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Luces de alta fidelidad
    this.mainLight = null;
    this.rimLight = null;
    this.fillLight = null;
    this.ambientLight = null;

    // Subsistemas
    this.particleSystem = null;
    this.star = null;
    this.floatingElements = null;

    // Control de interacción y cámara
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    this.baseCameraDistance = 16;
    this.cameraDistance = 16;
    this.targetCameraDistance = 16;
    this.scrollY = 0;
    this.targetScrollOffset = 0;
    this.currentScrollOffset = 0;

    this.mouseNormalized = new THREE.Vector2();
    this.mouseDelta = { x: 0, y: 0 };

    // Raycasting para interactividad
    this.raycaster = new THREE.Raycaster();
    this.hoveredObject = null;

    this.init();
  }

  init() {
    // 1. Escena con niebla suave oscura
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x131313, 0.015);

    // 2. Cámara de perspectiva
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, this.cameraDistance);

    // 3. Renderer con antialiasing y mapeo de tonos
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Luces Monocromáticas
    this.setupLights();

    // 5. Instanciar Subsistemas 3D
    this.particleSystem = new CosmicParticleSystem(this.scene);
    this.star = new CosmicStar(this.scene, this.particleSystem);
    this.floatingElements = new FloatingElementsManager(this.scene, this.particleSystem);

    // 6. Configurar eventos de interacción
    this.setupEventListeners();

    // 7. Iniciar bucle de animación
    this.animate();
  }

  setupLights() {
    // Luz ambiental neutra
    this.ambientLight = new THREE.AmbientLight(0x222222, 1.6);
    this.scene.add(this.ambientLight);

    // Luz focal emitida por la estrella (Blanco Apex puro)
    this.mainLight = new THREE.PointLight(0xffffff, 3.8, 55, 1.2);
    this.mainLight.position.set(0, 0, 0);
    this.scene.add(this.mainLight);

    // Luz de contorno superior (Rim Light Platino)
    this.rimLight = new THREE.PointLight(0xe8e8e8, 2.5, 65, 1.4);
    this.rimLight.position.set(16, 14, 12);
    this.scene.add(this.rimLight);

    // Luz de relleno inferior (Fill Light Gris Acero)
    this.fillLight = new THREE.PointLight(0xaaaaaa, 2.0, 60, 1.5);
    this.fillLight.position.set(-16, -14, -10);
    this.scene.add(this.fillLight);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Eventos de mouse y touch
    window.addEventListener('mousedown', (e) => this.onPointerDown(e));
    window.addEventListener('mousemove', (e) => this.onPointerMove(e));
    window.addEventListener('mouseup', () => this.onPointerUp());

    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    window.addEventListener('touchend', () => this.onPointerUp());

    // Scroll parallax reactivo
    window.addEventListener('scroll', () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollFrac = maxScroll > 0 ? window.pageYOffset / maxScroll : 0;
      this.targetScrollOffset = scrollFrac * 12; // Desplazamiento vertical suave de la cámara
    }, { passive: true });

    // Clic en canvas / Raycasting
    this.container.addEventListener('click', (e) => this.onClick(e));
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onPointerDown(e) {
    if (e.target.closest('a, button, input, textarea, details, .hud-btn, .theme-pill')) {
      return;
    }
    this.isDragging = true;
    this.prevMousePos = { x: e.clientX, y: e.clientY };
  }

  onPointerMove(e) {
    this.mouseNormalized.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseNormalized.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (this.isDragging) {
      const deltaX = e.clientX - this.prevMousePos.x;
      const deltaY = e.clientY - this.prevMousePos.y;

      this.mouseDelta.x = deltaX * 0.005;
      this.mouseDelta.y = deltaY * 0.005;

      this.targetRotation.y += deltaX * 0.005;
      this.targetRotation.x += deltaY * 0.005;
      this.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.x));

      this.prevMousePos = { x: e.clientX, y: e.clientY };
    } else {
      this.mouseDelta.x = (e.clientX - window.innerWidth / 2) * 0.00003;
      this.mouseDelta.y = (e.clientY - window.innerHeight / 2) * 0.00003;
    }

    this.checkRaycastHover();
  }

  onPointerUp() {
    this.isDragging = false;
  }

  onTouchStart(e) {
    if (e.touches.length === 1 && !e.target.closest('a, button, input, textarea, details')) {
      const touch = e.touches[0];
      this.isDragging = true;
      this.prevMousePos = { x: touch.clientX, y: touch.clientY };
      this.mouseNormalized.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouseNormalized.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
  }

  onTouchMove(e) {
    if (this.isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.prevMousePos.x;
      const deltaY = touch.clientY - this.prevMousePos.y;

      this.targetRotation.y += deltaX * 0.006;
      this.targetRotation.x += deltaY * 0.006;
      this.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.x));

      this.prevMousePos = { x: touch.clientX, y: touch.clientY };
    }
  }

  checkRaycastHover() {
    if (!this.camera) return;
    this.raycaster.setFromCamera(this.mouseNormalized, this.camera);

    const targets = [];
    if (this.star && this.star.starMesh) targets.push(this.star.starMesh);
    if (this.floatingElements) {
      targets.push(...this.floatingElements.getInteractiveMeshes());
    }

    const intersects = this.raycaster.intersectObjects(targets, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      
      if (hit === this.star.starMesh || hit.parent === this.star.group) {
        if (this.hoveredObject !== this.star) {
          if (this.hoveredObject && this.hoveredObject !== this.star) {
            this.floatingElements.onElementUnhover(this.hoveredObject);
          }
          this.star.onPointerOver();
          this.hoveredObject = this.star;
        }
      } else {
        const rootMesh = hit.parent && hit.parent.type === 'Mesh' ? hit.parent : hit;
        if (this.hoveredObject !== rootMesh) {
          if (this.hoveredObject === this.star) {
            this.star.onPointerOut();
          } else if (this.hoveredObject) {
            this.floatingElements.onElementUnhover(this.hoveredObject);
          }
          this.floatingElements.onElementHover(rootMesh);
          this.hoveredObject = rootMesh;
        }
      }
    } else {
      if (this.hoveredObject === this.star) {
        this.star.onPointerOut();
      } else if (this.hoveredObject) {
        this.floatingElements.onElementUnhover(this.hoveredObject);
      }
      this.hoveredObject = null;
    }
  }

  onClick(e) {
    if (e.target.closest('a, button, input, textarea, details, .hud-btn, .theme-pill')) return;

    this.raycaster.setFromCamera(this.mouseNormalized, this.camera);
    const targets = [];
    if (this.star && this.star.starMesh) targets.push(this.star.starMesh);
    if (this.floatingElements) {
      targets.push(...this.floatingElements.getInteractiveMeshes());
    }

    const intersects = this.raycaster.intersectObjects(targets, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit === this.star.starMesh || hit.parent === this.star.group) {
        this.star.onClick();
      } else {
        const rootMesh = hit.parent && hit.parent.type === 'Mesh' ? hit.parent : hit;
        this.floatingElements.onElementClick(rootMesh);
      }
    } else {
      const spawnPos = new THREE.Vector3(
        this.mouseNormalized.x * 6,
        this.mouseNormalized.y * 6 - this.currentScrollOffset * 0.3,
        0
      );
      this.particleSystem.triggerSupernova(spawnPos, new THREE.Color(0xffffff));
      if (window.cosmicAudio) {
        window.cosmicAudio.playChime(440);
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Suavizado inercial de rotación de cámara
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.06;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.06;
    this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.06;
    this.currentScrollOffset += (this.targetScrollOffset - this.currentScrollOffset) * 0.05;

    // Posición esférica de cámara con offset de scroll
    const phi = Math.PI / 2 - this.currentRotation.x;
    const theta = this.currentRotation.y;

    this.camera.position.x = this.cameraDistance * Math.sin(phi) * Math.sin(theta);
    this.camera.position.y = this.cameraDistance * Math.cos(phi) - this.currentScrollOffset * 0.4;
    this.camera.position.z = this.cameraDistance * Math.sin(phi) * Math.cos(theta);
    this.camera.lookAt(0, -this.currentScrollOffset * 0.4, 0);

    // Rotación orbital lenta automática
    if (!this.isDragging) {
      this.targetRotation.y += 0.001;
    }

    // Actualizar subsistemas
    if (this.star) this.star.update(deltaTime);
    if (this.particleSystem) this.particleSystem.update(this.mouseDelta.x, this.mouseDelta.y);
    if (this.floatingElements) this.floatingElements.update(elapsedTime, deltaTime);

    this.renderer.render(this.scene, this.camera);
  }
}

window.Scene3D = Scene3D;
