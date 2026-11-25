import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, RotateCcw, CheckCircle2, HelpCircle } from "lucide-react";
import type { CrosswordEntry } from "../../types/lesson";
import { buildCrosswordLayout, type PlacedCrosswordWord } from "../../utils/crosswordBuilder";
import { soundFx } from "../../utils/soundFx";

interface CrosswordGameProps {
  entries: CrosswordEntry[];
}

export const CrosswordGame: React.FC<CrosswordGameProps> = ({ entries }) => {
  const layout = useMemo(() => buildCrosswordLayout(entries), [entries]);

  const [userLetters, setUserLetters] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [activeWordUid, setActiveWordUid] = useState<string | null>(null);
  const [checkedState, setCheckedState] = useState<Record<string, "correct" | "wrong">>({});
  const [solved, setSolved] = useState(false);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setUserLetters({});
    setCheckedState({});
    setSolved(false);
    const firstWord = layout.placedWords[0];
    if (firstWord) {
      setSelectedCell({ r: firstWord.row, c: firstWord.col });
      setActiveWordUid(firstWord.uid);
    } else {
      setSelectedCell(null);
      setActiveWordUid(null);
    }
  }, [layout]);

  const activeWord: PlacedCrosswordWord | undefined = useMemo(
    () => layout.placedWords.find((w) => w.uid === activeWordUid),
    [layout.placedWords, activeWordUid]
  );

  const acrossWords = useMemo(
    () => layout.placedWords.filter((w) => w.direction === "across"),
    [layout.placedWords]
  );

  const downWords = useMemo(
    () => layout.placedWords.filter((w) => w.direction === "down"),
    [layout.placedWords]
  );

  const isCellInActiveWord = (r: number, c: number) => {
    if (!activeWord) return false;
    if (activeWord.direction === "across") {
      return r === activeWord.row && c >= activeWord.col && c < activeWord.col + activeWord.word.length;
    }
    return c === activeWord.col && r >= activeWord.row && r < activeWord.row + activeWord.word.length;
  };

  const focusCell = (r: number, c: number) => {
    setSelectedCell({ r, c });
    const el = inputRefs.current[`${r},${c}`];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleCellClick = (r: number, c: number) => {
    const cell = layout.grid[r]?.[c];
    if (!cell) return;

    if (selectedCell && selectedCell.r === r && selectedCell.c === c && cell.wordUids.length > 1) {
      // Toggle direction on same cell
      const nextUid = cell.wordUids.find((u) => u !== activeWordUid) || cell.wordUids[0];
      setActiveWordUid(nextUid);
    } else if (!activeWordUid || !cell.wordUids.includes(activeWordUid)) {
      setActiveWordUid(cell.wordUids[0]);
    }
    focusCell(r, c);
  };

  const handleSelectClue = (pw: PlacedCrosswordWord) => {
    setActiveWordUid(pw.uid);
    focusCell(pw.row, pw.col);
  };

  const checkIfAllSolved = (letters: Record<string, string>) => {
    let allFilled = true;
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        const cell = layout.grid[r][c];
        if (cell) {
          if ((letters[`${r},${c}`] || "").toUpperCase() !== cell.letter) {
            allFilled = false;
            break;
          }
        }
      }
      if (!allFilled) break;
    }
    if (allFilled && layout.placedWords.length > 0) {
      setSolved(true);
      soundFx.playFanfare();
    }
  };

  const moveStep = (r: number, c: number, step: 1 | -1) => {
    const dir = activeWord?.direction || "across";
    const nextR = dir === "down" ? r + step : r;
    const nextC = dir === "across" ? c + step : c;
    if (layout.grid[nextR]?.[nextC]) {
      focusCell(nextR, nextC);
    }
  };

  const handleInputChange = (r: number, c: number, rawVal: string) => {
    const char = rawVal.slice(-1).toUpperCase().replace(/[^A-ZА-ЯЁЎҚҒҲ]/gi, "");
    const key = `${r},${c}`;
    const updated = { ...userLetters };
    if (char) {
      updated[key] = char;
      soundFx.playFlip();
    } else {
      delete updated[key];
    }
    setUserLetters(updated);
    setCheckedState((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    checkIfAllSolved(updated);

    if (char) {
      moveStep(r, c, 1);
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const key = `${r},${c}`;
      if (!userLetters[key]) {
        e.preventDefault();
        moveStep(r, c, -1);
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (layout.grid[r]?.[c + 1]) focusCell(r, c + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (layout.grid[r]?.[c - 1]) focusCell(r, c - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (layout.grid[r + 1]?.[c]) focusCell(r + 1, c);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (layout.grid[r - 1]?.[c]) focusCell(r - 1, c);
    }
  };

  const handleCheck = () => {
    const nextCheck: Record<string, "correct" | "wrong"> = {};
    let hasWrong = false;
    let filledCount = 0;

    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        const cell = layout.grid[r][c];
        if (!cell) continue;
        const key = `${r},${c}`;
        const val = (userLetters[key] || "").toUpperCase();
        if (val) {
          filledCount++;
          if (val === cell.letter) {
            nextCheck[key] = "correct";
          } else {
            nextCheck[key] = "wrong";
            hasWrong = true;
          }
        }
      }
    }

    setCheckedState(nextCheck);
    if (filledCount > 0 && !hasWrong) {
      soundFx.playSuccess();
    } else if (hasWrong) {
      soundFx.playError();
    }
    checkIfAllSolved(userLetters);
  };

  const handleRevealHint = () => {
    if (!activeWord) return;
    for (let i = 0; i < activeWord.word.length; i++) {
      const r = activeWord.direction === "across" ? activeWord.row : activeWord.row + i;
      const c = activeWord.direction === "across" ? activeWord.col + i : activeWord.col;
      const key = `${r},${c}`;
      if ((userLetters[key] || "").toUpperCase() !== activeWord.word[i]) {
        const updated = { ...userLetters, [key]: activeWord.word[i] };
        setUserLetters(updated);
        setCheckedState((prev) => ({ ...prev, [key]: "correct" }));
        soundFx.playSnap();
        focusCell(r, c);
        checkIfAllSolved(updated);
        return;
      }
    }
  };

  const handleReset = () => {
    setUserLetters({});
    setCheckedState({});
    setSolved(false);
  };

  if (layout.rows === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-600">
        Krossvord tuzish uchun yetarli so'z topilmadi.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            Interaktiv krossvord
          </h3>
          <p className="text-xs text-slate-500">
            Katakka bosing va harf kiriting · Yo'nalishni almashtirish uchun katakni yana bir
            marta bosing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRevealHint}
            disabled={!activeWord || solved}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Harf ochish</span>
          </button>

          <button
            type="button"
            onClick={handleCheck}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tekshirish</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>
        </div>
      </div>

      {/* Solved Banner */}
      {solved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-950">
                Barakalla! Krossvord to'liq yechib bo'lindi!
              </p>
              <p className="text-xs text-emerald-800">
                Barcha {layout.placedWords.length} ta atama to'g'ri topildi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer shrink-0"
          >
            Qayta o'ynash
          </button>
        </motion.div>
      )}

      {/* Active Clue Banner */}
      {activeWord && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl px-4 py-3 text-sm text-slate-800">
          <span className="font-mono font-bold text-blue-800 mr-2">
            {activeWord.number}-{activeWord.direction === "across" ? "gorizontal" : "vertikal"}:
          </span>
          <span>{activeWord.clue}</span>
          <span className="ml-2 text-xs text-slate-500 font-mono tabular-nums">
            ({activeWord.word.length} harf)
          </span>
        </div>
      )}

      {/* Grid + Clues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Crossword Grid */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 overflow-x-auto flex justify-center">
          <div
            className="inline-grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, minmax(34px, 42px))`,
            }}
          >
            {layout.grid.map((row, r) =>
              row.map((cell, c) => {
                if (!cell) {
                  return <div key={`${r}-${c}`} className="w-9 h-9 sm:w-10 sm:h-10" />;
                }
                const key = `${r},${c}`;
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                const inWord = isCellInActiveWord(r, c);
                const status = checkedState[key];

                let cellBg = "bg-slate-50 border-slate-300 text-slate-900";
                if (status === "correct") {
                  cellBg = "bg-emerald-50 border-emerald-500 text-emerald-900";
                } else if (status === "wrong") {
                  cellBg = "bg-red-50 border-red-500 text-red-900";
                } else if (isSelected) {
                  cellBg = "bg-blue-100 border-blue-700 text-blue-950 ring-2 ring-blue-600/20";
                } else if (inWord) {
                  cellBg = "bg-blue-50/80 border-blue-300 text-slate-900";
                }

                return (
                  <div
                    key={key}
                    onClick={() => handleCellClick(r, c)}
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg border transition-colors cursor-pointer ${cellBg}`}
                  >
                    {cell.number !== undefined && (
                      <span className="absolute top-0.5 left-1 font-mono text-[9px] font-bold text-slate-500 leading-none pointer-events-none select-none">
                        {cell.number}
                      </span>
                    )}
                    <input
                      ref={(el) => {
                        inputRefs.current[key] = el;
                      }}
                      type="text"
                      maxLength={2}
                      value={userLetters[key] || ""}
                      onChange={(e) => handleInputChange(r, c, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(r, c, e)}
                      aria-label={`Katak ${r + 1}, ${c + 1}`}
                      className="w-full h-full bg-transparent text-center font-mono text-base sm:text-lg font-bold uppercase focus:outline-none pt-1 cursor-pointer"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Clues List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
          {acrossWords.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Gorizontal bo'yicha
              </h4>
              <ul className="space-y-1.5">
                {acrossWords.map((pw) => (
                  <li key={pw.uid}>
                    <button
                      type="button"
                      onClick={() => handleSelectClue(pw)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeWordUid === pw.uid
                          ? "bg-blue-50 text-blue-900 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="font-mono font-bold mr-1.5 tabular-nums">{pw.number}.</span>
                      {pw.clue}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {downWords.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Vertikal bo'yicha
              </h4>
              <ul className="space-y-1.5">
                {downWords.map((pw) => (
                  <li key={pw.uid}>
                    <button
                      type="button"
                      onClick={() => handleSelectClue(pw)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeWordUid === pw.uid
                          ? "bg-blue-50 text-blue-900 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="font-mono font-bold mr-1.5 tabular-nums">{pw.number}.</span>
                      {pw.clue}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
