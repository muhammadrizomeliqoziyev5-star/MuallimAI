import React, { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Printer, RefreshCw } from "lucide-react";
import type { HomeworkData } from "../types/lesson";

interface HomeworkViewProps {
  homework: HomeworkData;
  lessonTitle: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  homework,
  lessonTitle,
  isRegenerating,
  onRegenerate,
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyTier = async (idx: number) => {
    const tier = homework.tiers[idx];
    if (!tier) return;
    const text = `${lessonTitle} — Uyga vazifa (${tier.level}: ${tier.title})\nVaqt: ~${tier.estimatedMinutes} daqiqa\n\nTopshiriqlar:\n${tier.tasks
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n")}\n\nQo'shimcha ijodiy vazifa: ${tier.creativeBonus}`;
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const totalPoints = homework.gradingRubric.reduce((sum, r) => sum + r.maxPoints, 0);

  return (
    <div className="space-y-8">
      {/* Header & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Tabaqalashtirilgan uyga vazifalar
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">{homework.overview}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Yangilash</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Chop etish</span>
          </button>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {homework.tiers.map((tier, idx) => (
          <motion.div
            key={`${tier.level}_${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.22 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                <span className="font-semibold text-blue-700">{tier.level} daraja</span>
                <span className="tabular-nums">~{tier.estimatedMinutes} daqiqa</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
                {tier.title}
              </h3>

              <ol className="space-y-2.5 mb-5">
                {tier.tasks.map((task, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="font-mono text-xs text-slate-400 mt-1 tabular-nums">
                      {tIdx + 1}.
                    </span>
                    <span className="leading-relaxed">{task}</span>
                  </li>
                ))}
              </ol>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Ijodiy bonus topshiriq
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">{tier.creativeBonus}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopyTier(idx)}
              className="no-print mt-5 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {copiedIdx === idx ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Guruhga yuborish uchun nusxalandi</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Topshiriqni nusxalash</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Grading Rubric Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900">
            Baholash mezoni (Rubrika)
          </h3>
          <span className="text-xs font-semibold text-slate-600 tabular-nums">
            Jami: {totalPoints} ball
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-6">Mezon</th>
                <th className="py-3 px-6">Tavsif</th>
                <th className="py-3 px-6 text-right">Maksimal ball</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {homework.gradingRubric.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-6 font-medium text-slate-900">{row.criterion}</td>
                  <td className="py-3.5 px-6 text-slate-600">{row.description}</td>
                  <td className="py-3.5 px-6 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {row.maxPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
