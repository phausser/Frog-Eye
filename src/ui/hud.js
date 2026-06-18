export function createHUD() {
  const elLives = document.getElementById('hud-lives');
  const elScore = document.getElementById('hud-score');
  const elTimer = document.getElementById('hud-timer');
  const elLevel = document.getElementById('hud-level');

  let timeLeft = 60;
  let expired  = false;

  return {
    setLives(n) {
      elLives.textContent = '♥ '.repeat(Math.max(0, n)).trim() || '—';
    },
    setScore(n) {
      elScore.textContent = String(n).padStart(5, '0');
    },
    setLevel(n) {
      elLevel.textContent = `L${n}`;
    },
    resetTimer() {
      timeLeft = 60;
      expired  = false;
      elTimer.textContent = '60';
      elTimer.classList.remove('hud-timer-low');
    },
    // Returns true when time expires (caller must call loseLife).
    tickTimer(delta) {
      if (expired) return false;
      timeLeft = Math.max(0, timeLeft - delta);
      const secs = Math.ceil(timeLeft);
      elTimer.textContent = secs < 10 ? `0${secs}` : String(secs);
      elTimer.classList.toggle('hud-timer-low', secs <= 10);
      if (timeLeft <= 0) { expired = true; return true; }
      return false;
    },
  };
}
