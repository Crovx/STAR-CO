/**
 * STARCO 3D - Cuerpos Geométricos Flotantes en Escala de Grises y Titanio
 * Arquitectura Monolítica Minimalista (Chrome, Silver, Obsidian, Platinum)
 */

class FloatingElementsManager {
  constructor(scene, particleSystem) {
    this.scene = scene;
    this.particleSystem = particleSystem;
    this.elements = [];
    
    // Paleta estrictamente en escala de grises
    this.currentColor = new THREE.Color(0xdcdcdc); // Plata pulida
    this.accentColor = new THREE.Color(0x757575);  // Titanio medio
    
    this.init();
  }

  init() {
    const configs = [
      {
        type: 'icosahedron',
        geo: new THREE.IcosahedronGeometry(0.85, 0),
        pos: new THREE.Vector3(7.5, 3.5, -3),
        rotSpeed: { x: 0.012, y: 0.015, z: 0.008 },
        color: 0xeeeeee,      // Platino brillante
        emissive: 0x1f1f1f,
        metalness: 0.95,
        roughness: 0.15,
        floatSpeed: 1.8,
        floatOffset: 0
      },
      {
        type: 'octahedron',
        geo: new THREE.OctahedronGeometry(0.75, 0),
        pos: new THREE.Vector3(-8.0, 4.0, -4),
        rotSpeed: { x: -0.015, y: 0.01, z: 0.012 },
        color: 0x9e9e9e,      // Acero cepillado
        emissive: 0x181818,
        metalness: 0.9,
        roughness: 0.25,
        floatSpeed: 2.2,
        floatOffset: 1.5
      },
      {
        type: 'torusKnot',
        geo: new THREE.TorusKnotGeometry(0.55, 0.16, 64, 16),
        pos: new THREE.Vector3(-7.2, -4.2, -2),
        rotSpeed: { x: 0.018, y: -0.014, z: 0.01 },
        color: 0x333333,      // Obsidiana oscura
        emissive: 0x0f0f0f,
        metalness: 0.85,
        roughness: 0.35,
        floatSpeed: 1.5,
        floatOffset: 3.0
      },
      {
        type: 'dodecahedron',
        geo: new THREE.DodecahedronGeometry(0.7, 0),
        pos: new THREE.Vector3(8.2, -3.8, -2.5),
        rotSpeed: { x: -0.01, y: -0.02, z: 0.015 },
        color: 0xc4c4c4,      // Cromo neutro
        emissive: 0x1e1e1e,
        metalness: 0.92,
        roughness: 0.18,
        floatSpeed: 2.0,
        floatOffset: 4.5
      },
      {
        type: 'pyramid',
        geo: new THREE.ConeGeometry(0.7, 1.3, 4),
        pos: new THREE.Vector3(0, 6.8, -5),
        rotSpeed: { x: 0.02, y: 0.02, z: 0 },
        color: 0xf5f5f5,      // Titanio puro blanco
        emissive: 0x242424,
        metalness: 0.96,
        roughness: 0.12,
        floatSpeed: 2.5,
        floatOffset: 2.0
      },
      {
        type: 'gem',
        geo: new THREE.TetrahedronGeometry(0.65, 0),
        pos: new THREE.Vector3(-1.5, -6.5, -4),
        rotSpeed: { x: 0.015, y: -0.018, z: 0.01 },
        color: 0x616161,      // Níquel oscuro
        emissive: 0x121212,
        metalness: 0.88,
        roughness: 0.28,
        floatSpeed: 1.7,
        floatOffset: 5.2
      }
    ];

    configs.forEach(cfg => {
      // Material estándar metalizado en escala de grises
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.emissive,
        emissiveIntensity: 0.5,
        metalness: cfg.metalness,
        roughness: cfg.roughness,
        flatShading: true
      });

      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.position.copy(cfg.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Líneas wireframe exteriores en blanco/plata translúcido
      const wireGeo = cfg.geo.clone();
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
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
        spinMultiplier: 1.0,
        baseColor: new THREE.Color(cfg.color)
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
      el.mat.emissiveIntensity = 0.95;
      document.body.style.cursor = 'pointer';
    }
  }

  onElementUnhover(mesh) {
    const el = this.elements.find(e => e.mesh === mesh);
    if (el) {
      el.hovered = false;
      el.scaleTarget = 1.0;
      el.mat.emissiveIntensity = 0.5;
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

  setTheme(primaryHex, secondaryHex) {
    // Mantener siempre tonos grises
    this.currentColor.set(0xdcdcdc);
    this.accentColor.set(0x757575);
  }

  update(time, deltaTime) {
    this.elements.forEach(el => {
      // Flotación armónica vertical
      const floatY = Math.sin(time * el.floatSpeed + el.floatOffset) * 0.45;
      el.mesh.position.y = el.basePos.y + floatY;

      // Rotación multi-eje
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
