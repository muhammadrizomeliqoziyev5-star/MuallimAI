import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { RotateCcw, HelpCircle, Sparkles } from "lucide-react";
import { buildWordSearchBoard } from "../../utils/wordSearchBuilder";
import { soundFx } from "../../utils/soundFx";

interface WordSearchGameProps {
  words: string[];
}

function getLineCells(
  start: { r: number; c: number },
  end: { r: number; c: number }
): { r: number; c: number }[] {
  const dr = end.r - start.r;
  const dc = end.c - start.c;
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  if (dr !== 0 && dc !== 0 && absR !== absC) {
    return [];
  }

  const steps = Math.max(absR, absC);
  const stepR = dr === 0 ? 0 : dr / absR;
  const stepC = dc === 0 ? 0 : dc / absC;

  const result: { r: number; c: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    result.push({ r: start.r + stepR * i, c: start.c + stepC * i });
  }
  return result;
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ words }) => {
  const [seedKey, setSeedKey] = useState(0);
  const board = useMemo(() => buildWordSearchBoard(words), [words, seedKey]);

  const [startCell, setStartCell] = useState<{ r: number; c: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCellKeys, setFoundCellKeys] = useState<Set<string>>(new Set());
  const [hintCellKey, setHintCellKey] = useState<string | null>(null);

  useEffect(() => {
    setStartCell(null);
    setHoverCell(null);
    setFoundWords([]);
    setFoundCellKeys(new Set());
    setHintCellKey(null);
  }, [board]);

  const previewLine = useMemo(() => {
    if (!startCell || !hoverCell) return startCell ? [startCell] : [];
    return getLineCells(startCell, hoverCell);
  }, [startCell, hoverCell]);

  const previewSet = useMemo(
    () => new Set(previewLine.map((p) => `${p.r},${p.c}`)),
    [previewLine]
  );

  const handleCellClick = (r: number, c: number) => {
    if (!startCell) {
      setStartCell({ r, c });
      setHoverCell({ r, c });
      soundFx.playFlip();
      return;
    }

    if (startCell.r === r && startCell.c === c) {
      setStartCell(null);
      setHoverCell(null);
      return;
    }

    const line = getLineCells(startCell, { r, c });
    if (line.length >= 3) {
      const selectedStr = line.map((p) => board.grid[p.r][p.c]).join("");
      const reversedStr = selectedStr.split("").reverse().join("");

      const matched = board.placements.find(
        (pl) =>
          !foundWords.includes(pl.word) &&
          (pl.word === selectedStr || pl.word === reversedStr)
      );

      if (matched) {
        const nextFound = [...foundWords, matched.word];
        const nextKeys = new Set(foundCellKeys);
        line.forEach((p) => nextKeys.add(`${p.r},${p.c}`));
        setFoundWords(nextFound);
        setFoundCellKeys(nextKeys);
        setHintCellKey(null);

        if (nextFound.length === board.placements.length) {
          soundFx.playFanfare();
        } else {
          soundFx.playSuccess();
        }
      } else {
        soundFx.playError();
      }
    } else {
      soundFx.playError();
    }

    setStartCell(null);
    setHoverCell(null);
  };

  const handleHint = () => {
    const remaining = board.placements.find((p) => !foundWords.includes(p.word));
    if (!remaining || !remaining.cells[0]) return;
    const first = remaining.cells[0];
    setHintCellKey(`${first.r},${first.c}`);
    soundFx.playSnap();
  };

  const allFound =
    board.placements.length > 0 && foundWords.length === board.placements.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            So'z ovchisi (Filvord)
          </h3>
          <p className="text-xs text-slate-500">
            Yashiringan so'zning birinchi harfini bosing, so'ng oxirgi harfini bosing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleHint}
            disabled={allFound}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ishora</span>
          </button>
          <button
            type="button"
            onClick={() => setSeedKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yangi jadval</span>
          </button>
        </div>
      </div>

      {allFound && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-bold text-emerald-950">
              Barakalla! Barcha {board.placements.length} ta atama topildi!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSeedKey((k) => k + 1)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
          >
            Qayta o'ynash
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 overflow-x-auto flex justify-center">
          <div
            className="inline-grid gap-1 select-none"
            style={{
              gridTemplateColumns: `repeat(${board.size}, minmax(30px, 38px))`,
            }}
          >
            {board.grid.map((row, r) =>
              row.map((letter, c) => {
                const key = `${r},${c}`;
                const isFound = foundCellKeys.has(key);
                const isPreview = previewSet.has(key);
                const isHint = hintCellKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    onMouseEnter={() => {
                      if (startCell) setHoverCell({ r, c });
                    }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-mono text-sm sm:text-base font-bold transition-colors cursor-pointer flex items-center justify-center border ${
                      isPreview
                        ? "bg-blue-700 text-white border-blue-800"
                        : isFound
                        ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                        : isHint
                        ? "bg-amber-100 text-amber-950 border-amber-500"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900">Topilishi kerak so'zlar</h4>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {foundWords.length}/{board.placements.length}
            </span>
          </div>
          <ul className="space-y-2">
            {board.placements.map((pl) => {
              const found = foundWords.includes(pl.word);
              return (
                <li
                  key={pl.word}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                    found
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 line-through"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  {pl.word}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
