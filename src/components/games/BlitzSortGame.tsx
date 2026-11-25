import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Play, RotateCcw, Timer } from "lucide-react";
import type { BlitzSortItem } from "../../types/lesson";
import { soundFx } from "../../utils/soundFx";

interface BlitzSortGameProps {
  items: BlitzSortItem[];
}

export const BlitzSortGame: React.FC<BlitzSortGameProps> = ({ items }) => {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          soundFx.playFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  const handleStart = () => {
    setStarted(true);
    setFinished(false);
    setIndex(0);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setFeedback(null);
  };

  const current = items[index];

  const handleAnswer = (guessTrue: boolean) => {
    if (!current || feedback) return;
    const isCorrect = guessTrue === current.isTrue;

    if (isCorrect) {
      const nextStreak = streak + 1;
      const gained = 10 + Math.min(nextStreak - 1, 4) * 5;
      setStreak(nextStreak);
      setScore((s) => s + gained);
      setFeedback({ correct: true, text: `To'g'ri! +${gained} ball` });
      soundFx.playSuccess();
    } else {
      setStreak(0);
      setFeedback({ correct: false, text: current.correction });
      soundFx.playError();
    }

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= items.length) {
        setFinished(true);
        soundFx.playFanfare();
      } else {
        setIndex((i) => i + 1);
      }
    }, 1050);
  };

  if (!items.length) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            Tezkor saralash (60 soniyalik blits)
          </h3>
          <p className="text-xs text-slate-500">
            Faktning to'g'ri yoki noto'g'ri ekanini tezda aniqlang — ketma-ket javoblar
            bonus beradi
          </p>
        </div>

        {started && (
          <div className="flex items-center gap-4 font-mono text-sm tabular-nums">
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <Timer className="w-4 h-4 text-blue-700" />
              <strong>{timeLeft}s</strong>
            </span>
            <span className="text-blue-700 font-bold">Ball: {score}</span>
            {streak > 1 && (
              <span className="text-amber-700 font-bold">Seriya: x{streak}</span>
            )}
          </div>
        )}
      </div>

      {!started && !finished && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-xl mx-auto">
          <h4 className="font-display text-2xl font-bold text-slate-900 mb-2">
            Sinf bilan tezkor sinov
          </h4>
          <p className="text-sm text-slate-600 mb-6">
            Ekranda {items.length} ta qisqa fakt navbat bilan chiqadi. 60 soniya ichida
            imkon qadar ko'p to'g'ri javob to'plang.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>O'yinni boshlash</span>
          </button>
        </div>
      )}

      {started && !finished && current && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-5 tabular-nums">
            <span>
              Fakt {index + 1} / {items.length}
            </span>
            <span>{Math.round(((index + 1) / items.length) * 100)}%</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="min-h-[120px] flex items-center justify-center text-center mb-6"
            >
              <p className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {current.statement}
              </p>
            </motion.div>
          </AnimatePresence>

          {feedback ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl border text-center text-sm font-semibold ${
                feedback.correct
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-red-50 border-red-300 text-red-900"
              }`}
            >
              {feedback.text}
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAnswer(true)}
                className="flex items-center justify-center gap-2 py-4 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                <Check className="w-5 h-5 text-emerald-700" />
                <span>To'g'ri</span>
              </button>
              <button
                type="button"
                onClick={() => handleAnswer(false)}
                className="flex items-center justify-center gap-2 py-4 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-red-700" />
                <span>Noto'g'ri</span>
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center"
        >
          <p className="text-xs font-medium text-blue-700 mb-2">Blits yakunlandi</p>
          <h4 className="font-display text-3xl font-bold text-slate-900 tabular-nums mb-2">
            {score} ball
          </h4>
          <p className="text-sm text-slate-600 mb-6">
            Qolgan vaqt: <strong className="tabular-nums">{timeLeft} soniya</strong>
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qayta o'ynash</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
