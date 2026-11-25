import type { CrosswordEntry } from "../types/lesson";

export interface PlacedCrosswordWord {
  uid: string;
  number: number;
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

export interface CrosswordCell {
  row: number;
  col: number;
  letter: string;
  number?: number;
  wordUids: string[];
}

export interface CrosswordLayout {
  rows: number;
  cols: number;
  grid: (CrosswordCell | null)[][];
  placedWords: PlacedCrosswordWord[];
}

export function sanitizeCrosswordWord(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/['`’‘ʻʼ\-_\s.,!?0-9]/g, "")
    .trim();
}

export function buildCrosswordLayout(entries: CrosswordEntry[]): CrosswordLayout {
  const cleaned = entries
    .map((e) => ({
      word: sanitizeCrosswordWord(e.word),
      clue: e.clue.trim(),
    }))
    .filter((e) => e.word.length >= 3 && e.word.length <= 14)
    .filter((e, i, arr) => arr.findIndex((x) => x.word === e.word) === i)
    .sort((a, b) => b.word.length - a.word.length)
    .slice(0, 10);

  if (cleaned.length === 0) {
    return { rows: 0, cols: 0, grid: [], placedWords: [] };
  }

  const SIZE = 36;
  const board: (string | null)[][] = Array.from({ length: SIZE }, () =>
    Array<string | null>(SIZE).fill(null)
  );

  interface TempPlacement {
    word: string;
    clue: string;
    row: number;
    col: number;
    direction: "across" | "down";
  }

  const placed: TempPlacement[] = [];

  const placeWord = (
    item: { word: string; clue: string },
    row: number,
    col: number,
    direction: "across" | "down"
  ) => {
    for (let i = 0; i < item.word.length; i++) {
      const r = direction === "across" ? row : row + i;
      const c = direction === "across" ? col + i : col;
      board[r][c] = item.word[i];
    }
    placed.push({ ...item, row, col, direction });
  };

  const canPlace = (word: string, row: number, col: number, direction: "across" | "down"): number => {
    const dr = direction === "down" ? 1 : 0;
    const dc = direction === "across" ? 1 : 0;

    if (row < 1 || col < 1) return -1;
    if (row + dr * (word.length - 1) >= SIZE - 1) return -1;
    if (col + dc * (word.length - 1) >= SIZE - 1) return -1;

    if (board[row - dr][col - dc] !== null) return -1;
    if (board[row + dr * word.length][col + dc * word.length] !== null) return -1;

    let intersections = 0;

    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = board[r][c];

      if (existing !== null) {
        if (existing !== word[i]) return -1;
        intersections++;
      } else {
        if (direction === "across") {
          if (board[r - 1][c] !== null || board[r + 1][c] !== null) return -1;
        } else {
          if (board[r][c - 1] !== null || board[r][c + 1] !== null) return -1;
        }
      }
    }

    return intersections;
  };

  const first = cleaned[0];
  placeWord(first, Math.floor(SIZE / 2), Math.floor((SIZE - first.word.length) / 2), "across");

  const remaining = cleaned.slice(1);
  let madeProgress = true;

  while (remaining.length > 0 && madeProgress) {
    madeProgress = false;
    for (let idx = 0; idx < remaining.length; idx++) {
      const candidate = remaining[idx];
      let best: { row: number; col: number; dir: "across" | "down"; score: number } | null = null;

      for (const existing of placed) {
        const tryDir: "across" | "down" = existing.direction === "across" ? "down" : "across";
        for (let ei = 0; ei < existing.word.length; ei++) {
          for (let ci = 0; ci < candidate.word.length; ci++) {
            if (existing.word[ei] !== candidate.word[ci]) continue;
            const er = existing.direction === "across" ? existing.row : existing.row + ei;
            const ec = existing.direction === "across" ? existing.col + ei : existing.col;
            const startR = tryDir === "across" ? er : er - ci;
            const startC = tryDir === "across" ? ec - ci : ec;

            const score = canPlace(candidate.word, startR, startC, tryDir);
            if (score > 0 && (!best || score > best.score)) {
              best = { row: startR, col: startC, dir: tryDir, score };
            }
          }
        }
      }

      if (best) {
        placeWord(candidate, best.row, best.col, best.dir);
        remaining.splice(idx, 1);
        madeProgress = true;
        break;
      }
    }
  }

  let fallbackRow = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== null && r > fallbackRow) {
        fallbackRow = r;
      }
    }
  }
  fallbackRow += 2;

  for (const item of remaining) {
    if (fallbackRow < SIZE - 2 && item.word.length < SIZE - 4) {
      placeWord(item, fallbackRow, 2, "across");
      fallbackRow += 2;
    }
  }

  let minR = SIZE;
  let maxR = 0;
  let minC = SIZE;
  let maxC = 0;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== null) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  const normalizedPlaced = placed.map((p) => ({
    ...p,
    row: p.row - minR,
    col: p.col - minC,
  }));

  normalizedPlaced.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.col - b.col));

  const grid: (CrosswordCell | null)[][] = Array.from({ length: rows }, () =>
    Array<CrosswordCell | null>(cols).fill(null)
  );

  const startCoordToNumber = new Map<string, number>();
  let nextNum = 1;
  const placedWords: PlacedCrosswordWord[] = [];

  for (const p of normalizedPlaced) {
    const key = `${p.row},${p.col}`;
    let num = startCoordToNumber.get(key);
    if (!num) {
      num = nextNum++;
      startCoordToNumber.set(key, num);
    }

    const uid = `${num}_${p.direction}`;
    const placedEntry: PlacedCrosswordWord = {
      uid,
      number: num,
      word: p.word,
      clue: p.clue,
      row: p.row,
      col: p.col,
      direction: p.direction,
    };
    placedWords.push(placedEntry);

    for (let i = 0; i < p.word.length; i++) {
      const r = p.direction === "across" ? p.row : p.row + i;
      const c = p.direction === "across" ? p.col + i : p.col;
      const existingCell = grid[r][c];
      if (!existingCell) {
        grid[r][c] = {
          row: r,
          col: c,
          letter: p.word[i],
          number: i === 0 ? num : undefined,
          wordUids: [uid],
        };
      } else {
        if (i === 0 && !existingCell.number) {
          existingCell.number = num;
        }
        existingCell.wordUids.push(uid);
      }
    }
  }

  return { rows, cols, grid, placedWords };
}
