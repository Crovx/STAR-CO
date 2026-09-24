/**
 * STARCO 3D - Coordinador Principal de la Aplicación y Manejador de Eventos UI
 * Escala de Grises / Monolithic Luxury
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar la escena 3D si existe el contenedor
  const container = document.getElementById('webgl-container');
  let scene3D = null;
  if (container) {
    scene3D = new Scene3D('webgl-container');
    window.starcoScene = scene3D;
  }

  // 2. Referencias a elementos del DOM (HUD / Controles)
  const btnAudio = document.getElementById('btn-audio');
  const audioIcon = document.getElementById('audio-icon');
  const btnReplay = document.getElementById('btn-replay');
  const btnSupernova = document.getElementById('btn-supernova');
  const btnToggleRings = document.getElementById('btn-toggle-rings');
  
  const cardStar = document.getElementById('card-star');
  const cardDust = document.getElementById('card-dust');
  const cardCrystals = document.getElementById('card-crystals');

  // 3. Control de Audio FX
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

  // 4. Repetir Intro de la Estrella
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      if (scene3D && scene3D.star) {
        scene3D.star.startIntroAnimation();
      }
    });
  }

  // 5. Botón Supernova Burst
  if (btnSupernova) {
    btnSupernova.addEventListener('click', () => {
      if (scene3D && scene3D.star) {
        scene3D.star.onClick();
      }
    });
  }

  // 6. Alternar Anillos Orbitales
  if (btnToggleRings) {
    btnToggleRings.addEventListener('click', () => {
      if (scene3D && scene3D.star) {
        const isVisible = scene3D.star.toggleRings();
        btnToggleRings.style.opacity = isVisible ? '1' : '0.5';
      }
    });
  }

  // 7. Interacción con Tarjetas
  if (cardStar) {
    cardStar.addEventListener('click', () => {
      if (scene3D && scene3D.star) {
        scene3D.targetCameraDistance = 14;
        scene3D.star.onClick();
      }
    });
  }

  if (cardDust) {
    cardDust.addEventListener('click', () => {
      if (scene3D && scene3D.particleSystem) {
        scene3D.particleSystem.triggerSupernova(new THREE.Vector3(0, 0, 0), new THREE.Color(0xffffff));
        if (window.cosmicAudio) window.cosmicAudio.playChime(880);
      }
    });
  }

  if (cardCrystals) {
    cardCrystals.addEventListener('click', () => {
      if (scene3D && scene3D.floatingElements) {
        scene3D.floatingElements.elements.forEach(el => {
          el.spinMultiplier = 4.0;
          el.scaleTarget = 1.4;
        });
        if (window.cosmicAudio) window.cosmicAudio.playChime(740);
      }
    });
  }

  // 8. Atajos de teclado para pruebas rápidas
  window.addEventListener('keydown', (e) => {
    // Si el usuario está escribiendo en un input, ignorar
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

  console.log("🌟 STAR/CO 3D Grayscale Engine inicializado con éxito.");
});
