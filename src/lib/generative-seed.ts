export function hashSeed(seed: string): number {
  return [...seed].reduce((h, c) => Math.imul(31, h) + c.charCodeAt(0), 0) | 0;
}

export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}
