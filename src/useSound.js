export function useSound() {
  const playCorrect = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.frequency.value = 800;
      osc.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 150);
    } catch(e) {}
  };

  const playWrong = () => {
    try {
      navigator.vibrate?.([50, 50, 50]);
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.frequency.value = 300;
      osc.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 300);
    } catch(e) {}
  };

  return { playCorrect, playWrong };
}
