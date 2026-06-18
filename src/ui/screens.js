export function createScreens() {
  const elStart   = document.getElementById('screen-start');
  const elOver    = document.getElementById('screen-gameover');
  const elGoScore = document.getElementById('go-score');
  const elLevelUp = document.getElementById('screen-levelup');
  const elLvNum   = document.getElementById('lu-level');

  let lvUpTimer = 0;

  function attachAnyKey(cb) {
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      window.removeEventListener('keydown', fire);
      elStart.removeEventListener('pointerup', fire);
      elOver.removeEventListener('pointerup', fire);
      cb();
    };
    window.addEventListener('keydown', fire);
    elStart.addEventListener('pointerup', fire);
    elOver.addEventListener('pointerup', fire);
  }

  return {
    showStart(onStart) {
      elStart.classList.remove('hidden');
      attachAnyKey(onStart);
    },
    hideStart() {
      elStart.classList.add('hidden');
    },
    showGameOver(score, onRestart) {
      elGoScore.textContent = String(score).padStart(5, '0');
      elOver.classList.remove('hidden');
      attachAnyKey(onRestart);
    },
    hideGameOver() {
      elOver.classList.add('hidden');
    },
    showLevelUp(n) {
      elLvNum.textContent = n;
      elLevelUp.classList.remove('hidden');
      lvUpTimer = 2.2;
    },
    tick(delta) {
      if (lvUpTimer <= 0) return;
      lvUpTimer -= delta;
      if (lvUpTimer <= 0) elLevelUp.classList.add('hidden');
    },
  };
}
