// XP thresholds for each level (exponential curve)
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpNeeded = 0;

  while (level < 50) {
    // Each level requires progressively more XP
    const threshold = Math.floor(100 * Math.pow(1.15, level - 1));
    xpNeeded += threshold;
    if (totalXp < xpNeeded) break;
    level++;
  }

  return level;
}

export function xpForNextLevel(currentLevel: number): number {
  return Math.floor(100 * Math.pow(1.15, currentLevel - 1));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(100 * Math.pow(1.15, i - 1));
  }
  return total;
}
