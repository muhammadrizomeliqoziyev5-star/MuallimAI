import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Puzzle, RotateCcw, HelpCircle, CheckCircle2, Sparkles } from "lucide-react";
import type { PuzzlePieceData } from "../../types/lesson";
import { soundFx } from "../../utils/soundFx";

interface PuzzleGameProps {
  pieces: PuzzlePieceData[];
}

const PIECE_PALETTE = [
  "bg-blue-50 border-blue-300 text-blue-950",
  "bg-emerald-50 border-emerald-300 text-emerald-950",
  "bg-amber-50 border-amber-300 text-amber-950",
  "bg-indigo-50 border-indigo-300 text-indigo-950",
  "bg-teal-50 border-teal-300 text-teal-950",
  "bg-sky-50 border-sky-300 text-sky-950",
];

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ pieces }) => {
  const boardPieces = useMemo(() => pieces.slice(0, 6), [pieces]);

  const [shuffledTray, setShuffledTray] = useState<PuzzlePieceData[]>([]);
  const [placedMap, setPlacedMap] = useState<Record<string, boolean>>({});
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [wrongSlotId, setWrongSlotId] = useState<string | null>(null);
  const [showHintId, setShowHintId] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const resetGame = () => {
    const copy = [...boardPieces].sort(() => Math.random() - 0.5);
    setShuffledTray(copy);
    setPlacedMap({});
    setSelectedPieceId(null);
    setWrongSlotId(null);
    setShowHintId(null);
    setMistakes(0);
  };

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardPieces]);

  const placedCount = Object.keys(placedMap).length;
  const isCompleted = boardPieces.length > 0 && placedCount === boardPieces.length;

  const handleSelectTrayPiece = (id: string) => {
    if (placedMap[id]) return;
    soundFx.playFlip();
    setSelectedPieceId((prev) => (prev === id ? null : id));
  };

  const handleSlotClick = (slotId: string) => {
    if (placedMap[slotId]) return;
    if (!selectedPieceId) {
      setShowHintId((prev) => (prev === slotId ? null : slotId));
      return;
    }

    if (selectedPieceId === slotId) {
      const next = { ...placedMap, [slotId]: true };
      setPlacedMap(next);
      setSelectedPieceId(null);
      setShowHintId(null);
      if (Object.keys(next).length === boardPieces.length) {
        soundFx.playFanfare();
      } else {
        soundFx.playSnap();
      }
    } else {
      soundFx.playError();
      setMistakes((m) => m + 1);
      setWrongSlotId(slotId);
      setTimeout(() => setWrongSlotId(null), 550);
    }
  };

  if (!boardPieces.length) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            Bilim pazli — Tushunchalarni tutashtiring
          </h3>
          <p className="text-xs text-slate-500">
            Pastdagi pazl bo'lagini tanlang va yuqoridagi mos katakka joylashtiring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-mono tabular-nums">
            Yig'ildi: {placedCount}/{boardPieces.length} · Xatolar: {mistakes}
          </span>
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta boshlash</span>
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  Ajoyib! Bilim pazli to'liq yig'ildi!
                </p>
                <p className="text-xs text-emerald-800">
                  Mavzuning barcha {boardPieces.length} ta asosiy bo'lagi o'z o'rniga tutashdi.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer shrink-0"
            >
              Yana o'ynash
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Puzzle Board (3x2 interlocking grid) */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boardPieces.map((slot, idx) => {
            const placed = !!placedMap[slot.id];
            const isWrong = wrongSlotId === slot.id;
            const paletteClass = PIECE_PALETTE[idx % PIECE_PALETTE.length];

            return (
              <motion.button
                key={slot.id}
                type="button"
                onClick={() => handleSlotClick(slot.id)}
                animate={
                  isWrong
                    ? { x: [-6, 6, -4, 4, 0] }
                    : placed
                    ? { scale: [0.96, 1.02, 1] }
                    : {}
                }
                transition={{ duration: 0.28 }}
                className={`relative min-h-[146px] p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                  placed
                    ? `${paletteClass} shadow-xs`
                    : isWrong
                    ? "bg-red-50 border-red-400 text-red-900"
                    : selectedPieceId
                    ? "bg-white border-dashed border-blue-400 hover:border-blue-700 hover:bg-blue-50/40"
                    : "bg-white border-dashed border-slate-300 hover:border-slate-400"
                }`}
              >
                {/* Decorative interlocking puzzle notch visual on right/bottom edges */}
                <div
                  aria-hidden="true"
                  className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 ${
                    placed ? "bg-white/70 border-current/20" : "bg-slate-100 border-slate-200"
                  }`}
                />

                <div className="flex items-center justify-between gap-2 mb-2 pr-3">
                  <span className="font-mono text-[11px] font-bold opacity-60 tabular-nums">
                    #{idx + 1}
                  </span>
                  {placed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <HelpCircle className="w-3 h-3" />
                      <span>Ishora</span>
                    </span>
                  )}
                </div>

                {placed ? (
                  <div className="pr-2">
                    <p className="font-display text-sm font-bold mb-1">{slot.pieceTitle}</p>
                    <p className="text-xs opacity-90 leading-snug mb-1.5">{slot.promptSide}</p>
                    <p className="text-[11px] font-semibold pt-1.5 border-t border-current/15">
                      → {slot.matchSide}
                    </p>
                  </div>
                ) : (
                  <div className="pr-2">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Mos javob katagi:
                    </p>
                    <p className="text-sm font-medium text-slate-900 leading-snug">
                      {slot.matchSide}
                    </p>
                    {showHintId === slot.id && (
                      <p className="mt-2 text-[11px] text-blue-700 bg-blue-50 rounded px-2 py-1">
                        Ishora: {slot.hint}
                      </p>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Shuffled Puzzle Pieces Tray */}
      {!isCompleted && (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-3">
            Bo'sh pazl bo'laklari (birini bosing va yuqoriga qo'ying):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shuffledTray
              .filter((p) => !placedMap[p.id])
              .map((piece) => {
                const isSelected = selectedPieceId === piece.id;
                return (
                  <motion.button
                    key={piece.id}
                    type="button"
                    layout
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectTrayPiece(piece.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-700 text-white border-blue-800 shadow-md ring-2 ring-blue-700/25"
                        : "bg-white text-slate-900 border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-display text-sm font-bold">{piece.pieceTitle}</span>
                      <Puzzle
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? "text-blue-200" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        isSelected ? "text-blue-100" : "text-slate-600"
                      }`}
                    >
                      {piece.promptSide}
                    </p>
                  </motion.button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
