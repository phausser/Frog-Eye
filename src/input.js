// W / ↑  — jump forward (in facing direction)
// A / ←  — turn left
// D / →  — turn right
// S / ↓  — no function

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
        e.preventDefault(); break; // absichtlich keine Funktion
    }
  });
}
