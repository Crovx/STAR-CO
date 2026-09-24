/**
 * STARCO 3D - Estrella Monolítica Redondeada y Ultra-Animada en Tonos Grises
 * Arquitectura Monolithic Luxury Brutalism (Silver / Chrome / Platinum / White)
 */

class CosmicStar {
  constructor(scene, particleSystem) {
    this.scene = scene;
    this.particleSystem = particleSystem;
    this.group = new THREE.Group();
    
    this.rings = [];
    this.ringsVisible = true;
    this.coreMesh = null;
    this.starMesh = null;
    this.glowMesh = null;
    this.wireMesh = null;
    this.satellites = [];

    // Paleta estrictamente en escala de grises y cromo líquido
    this.mainColor = new THREE.Color(0xe5e2e1);      // Platino luminoso
    this.accentColor = new THREE.Color(0x8e9192);    // Acero cepillado
    this.coreColor = new THREE.Color(0xffffff);      // Blanco puro apex
    this.darkAccent = new THREE.Color(0x2a2a2a);     // Titanio oscuro

    // Estado de la animación de entrada
    this.isIntroAnimating = false;
    this.introProgress = 0;
    this.introDuration = 2.2;

    // Estado de interacción y dinámicas
    this.hovered = false;
    this.baseScale = 1.0;
    this.targetScale = 1.0;
    this.currentScale = 1.0;
    this.pulseTime = 0;
    this.spinVelocity = { x: 0.008, y: 0.014, z: 0.005 };

    this.init();
  }

  /**
   * Genera una estrella 3D redondeada y orgánica a partir de una icosaedro subdividido
   * donde los vértices se modulan suavemente hacia 12 puntas simétricas redondeadas.
   */
  createRoundedStarGeometry(baseRadius = 1.6, spikeHeight = 1.6, detail = 4) {
    // Partimos de una geometría icosaédrica de alta resolución
    const geo = new THREE.IcosahedronGeometry(baseRadius, detail);
    const pos = geo.attributes.position;
    const vertex = new THREE.Vector3();

    // 12 ejes directores canónicos del icosaedro (puntas de la estrella redondeada)
    const phi = (1 + Math.sqrt(5)) / 2;
    const poles = [
      new THREE.Vector3(1, phi, 0).normalize(),
      new THREE.Vector3(-1, phi, 0).normalize(),
      new THREE.Vector3(1, -phi, 0).normalize(),
      new THREE.Vector3(-1, -phi, 0).normalize(),
      new THREE.Vector3(0, 1, phi).normalize(),
      new THREE.Vector3(0, -1, phi).normalize(),
      new THREE.Vector3(0, 1, -phi).normalize(),
      new THREE.Vector3(0, -1, -phi).normalize(),
      new THREE.Vector3(phi, 0, 1).normalize(),
      new THREE.Vector3(-phi, 0, 1).normalize(),
      new THREE.Vector3(phi, 0, -1).normalize(),
      new THREE.Vector3(-phi, 0, -1).normalize()
    ];

    for (let i = 0; i < pos.count; i++) {
      vertex.fromBufferAttribute(pos, i);
      const normal = vertex.clone().normalize();

      // Encontrar la cercanía a los polos de la estrella
      let maxDot = 0;
      for (let p = 0; p < poles.length; p++) {
        const dot = Math.max(0, normal.dot(poles[p]));
        if (dot > maxDot) maxDot = dot;
      }

      // Elevación suave no lineal (redondeada, tipo flor estelar / cono elíptico)
      const bulge = Math.pow(maxDot, 3.2) * spikeHeight;
      const smoothFactor = 1.0 + bulge / baseRadius;

      vertex.multiplyScalar(smoothFactor);
      pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geo.computeVertexNormals();
    geo.attributes.position.needsUpdate = true;
    return geo;
  }

  init() {
    // 1. Malla Principal: Estrella 3D Facetada en Platino Luminoso y Cromo
    const starGeo = this.createRoundedStarGeometry(1.6, 1.8, 3);
    
    this.starMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      emissive: 0x222222,
      emissiveIntensity: 0.5,
      metalness: 0.4,
      roughness: 0.15,
      flatShading: true
    });

    this.starMesh = new THREE.Mesh(starGeo, this.starMat);
    this.starMesh.castShadow = true;
    this.starMesh.receiveShadow = true;
    this.group.add(this.starMesh);

    // 2. Malla Wireframe Geométrica Plateada Exterior
    const wireGeo = starGeo.clone();
    this.wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.wireMesh = new THREE.Mesh(wireGeo, this.wireMat);
    this.wireMesh.scale.set(1.03, 1.03, 1.03);
    this.group.add(this.wireMesh);

    // 3. Núcleo Interno Blanco Puro Apex (Luminous Center Core)
    const coreGeo = new THREE.IcosahedronGeometry(0.9, 2);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.9,
      metalness: 0.2,
      roughness: 0.1
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.group.add(this.coreMesh);

    // 4. Capa Esférica de Niebla Translúcida Plateada (Silver Mist Shield)
    const glowGeo = new THREE.SphereGeometry(3.6, 24, 24);
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      wireframe: true,
      blending: THREE.AdditiveBlending
    });
    this.glowMesh = new THREE.Mesh(glowGeo, this.glowMat);
    this.group.add(this.glowMesh);

    // 5. Anillos Orbitales de Platino y Titanio Cepillado
    this.createOrbitalRings();

    // 6. Micro-satélites orbitales en escala de grises
    this.createSatellites();

    // Posición inicial fija en el centro del viewport
    this.group.position.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);

    // Agregar todo el grupo a la escena
    this.scene.add(this.group);

    // Iniciar animación
    this.startIntroAnimation();
  }

  createOrbitalRings() {
    const ringSpecs = [
      { radius: 3.8, tube: 0.025, color: 0xffffff, opacity: 0.7, rotX: Math.PI / 4, rotY: 0 },
      { radius: 4.6, tube: 0.02,  color: 0xd0d0d0, opacity: 0.55, rotX: -Math.PI / 3, rotY: Math.PI / 5 },
      { radius: 5.4, tube: 0.015, color: 0x888888, opacity: 0.4, rotX: Math.PI / 6, rotY: -Math.PI / 4 }
    ];

    ringSpecs.forEach((spec, index) => {
      const ringGeo = new THREE.TorusGeometry(spec.radius, spec.tube, 12, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      
      ring.rotation.x = spec.rotX;
      ring.rotation.y = spec.rotY;
      
      this.rings.push({
        mesh: ring,
        rotSpeedX: 0.008 * (index % 2 === 0 ? 1 : -1) * (1.1 - index * 0.15),
        rotSpeedY: 0.012 * (index % 2 === 0 ? -1 : 1) * (1.0 - index * 0.1),
        rotSpeedZ: 0.006 * (index === 1 ? 1 : -0.5)
      });

      this.group.add(ring);
    });
  }

  createSatellites() {
    const satelliteGeo = new THREE.OctahedronGeometry(0.18, 0);
    const satelliteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x444444,
      metalness: 0.95,
      roughness: 0.1
    });

    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(satelliteGeo, satelliteMat);
      const orbitRadius = 4.0 + i * 0.7;
      const speed = 0.8 + i * 0.35;
      const inclination = (i * Math.PI) / 3;

      this.satellites.push({
        mesh: mesh,
        orbitRadius: orbitRadius,
        speed: speed,
        inclination: inclination,
        offset: (i * Math.PI) / 2
      });

      this.group.add(mesh);
    }
  }

  // Cinemática de entrada
  startIntroAnimation() {
    this.isIntroAnimating = true;
    this.introProgress = 0;
    this.introDuration = 0.8;

    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.set(0.6, 0.6, 0.6);

    if (window.cosmicAudio) {
      window.cosmicAudio.playWarp();
    }
  }

  toggleRings() {
    this.ringsVisible = !this.ringsVisible;
    this.rings.forEach(r => {
      r.mesh.visible = this.ringsVisible;
    });
    return this.ringsVisible;
  }

  setTheme(primaryHex = 0xffffff, secondaryHex = 0x8e9192) {
    // Mantener siempre tonos en escala de grises / cromo monocromático
    this.mainColor.set(0xe5e2e1);
    this.accentColor.set(0x8e9192);

    if (this.starMat) {
      this.starMat.color.set(0xf5f5f5);
      this.starMat.emissive.set(0x222222);
    }
  }

  onPointerOver() {
    this.hovered = true;
    this.targetScale = 1.14;
    this.spinVelocity.y = 0.035;
    if (this.starMat) this.starMat.emissiveIntensity = 0.7;
    if (this.coreMat) this.coreMat.emissiveIntensity = 1.2;
    document.body.style.cursor = 'pointer';
  }

  onPointerOut() {
    this.hovered = false;
    this.targetScale = 1.0;
    this.spinVelocity.y = 0.014;
    if (this.starMat) this.starMat.emissiveIntensity = 0.5;
    if (this.coreMat) this.coreMat.emissiveIntensity = 0.9;
    document.body.style.cursor = 'default';
  }

  onClick() {
    // Supernova burst en plata líquida
    this.targetScale = 1.35;
    this.spinVelocity.x = 0.08;
    this.spinVelocity.y = 0.12;

    if (this.particleSystem) {
      this.particleSystem.triggerSupernova(this.group.position, new THREE.Color(0xffffff));
    }
    if (window.cosmicAudio) {
      window.cosmicAudio.playSupernova();
      window.cosmicAudio.playChime(659.25);
    }

    const shockwave = document.getElementById('shockwave-overlay');
    if (shockwave) {
      shockwave.classList.remove('active');
      void shockwave.offsetWidth;
      shockwave.classList.add('active');
    }
  }

  update(deltaTime) {
    this.pulseTime += deltaTime * 2.0;

    // --- ANIMACIÓN DE ENTRADA SUAVE ---
    if (this.isIntroAnimating) {
      this.introProgress += deltaTime / this.introDuration;

      if (this.introProgress >= 1.0) {
        this.introProgress = 1.0;
        this.isIntroAnimating = false;
        this.group.scale.set(1, 1, 1);
      } else {
        const t = this.introProgress;
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const scaleVal = 0.6 + ease * 0.4;
        this.group.scale.set(scaleVal, scaleVal, scaleVal);
      }
    }

    // --- ANIMACIÓN IDLE CONTINUA Y MULTIEJE ---
    const rotSpeedX = this.spinVelocity.x;
    const rotSpeedY = this.spinVelocity.y;

    this.starMesh.rotation.y += rotSpeedY;
    this.starMesh.rotation.x += rotSpeedX;
    this.starMesh.rotation.z += Math.sin(this.pulseTime * 0.8) * 0.002;

    this.wireMesh.rotation.y = this.starMesh.rotation.y;
    this.wireMesh.rotation.x = this.starMesh.rotation.x;
    this.wireMesh.rotation.z = this.starMesh.rotation.z;

    // Restauración de velocidad de giro tras impulsos
    this.spinVelocity.x += (0.008 - this.spinVelocity.x) * 0.03;
    this.spinVelocity.y += ((this.hovered ? 0.035 : 0.014) - this.spinVelocity.y) * 0.03;

    // Respiración orgánica del núcleo (pulsación suave sinusoidal)
    const corePulse = 1.0 + Math.sin(this.pulseTime * 2.2) * 0.18;
    this.coreMesh.scale.set(corePulse, corePulse, corePulse);

    // Ondulación del resplandor
    const glowPulse = 1.0 + Math.cos(this.pulseTime * 1.6) * 0.08;
    this.glowMesh.scale.set(glowPulse, glowPulse, glowPulse);
    this.glowMesh.rotation.y -= 0.004;

    // Anillos orbitales giratorios
    if (this.ringsVisible) {
      this.rings.forEach(r => {
        r.mesh.rotation.x += r.rotSpeedX;
        r.mesh.rotation.y += r.rotSpeedY;
        r.mesh.rotation.z += r.rotSpeedZ;
      });
    }

    // Micro-satélites orbitales
    this.satellites.forEach(sat => {
      const angle = this.pulseTime * sat.speed + sat.offset;
      sat.mesh.position.x = Math.cos(angle) * sat.orbitRadius;
      sat.mesh.position.y = Math.sin(angle) * Math.sin(sat.inclination) * sat.orbitRadius;
      sat.mesh.position.z = Math.sin(angle) * Math.cos(sat.inclination) * sat.orbitRadius;
      sat.mesh.rotation.x += 0.04;
      sat.mesh.rotation.y += 0.05;
    });

    // Lerp suave para la escala
    this.currentScale += (this.targetScale - this.currentScale) * 0.1;
    this.group.scale.set(this.currentScale, this.currentScale, this.currentScale);

    if (this.targetScale > (this.hovered ? 1.14 : 1.0)) {
      this.targetScale += ((this.hovered ? 1.14 : 1.0) - this.targetScale) * 0.05;
    }
  }
}

window.CosmicStar = CosmicStar;
