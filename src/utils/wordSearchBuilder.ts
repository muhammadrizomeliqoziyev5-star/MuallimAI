export interface WordSearchPlacement {
  word: string;
  cells: { r: number; c: number }[];
}

export interface WordSearchBoard {
  size: number;
  grid: string[][];
  placements: WordSearchPlacement[];
}

const UZ_ALPHABET = "ABDEFGHIJKLMNOPQRSTUVXYZ";

export function buildWordSearchBoard(rawWords: string[]): WordSearchBoard {
  const words = rawWords
    .map((w) =>
      w
        .toUpperCase()
        .replace(/['`’‘ʻʼ\-_\s.,!?0-9]/g, "")
        .trim()
    )
    .filter((w) => w.length >= 3 && w.length <= 11)
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .sort((a, b) => b.length - a.length)
    .slice(0, 7);

  const longest = words[0]?.length ?? 8;
  const size = Math.max(10, Math.min(12, longest + 2));

  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array<string | null>(size).fill(null)
  );

  const dirs: [number, number][] = [
    [0, 1],   // horizontal right
    [1, 0],   // vertical down
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal up-right
  ];

  const placements: WordSearchPlacement[] = [];

  for (const word of words) {
    let placed = false;
    const shuffledDirs = [...dirs].sort(() => Math.random() - 0.5);

    for (let attempt = 0; attempt < 120 && !placed; attempt++) {
      const [dr, dc] = shuffledDirs[attempt % shuffledDirs.length];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);

      const endR = startR + dr * (word.length - 1);
      const endC = startC + dc * (word.length - 1);

      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

      let ok = true;
      const cells: { r: number; c: number }[] = [];
      for (let i = 0; i < word.length; i++) {
        const r = startR + dr * i;
        const c = startC + dc * i;
        const existing = grid[r][c];
        if (existing !== null && existing !== word[i]) {
          ok = false;
          break;
        }
        cells.push({ r, c });
      }

      if (ok) {
        for (let i = 0; i < word.length; i++) {
          const { r, c } = cells[i];
          grid[r][c] = word[i];
        }
        placements.push({ word, cells });
        placed = true;
      }
    }
  }

  const filledGrid: string[][] = grid.map((row) =>
    row.map((cell) => cell ?? UZ_ALPHABET[Math.floor(Math.random() * UZ_ALPHABET.length)])
  );

  return { size, grid: filledGrid, placements };
}
