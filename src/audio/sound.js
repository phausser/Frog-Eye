let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq, freq2 = freq, type = 'sine', dur = 0.15, vol = 0.22, delay = 0 }) {
  const c = getCtx();
  const t = c.currentTime + delay;
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freq2 !== freq) osc.frequency.linearRampToValueAtTime(freq2, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export function playJump() {
  tone({ freq: 300, freq2: 460, dur: 0.07, vol: 0.16 });
}

export function playDeath() {
  tone({ freq: 280, freq2: 70, type: 'sawtooth', dur: 0.45, vol: 0.22 });
}

export function playGoal() {
  tone({ freq: 523, freq2: 659, dur: 0.10, vol: 0.20 });
  tone({ freq: 659, freq2: 880, dur: 0.12, vol: 0.18, delay: 0.09 });
}

export function playLevelUp() {
  [440, 554, 659, 880].forEach((f, i) => {
    tone({ freq: f, type: 'triangle', dur: 0.14, vol: 0.20, delay: i * 0.10 });
  });
}
