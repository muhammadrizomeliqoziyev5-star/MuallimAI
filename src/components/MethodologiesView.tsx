import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Pause, RotateCcw, RefreshCw, Clock } from "lucide-react";
import type { MethodologyItem } from "../types/lesson";
import { soundFx } from "../utils/soundFx";

interface MethodologiesViewProps {
  methodologies: MethodologyItem[];
  isRegenerating: boolean;
  onRegenerate: () => void;
}

export const MethodologiesView: React.FC<MethodologiesViewProps> = ({
  methodologies,
  isRegenerating,
  onRegenerate,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(
    (methodologies[0]?.durationMinutes || 5) * 60
  );
  const [running, setRunning] = useState(false);

  const safeIdx = Math.min(selectedIdx, Math.max(0, methodologies.length - 1));
  const current = methodologies[safeIdx];

  useEffect(() => {
    setRunning(false);
    setSecondsLeft((current?.durationMinutes || 5) * 60);
  }, [safeIdx, current?.durationMinutes]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          soundFx.playFanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  if (!current) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Pedagogik metodikalar va dars texnologiyalari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Har bir bosqichni dars davomida taymer bilan jonli boshqarishingiz mumkin
          </p>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
          <span>Metodikalarni yangilash</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Methods */}
        <div className="lg:col-span-4 space-y-2.5">
          {methodologies.map((m, idx) => {
            const active = idx === safeIdx;
            return (
              <button
                key={`${m.methodName}_${idx}`}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? "bg-white border-blue-700 ring-1 ring-blue-700/20 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                  <span>{m.stage}</span>
                  <span className="font-mono tabular-nums">{m.durationMinutes} daq</span>
                </div>
                <p className="font-display text-base font-bold text-slate-900">
                  0{idx + 1}. {m.methodName}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Active Method Stage & Live Classroom Timer */}
        <motion.div
          key={safeIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <p className="text-xs font-medium text-blue-700 mb-1">
                {current.stage} · {current.durationMinutes} daqiqa
              </p>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                {current.methodName}
              </h3>
              <p className="text-sm text-slate-600 mt-1.5">{current.goal}</p>
            </div>

            {/* Classroom Timer Widget */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span
                className={`font-mono text-lg font-bold tabular-nums min-w-[56px] ${
                  secondsLeft === 0 ? "text-red-600" : "text-slate-900"
                }`}
              >
                {formattedTime}
              </span>
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                aria-label={running ? "To'xtatish" : "Boshlash"}
              >
                {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(current.durationMinutes * 60);
                }}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Taymerni qayta o'rnatish"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Teacher Prompt */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">
              O'qituvchining sinfga yo'naltiruvchi savoli / topshirig'i
            </p>
            <p className="text-sm font-medium text-slate-900 leading-relaxed">
              “{current.teacherPrompt}”
            </p>
          </div>

          {/* Step by step */}
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              O'tkazish bosqichlari
            </h4>
            <ol className="space-y-2.5">
              {current.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 font-mono text-xs font-semibold flex items-center justify-center shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">Kutilayotgan natija</p>
            <p className="text-sm text-slate-700 leading-relaxed">{current.expectedOutcome}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
