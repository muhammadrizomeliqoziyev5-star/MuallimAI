import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  EyeOff,
  Printer,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import type { QuizQuestion } from "../types/lesson";
import { soundFx } from "../utils/soundFx";

interface QuizViewProps {
  questions: QuizQuestion[];
  lessonTitle: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  lessonTitle,
  isRegenerating,
  onRegenerate,
}) => {
  const [mode, setMode] = useState<"interactive" | "sheet">("interactive");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showAnswersInSheet, setShowAnswersInSheet] = useState(false);

  const safeIdx = Math.min(currentIdx, Math.max(0, questions.length - 1));
  const current = questions[safeIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === current.correctIndex) {
      setScore((s) => s + 1);
      soundFx.playSuccess();
    } else {
      soundFx.playError();
    }
  };

  const handleNext = () => {
    if (safeIdx + 1 >= questions.length) {
      setFinished(true);
      soundFx.playFanfare();
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  };

  if (!questions.length) return null;

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("interactive")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              mode === "interactive"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Interaktiv test
          </button>
          <button
            type="button"
            onClick={() => setMode("sheet")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              mode === "sheet"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Chop etish va kalitlar
          </button>
        </div>

        <div className="flex items-center gap-2">
          {mode === "sheet" && (
            <>
              <button
                type="button"
                onClick={() => setShowAnswersInSheet((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {showAnswersInSheet ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span>{showAnswersInSheet ? "Kalitni yashirish" : "Javoblarni ko'rsatish"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chop etish</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              handleRestart();
              onRegenerate();
            }}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Yangi savollar</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Quiz */}
      {mode === "interactive" && !finished && current && (
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <span>
              Savol {safeIdx + 1} / {questions.length} · {current.difficulty}
            </span>
            <span className="font-mono font-semibold text-blue-700 tabular-nums">
              Ball: {score}
            </span>
          </div>

          {/* Progress track */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-blue-700 transition-all duration-300"
              style={{ width: `${((safeIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || safeIdx}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-display text-xl font-bold text-slate-900 leading-snug mb-6">
                {current.question}
              </h3>

              <div className="space-y-3">
                {current.options.map((opt, idx) => {
                  const isAnswered = selectedOption !== null;
                  const isCorrect = idx === current.correctIndex;
                  const isChosen = idx === selectedOption;

                  let styleClass =
                    "bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-700 text-slate-800";
                  if (isAnswered) {
                    if (isCorrect) {
                      styleClass = "bg-emerald-50 border-emerald-600 text-emerald-950";
                    } else if (isChosen) {
                      styleClass = "bg-red-50 border-red-500 text-red-950";
                    } else {
                      styleClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-70";
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileTap={!isAnswered ? { scale: 0.99 } : undefined}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer disabled:cursor-default ${styleClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs font-bold mt-0.5 px-2 py-0.5 rounded bg-white border border-current/15 shrink-0">
                          {OPTION_LETTERS[idx] || idx + 1}
                        </span>
                        <span className="text-sm font-medium leading-relaxed">{opt}</span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-0.5">
                      {selectedOption === current.correctIndex
                        ? "To'g'ri javob!"
                        : "Izoh:"}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {current.explanation}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <span>
                      {safeIdx + 1 === questions.length ? "Natijani ko'rish" : "Keyingi savol"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Interactive Finish Screen */}
      {mode === "interactive" && finished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center"
        >
          <p className="text-xs font-medium text-blue-700 mb-2">Test yakunlandi</p>
          <h3 className="font-display text-3xl font-bold text-slate-900 tabular-nums mb-2">
            {score} / {questions.length}
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            O'zlashtirish ko'rsatkichi:{" "}
            <strong className="text-slate-900 tabular-nums">
              {Math.round((score / questions.length) * 100)}%
            </strong>
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qaytadan boshlash</span>
          </button>
        </motion.div>
      )}

      {/* Mode 2: Printable Worksheet */}
      {mode === "sheet" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-display text-xl font-bold text-slate-900">
              {lessonTitle} — Nazorat testi
            </h3>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              Jami {questions.length} ta savol · Har bir to'g'ri javob uchun 1 ball
            </p>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div key={q.id || qIdx} className="pb-5 border-b border-slate-100 last:border-b-0">
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  <span className="font-mono text-blue-700 mr-2 tabular-nums">{qIdx + 1}.</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                  {q.options.map((opt, oIdx) => {
                    const isAns = showAnswersInSheet && oIdx === q.correctIndex;
                    return (
                      <div
                        key={oIdx}
                        className={`text-xs px-3 py-2 rounded-lg border ${
                          isAns
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className="font-mono mr-1.5">{OPTION_LETTERS[oIdx]})</span>
                        {opt}
                      </div>
                    );
                  })}
                </div>
                {showAnswersInSheet && (
                  <p className="text-xs text-slate-500 mt-2 pl-6">
                    Izoh: {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
