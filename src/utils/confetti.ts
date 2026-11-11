import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  // First burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });

  // Second celebratory burst with school gold and emerald colors
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899']
    });
  }, 250);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899']
    });
  }, 400);
}
