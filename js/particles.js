/**
 * STARCO 3D - Sistema de Partículas Monocromáticas (Platino, Diamante y Polvo Plateado)
 */

class CosmicParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.starfield = null;
    this.nebulaDust = null;
    this.bursts = [];
    this.currentColor = new THREE.Color(0xffffff); // Blanco plata
    this.init();
  }

  // Generador de textura circular con brillo suave en escala de grises
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
    const starCount = 2500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starScales = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 110;
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
      size: 0.7,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    // 2. Polvo cósmico reactivo cercano en plata/platino
    const dustCount = 700;
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
        z: (Math.random() - 0.5) * 0.012,
        originX: dustPositions[i3],
        originY: dustPositions[i3 + 1],
        originZ: dustPositions[i3 + 2]
      });
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    this.dustMat = new THREE.PointsMaterial({
      color: 0xd0d0d0,
      size: 1.2,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
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
    const count = 350;
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
      const speed = 0.12 + Math.random() * 0.4;

      velocities.push(new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi)
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: burstColor,
      size: 1.6,
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
      decay: 0.016
    });
  }

  setThemeColor(hexColor) {
    this.currentColor = new THREE.Color(0xffffff);
    if (this.dustMat) {
      this.dustMat.color.set(0xd0d0d0);
    }
  }

  update(mouseDeltaX = 0, mouseDeltaY = 0) {
    if (this.starfield) {
      this.starfield.rotation.y += 0.0002;
      this.starfield.rotation.x += 0.0001;
    }

    if (this.nebulaDust) {
      const posAttr = this.nebulaDust.geometry.attributes.position;
      const posArray = posAttr.array;

      for (let i = 0; i < this.dustVelocities.length; i++) {
        const i3 = i * 3;
        const vel = this.dustVelocities[i];

        posArray[i3] += vel.x + mouseDeltaX * 0.06;
        posArray[i3 + 1] += vel.y - mouseDeltaY * 0.06;
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
