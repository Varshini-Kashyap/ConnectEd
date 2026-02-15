import confetti from 'canvas-confetti';

const scalar = 2;
let heartShapes = [];
try {
  if (typeof confetti.shapeFromText === 'function') {
    heartShapes = [confetti.shapeFromText({ text: '❤️', scalar })];
  }
} catch (_) {
  heartShapes = [];
}

/**
 * Fire a Valentine-style heart confetti celebration (hearts + warm colors).
 * Respects prefers-reduced-motion. Use after success: profile complete, connection sent, etc.
 */
export function fireHeartConfetti(options = {}) {
  if (typeof window === 'undefined') return Promise.resolve();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return Promise.resolve();

  const colors = ['#FF8A6F', '#FFB894', '#E88B8B', '#5C8F5A'];
  const defaults = {
    particleCount: 40,
    spread: 70,
    origin: { y: 0.6 },
    scalar,
    colors,
    disableForReducedMotion: true,
  };
  if (heartShapes.length > 0) {
    defaults.shapes = heartShapes;
  } else {
    defaults.shapes = ['circle', 'star'];
  }

  return confetti({ ...defaults, ...options }) || Promise.resolve();
}

/**
 * Fire a burst from center (e.g. after form submit success).
 */
export function fireHeartConfettiBurst() {
  fireHeartConfetti({ particleCount: 50, spread: 100 });
  setTimeout(() => {
    fireHeartConfetti({ particleCount: 30, spread: 60, origin: { x: 0.25, y: 0.6 } });
    fireHeartConfetti({ particleCount: 30, spread: 60, origin: { x: 0.75, y: 0.6 } });
  }, 150);
}
