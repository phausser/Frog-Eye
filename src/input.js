// W / ↑  — jump forward (in facing direction)
// A / ←  — turn left
// D / →  — turn right
// S / ↓  — no function
// Touch  — swipe up/left/right

export function setupInput({ onJump, onTurnLeft, onTurnRight }) {
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'w': case 'W': case 'ArrowUp':
        e.preventDefault(); onJump(); break;
      case 'a': case 'A': case 'ArrowLeft':
        e.preventDefault(); onTurnLeft(); break;
      case 'd': case 'D': case 'ArrowRight':
        e.preventDefault(); onTurnRight(); break;
      case 's': case 'S': case 'ArrowDown':
        e.preventDefault(); break;
    }
  });

  let touchX = 0, touchY = 0;

  window.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    e.preventDefault();
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) onJump();
    } else {
      dx < 0 ? onTurnLeft() : onTurnRight();
    }
  }, { passive: false });
}
