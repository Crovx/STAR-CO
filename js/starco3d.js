/**
 * STARCO 3D - Monolithic Luxury Brutalism Engine (Unified Bundle)
 * Contiene: Audio Sintetizado, Partículas Cósmicas, Estrella 3D Facetada, Poliedros Flotantes y Coordinador de Escena.
 */

// ============================================================================
// 1. SISTEMA DE AUDIO PROCEDURAL (Web Audio API)
// ============================================================================
class CosmicAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  toggleAudio() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (!this.isMuted) {
      this.startAmbient();
      this.playChime(587.33);
    } else {
      this.stopAmbient();
    }

    return !this.isMuted;
  }

  startAmbient() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'sine';
      this.ambientOsc2.frequency.setValueAtTime(110.5, this.ctx.currentTime);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  stopAmbient() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.ambientOsc1) this.ambientOsc1.stop();
          if (this.ambientOsc2) this.ambientOsc2.stop();
        }, 500);
      } catch (e) {}
    }
  }

  playWarp() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(150, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 2.0);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 1.5);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
    } catch (e) {}
  }

  playSupernova() {
    if (this.isMuted || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 1.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, this.ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 1.2);

      subGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start();
      subOsc.stop(this.ctx.currentTime + 1.3);
    } catch (e) {}
  }

  playChime(freq = 523.25) {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.85);
    } catch (e) {}
  }
}

window.cosmicAudio = new CosmicAudio();


// ============================================================================
// 2. SISTEMA DE PARTÍCULAS MONOCROMÁTICAS (Polvo Estelar y Supernovas)
// ============================================================================
class CosmicParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.starfield = null;
    this.nebulaDust = null;
    this.bursts = [];
    this.currentColor = new THREE.Color(0xffffff);
    this.init();
  }

  createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(230, 230, 230, 0.85)');
    gradient.addColorStop(0.6, 'rgba(180, 180, 180, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  init() {
    const particleTexture = this.createParticleTexture();

    // 1. Campo de estrellas lejanas plateadas (Starfield)
    const starCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starScales = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 40 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = radius * Math.cos(phi);

      starScales[i] = 0.4 + Math.random() * 1.2;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('scale', new THREE.BufferAttribute(starScales, 1));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      map: particleTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    // 2. Polvo cósmico reactivo cercano en plata/platino
    const dustCount = 600;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustVelocities = [];

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      dustPositions[i3] = (Math.random() - 0.5) * 35;
      dustPositions[i3 + 1] = (Math.random() - 0.5) * 35;
      dustPositions[i3 + 2] = (Math.random() - 0.5) * 35;

      dustVelocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.012
      });
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    this.dustMat = new THREE.PointsMaterial({
      color: 0xe0e0e0,
      size: 1.3,
      map: particleTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.nebulaDust = new THREE.Points(dustGeo, this.dustMat);
    this.dustVelocities = dustVelocities;
    this.scene.add(this.nebulaDust);
  }

  triggerSupernova(origin = new THREE.Vector3(0, 0, 0), color = null) {
    const burstColor = color || new THREE.Color(0xffffff);
    const particleTexture = this.createParticleTexture();
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = origin.x;
      positions[i3 + 1] = origin.y;
      positions[i3 + 2] = origin.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 0.12 + Math.random() * 0.35;

      velocities.push(new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi)
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: burstColor,
      size: 1.8,
      map: particleTexture,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.bursts.push({
      points: points,
      velocities: velocities,
      geo: geo,
      mat: mat,
      life: 1.0,
      decay: 0.018
    });
  }

  update(mouseDeltaX = 0, mouseDeltaY = 0) {
    if (this.starfield) {
      this.starfield.rotation.y += 0.0003;
      this.starfield.rotation.x += 0.0001;
    }

    if (this.nebulaDust) {
      const posAttr = this.nebulaDust.geometry.attributes.position;
      const posArray = posAttr.array;

      for (let i = 0; i < this.dustVelocities.length; i++) {
        const i3 = i * 3;
        const vel = this.dustVelocities[i];

        posArray[i3] += vel.x + mouseDeltaX * 0.05;
        posArray[i3 + 1] += vel.y - mouseDeltaY * 0.05;
        posArray[i3 + 2] += vel.z;

        if (Math.abs(posArray[i3]) > 20) vel.x *= -1;
        if (Math.abs(posArray[i3 + 1]) > 20) vel.y *= -1;
        if (Math.abs(posArray[i3 + 2]) > 20) vel.z *= -1;
      }
      posAttr.needsUpdate = true;
      this.nebulaDust.rotation.y += 0.0008;
    }

    for (let b = this.bursts.length - 1; b >= 0; b--) {
      const burst = this.bursts[b];
      burst.life -= burst.decay;

      const posArray = burst.geo.attributes.position.array;
      for (let i = 0; i < burst.velocities.length; i++) {
        const i3 = i * 3;
        const vel = burst.velocities[i];

        posArray[i3] += vel.x;
        posArray[i3 + 1] += vel.y;
        posArray[i3 + 2] += vel.z;

        vel.multiplyScalar(0.97);
      }
      burst.geo.attributes.position.needsUpdate = true;
      burst.mat.opacity = Math.max(0, burst.life);

      if (burst.life <= 0) {
        this.scene.remove(burst.points);
        burst.geo.dispose();
        burst.mat.dispose();
        this.bursts.splice(b, 1);
      }
    }
  }
}

window.CosmicParticleSystem = CosmicParticleSystem;


// ============================================================================
// 3. ESTRELLA MONOLÍTICA 3D (Crystalline Platinum Star & Gyroscopic Rings)
// ============================================================================
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

    this.isIntroAnimating = false;
    this.introProgress = 0;
    this.introDuration = 1.0;

    this.hovered = false;
    this.baseScale = 1.0;
    this.targetScale = 1.0;
    this.currentScale = 1.0;
    this.pulseTime = 0;
    this.spinVelocity = { x: 0.008, y: 0.014, z: 0.005 };

    this.init();
  }

  createRoundedStarGeometry(baseRadius = 1.8, spikeHeight = 2.0, detail = 3) {
    const geo = new THREE.IcosahedronGeometry(baseRadius, detail);
    const pos = geo.attributes.position;
    const vertex = new THREE.Vector3();

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

      let maxDot = 0;
      for (let p = 0; p < poles.length; p++) {
        const dot = Math.max(0, normal.dot(poles[p]));
        if (dot > maxDot) maxDot = dot;
      }

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
    // 1. Malla Principal: Estrella Facetada en Platino Ultra-Brillante
    const starGeo = this.createRoundedStarGeometry(1.8, 2.0, 3);
    
    this.starMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x333333,
      emissiveIntensity: 0.7,
      metalness: 0.35,
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
      opacity: 0.45
    });
    this.wireMesh = new THREE.Mesh(wireGeo, this.wireMat);
    this.wireMesh.scale.set(1.03, 1.03, 1.03);
    this.group.add(this.wireMesh);

    // 3. Núcleo Interno Blanco Puro
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 2);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
      metalness: 0.1,
      roughness: 0.05
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.group.add(this.coreMesh);

    // 4. Capa Esférica de Resplandor
    const glowGeo = new THREE.SphereGeometry(4.0, 24, 24);
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
      blending: THREE.AdditiveBlending
    });
    this.glowMesh = new THREE.Mesh(glowGeo, this.glowMat);
    this.group.add(this.glowMesh);

    // 5. Anillos Orbitales
    this.createOrbitalRings();

    // 6. Satélites Orbitales
    this.createSatellites();

    // Posición inicial centrada
    this.group.position.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);

    this.scene.add(this.group);
    this.startIntroAnimation();
  }

  createOrbitalRings() {
    const ringSpecs = [
      { radius: 4.2, tube: 0.03,  color: 0xffffff, opacity: 0.8, rotX: Math.PI / 4, rotY: 0 },
      { radius: 5.2, tube: 0.025, color: 0xd8d8d8, opacity: 0.65, rotX: -Math.PI / 3, rotY: Math.PI / 5 },
      { radius: 6.2, tube: 0.02,  color: 0xaaaaaa, opacity: 0.5, rotX: Math.PI / 6, rotY: -Math.PI / 4 }
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
    const satelliteGeo = new THREE.OctahedronGeometry(0.22, 0);
    const satelliteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x555555,
      metalness: 0.8,
      roughness: 0.1
    });

    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(satelliteGeo, satelliteMat);
      const orbitRadius = 4.6 + i * 0.8;
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

  startIntroAnimation() {
    this.isIntroAnimating = true;
    this.introProgress = 0;
    this.introDuration = 0.8;

    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.targetScale = 1.0;
    this.currentScale = 0.6;
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

  onPointerOver() {
    this.hovered = true;
    this.targetScale = 1.15;
    this.spinVelocity.y = 0.035;
    if (this.starMat) this.starMat.emissiveIntensity = 0.9;
    if (this.coreMat) this.coreMat.emissiveIntensity = 1.3;
    document.body.style.cursor = 'pointer';
  }

  onPointerOut() {
    this.hovered = false;
    this.targetScale = 1.0;
    this.spinVelocity.y = 0.014;
    if (this.starMat) this.starMat.emissiveIntensity = 0.7;
    if (this.coreMat) this.coreMat.emissiveIntensity = 1.0;
    document.body.style.cursor = 'default';
  }

  onClick() {
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

    // Animación de entrada suave
    if (this.isIntroAnimating) {
      this.introProgress += deltaTime / this.introDuration;
      if (this.introProgress >= 1.0) {
        this.introProgress = 1.0;
        this.isIntroAnimating = false;
      }
    }

    // Rotación multieje
    this.starMesh.rotation.y += this.spinVelocity.y;
    this.starMesh.rotation.x += this.spinVelocity.x;
    this.starMesh.rotation.z += Math.sin(this.pulseTime * 0.8) * 0.002;

    this.wireMesh.rotation.y = this.starMesh.rotation.y;
    this.wireMesh.rotation.x = this.starMesh.rotation.x;
    this.wireMesh.rotation.z = this.starMesh.rotation.z;

    this.spinVelocity.x += (0.008 - this.spinVelocity.x) * 0.03;
    this.spinVelocity.y += ((this.hovered ? 0.035 : 0.014) - this.spinVelocity.y) * 0.03;

    // Pulsación del núcleo
    const corePulse = 1.0 + Math.sin(this.pulseTime * 2.2) * 0.18;
    this.coreMesh.scale.set(corePulse, corePulse, corePulse);

    // Ondulación del resplandor
    const glowPulse = 1.0 + Math.cos(this.pulseTime * 1.6) * 0.08;
    this.glowMesh.scale.set(glowPulse, glowPulse, glowPulse);
    this.glowMesh.rotation.y -= 0.004;

    // Anillos orbitales
    if (this.ringsVisible) {
      this.rings.forEach(r => {
        r.mesh.rotation.x += r.rotSpeedX;
        r.mesh.rotation.y += r.rotSpeedY;
        r.mesh.rotation.z += r.rotSpeedZ;
      });
    }

    // Satélites
    this.satellites.forEach(sat => {
      const angle = this.pulseTime * sat.speed + sat.offset;
      sat.mesh.position.x = Math.cos(angle) * sat.orbitRadius;
      sat.mesh.position.y = Math.sin(angle) * Math.sin(sat.inclination) * sat.orbitRadius;
      sat.mesh.position.z = Math.sin(angle) * Math.cos(sat.inclination) * sat.orbitRadius;
      sat.mesh.rotation.x += 0.04;
      sat.mesh.rotation.y += 0.05;
    });

    // Escala
    this.currentScale += (this.targetScale - this.currentScale) * 0.1;
    this.group.scale.set(this.currentScale, this.currentScale, this.currentScale);

    if (this.targetScale > (this.hovered ? 1.15 : 1.0)) {
      this.targetScale += ((this.hovered ? 1.15 : 1.0) - this.targetScale) * 0.05;
    }
  }
}

window.CosmicStar = CosmicStar;


// ============================================================================
// 4. POLIEDROS GEOMÉTRICOS FLOTANTES
// ============================================================================
class FloatingElementsManager {
  constructor(scene, particleSystem) {
    this.scene = scene;
    this.particleSystem = particleSystem;
    this.elements = [];
    this.init();
  }

  init() {
    const configs = [
      {
        type: 'icosahedron',
        geo: new THREE.IcosahedronGeometry(0.9, 0),
        pos: new THREE.Vector3(6.5, 3.2, -2),
        rotSpeed: { x: 0.012, y: 0.015, z: 0.008 },
        color: 0xf0f0f0,
        emissive: 0x252525,
        metalness: 0.45,
        roughness: 0.18,
        floatSpeed: 1.8,
        floatOffset: 0
      },
      {
        type: 'octahedron',
        geo: new THREE.OctahedronGeometry(0.8, 0),
        pos: new THREE.Vector3(-6.5, 3.5, -2),
        rotSpeed: { x: -0.015, y: 0.01, z: 0.012 },
        color: 0xd0d0d0,
        emissive: 0x222222,
        metalness: 0.45,
        roughness: 0.2,
        floatSpeed: 2.2,
        floatOffset: 1.5
      },
      {
        type: 'torusKnot',
        geo: new THREE.TorusKnotGeometry(0.55, 0.16, 64, 16),
        pos: new THREE.Vector3(-5.8, -3.5, -1.5),
        rotSpeed: { x: 0.018, y: -0.014, z: 0.01 },
        color: 0x888888,
        emissive: 0x181818,
        metalness: 0.5,
        roughness: 0.25,
        floatSpeed: 1.5,
        floatOffset: 3.0
      },
      {
        type: 'dodecahedron',
        geo: new THREE.DodecahedronGeometry(0.75, 0),
        pos: new THREE.Vector3(6.2, -3.5, -1.5),
        rotSpeed: { x: -0.01, y: -0.02, z: 0.015 },
        color: 0xe0e0e0,
        emissive: 0x252525,
        metalness: 0.45,
        roughness: 0.18,
        floatSpeed: 2.0,
        floatOffset: 4.5
      },
      {
        type: 'pyramid',
        geo: new THREE.ConeGeometry(0.75, 1.4, 4),
        pos: new THREE.Vector3(0, 5.5, -3),
        rotSpeed: { x: 0.02, y: 0.02, z: 0 },
        color: 0xffffff,
        emissive: 0x303030,
        metalness: 0.4,
        roughness: 0.15,
        floatSpeed: 2.5,
        floatOffset: 2.0
      },
      {
        type: 'gem',
        geo: new THREE.TetrahedronGeometry(0.7, 0),
        pos: new THREE.Vector3(-1.5, -5.2, -2.5),
        rotSpeed: { x: 0.015, y: -0.018, z: 0.01 },
        color: 0xa0a0a0,
        emissive: 0x202020,
        metalness: 0.48,
        roughness: 0.22,
        floatSpeed: 1.7,
        floatOffset: 5.2
      }
    ];

    configs.forEach(cfg => {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.emissive,
        emissiveIntensity: 0.65,
        metalness: cfg.metalness,
        roughness: cfg.roughness,
        flatShading: true
      });

      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.position.copy(cfg.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const wireGeo = cfg.geo.clone();
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.scale.set(1.05, 1.05, 1.05);
      mesh.add(wireMesh);

      this.scene.add(mesh);

      this.elements.push({
        mesh: mesh,
        mat: mat,
        basePos: cfg.pos.clone(),
        rotSpeed: cfg.rotSpeed,
        floatSpeed: cfg.floatSpeed,
        floatOffset: cfg.floatOffset,
        hovered: false,
        scaleCurrent: 1.0,
        scaleTarget: 1.0,
        spinMultiplier: 1.0
      });
    });
  }

  getInteractiveMeshes() {
    return this.elements.map(e => e.mesh);
  }

  onElementHover(mesh) {
    const el = this.elements.find(e => e.mesh === mesh);
    if (el) {
      el.hovered = true;
      el.scaleTarget = 1.35;
      el.mat.emissiveIntensity = 1.0;
      document.body.style.cursor = 'pointer';
    }
  }

  onElementUnhover(mesh) {
    const el = this.elements.find(e => e.mesh === mesh);
    if (el) {
      el.hovered = false;
      el.scaleTarget = 1.0;
      el.mat.emissiveIntensity = 0.65;
      document.body.style.cursor = 'default';
    }
  }

  onElementClick(mesh) {
    const el = this.elements.find(e => e.mesh === mesh);
    if (el) {
      el.scaleTarget = 1.6;
      el.spinMultiplier = 5.0;

      if (this.particleSystem) {
        this.particleSystem.triggerSupernova(el.mesh.position, new THREE.Color(0xffffff));
      }
      if (window.cosmicAudio) {
        window.cosmicAudio.playChime(784 + Math.random() * 200);
      }
    }
  }

  update(time, deltaTime) {
    this.elements.forEach(el => {
      const floatY = Math.sin(time * el.floatSpeed + el.floatOffset) * 0.45;
      el.mesh.position.y = el.basePos.y + floatY;

      el.mesh.rotation.x += el.rotSpeed.x * el.spinMultiplier;
      el.mesh.rotation.y += el.rotSpeed.y * el.spinMultiplier;
      el.mesh.rotation.z += el.rotSpeed.z * el.spinMultiplier;

      if (el.spinMultiplier > 1.0) {
        el.spinMultiplier += (1.0 - el.spinMultiplier) * 0.04;
      }

      el.scaleCurrent += (el.scaleTarget - el.scaleCurrent) * 0.12;
      el.mesh.scale.set(el.scaleCurrent, el.scaleCurrent, el.scaleCurrent);

      if (el.scaleTarget > (el.hovered ? 1.35 : 1.0)) {
        el.scaleTarget += ((el.hovered ? 1.35 : 1.0) - el.scaleTarget) * 0.08;
      }
    });
  }
}

window.FloatingElementsManager = FloatingElementsManager;


// ============================================================================
// 5. COORDINADOR PRINCIPAL DE ESCENA THREE.JS
// ============================================================================
class Scene3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    this.particleSystem = null;
    this.star = null;
    this.floatingElements = null;

    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    
    const aspect = window.innerWidth / window.innerHeight;
    this.baseCameraDistance = aspect < 1.0 ? 20 : 15;
    this.cameraDistance = this.baseCameraDistance;
    this.targetCameraDistance = this.baseCameraDistance;
    
    this.targetScrollOffset = 0;
    this.currentScrollOffset = 0;

    this.mouseNormalized = new THREE.Vector2();
    this.mouseDelta = { x: 0, y: 0 };

    this.raycaster = new THREE.Raycaster();
    this.hoveredObject = null;

    this.init();
  }

  init() {
    // 1. Escena
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x131313, 0.008);

    // 2. Cámara
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, this.cameraDistance);

    // 3. Renderer con alta compatibilidad y fallback
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true
      });
    } catch (e) {
      this.renderer = new THREE.WebGLRenderer({ alpha: true });
    }

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;

    this.renderer.domElement.style.width = '100vw';
    this.renderer.domElement.style.height = '100vh';
    this.renderer.domElement.style.display = 'block';

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Luces de Estudio Monocromáticas
    this.setupLights();

    // 5. Instanciar Subsistemas 3D
    this.particleSystem = new CosmicParticleSystem(this.scene);
    this.star = new CosmicStar(this.scene, this.particleSystem);
    this.floatingElements = new FloatingElementsManager(this.scene, this.particleSystem);

    // 6. Eventos
    this.setupEventListeners();

    // 7. Loop
    this.animate();
  }

  setupLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.8);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    this.keyLight.position.set(12, 16, 14);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xd4d4d4, 2.2);
    this.fillLight.position.set(-14, -8, 12);
    this.scene.add(this.fillLight);

    this.backLight = new THREE.DirectionalLight(0xffffff, 2.8);
    this.backLight.position.set(0, 14, -16);
    this.scene.add(this.backLight);

    this.frontLight = new THREE.PointLight(0xffffff, 4.0, 50, 1.0);
    this.frontLight.position.set(0, 1.5, 6);
    this.scene.add(this.frontLight);

    this.mainLight = new THREE.PointLight(0xffffff, 3.2, 35, 1.0);
    this.mainLight.position.set(0, 0, 0);
    this.scene.add(this.mainLight);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    window.addEventListener('mousedown', (e) => this.onPointerDown(e));
    window.addEventListener('mousemove', (e) => this.onPointerMove(e));
    window.addEventListener('mouseup', () => this.onPointerUp());

    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    window.addEventListener('touchend', () => this.onPointerUp());

    window.addEventListener('scroll', () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollFrac = maxScroll > 0 ? window.pageYOffset / maxScroll : 0;
      this.targetScrollOffset = scrollFrac * 12;
    }, { passive: true });

    this.container.addEventListener('click', (e) => this.onClick(e));
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.baseCameraDistance = aspect < 1.0 ? 20 : 15;
    this.targetCameraDistance = this.baseCameraDistance;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onPointerDown(e) {
    if (e.target.closest('a, button, input, textarea, details, article')) return;
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
    if (e.touches.length === 1 && !e.target.closest('a, button, input, textarea, details, article')) {
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
    if (e.target.closest('a, button, input, textarea, details, article')) return;

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

    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.06;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.06;
    this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.06;
    this.currentScrollOffset += (this.targetScrollOffset - this.currentScrollOffset) * 0.05;

    const phi = Math.PI / 2 - this.currentRotation.x;
    const theta = this.currentRotation.y;

    this.camera.position.x = this.cameraDistance * Math.sin(phi) * Math.sin(theta);
    this.camera.position.y = this.cameraDistance * Math.cos(phi) - this.currentScrollOffset * 0.4;
    this.camera.position.z = this.cameraDistance * Math.sin(phi) * Math.cos(theta);
    this.camera.lookAt(0, -this.currentScrollOffset * 0.4, 0);

    if (!this.isDragging) {
      this.targetRotation.y += 0.001;
    }

    if (this.star) this.star.update(deltaTime);
    if (this.particleSystem) this.particleSystem.update(this.mouseDelta.x, this.mouseDelta.y);
    if (this.floatingElements) this.floatingElements.update(elapsedTime, deltaTime);

    this.renderer.render(this.scene, this.camera);
  }
}

window.Scene3D = Scene3D;


// ============================================================================
// 6. INICIALIZADOR DE LA APLICACIÓN
// ============================================================================
function initStarcoApp() {
  if (window.starcoAppInitialized) return;

  if (typeof THREE === 'undefined') {
    console.warn("Three.js no detectado aún. Esperando...");
    setTimeout(initStarcoApp, 100);
    return;
  }

  window.starcoAppInitialized = true;

  const container = document.getElementById('webgl-container');
  let scene3D = null;
  if (container) {
    try {
      scene3D = new Scene3D('webgl-container');
      window.starcoScene = scene3D;
      console.log("🌟 STAR/CO 3D Grayscale Engine inicializado con éxito.");
    } catch (err) {
      console.error("Error al instanciar Scene3D:", err);
    }
  }

  const btnAudio = document.getElementById('btn-audio');
  const audioIcon = document.getElementById('audio-icon');
  const btnReplay = document.getElementById('btn-replay');

  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      if (window.cosmicAudio) {
        const isPlaying = window.cosmicAudio.toggleAudio();
        if (isPlaying) {
          btnAudio.classList.add('active');
          if (audioIcon) audioIcon.className = 'fa-solid fa-volume-high';
        } else {
          btnAudio.classList.remove('active');
          if (audioIcon) audioIcon.className = 'fa-solid fa-volume-xmark';
        }
      }
    });
  }

  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      if (scene3D && scene3D.star) {
        scene3D.star.startIntroAnimation();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (scene3D && scene3D.star) scene3D.star.onClick();
    } else if (e.code === 'KeyR') {
      if (scene3D && scene3D.star) scene3D.star.startIntroAnimation();
    } else if (e.code === 'KeyM' && btnAudio) {
      btnAudio.click();
    }
  });
}

window.initStarcoApp = initStarcoApp;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStarcoApp);
} else {
  initStarcoApp();
}
window.addEventListener('load', initStarcoApp);
