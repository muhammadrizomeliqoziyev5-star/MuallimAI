import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  MessageSquareText,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import type { SlideItem } from "../types/lesson";

interface SlidesViewerProps {
  slides: SlideItem[];
  lessonTitle: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

const LAYOUT_LABELS: Record<string, string> = {
  cover: "Kirish slaydi",
  concept: "Asosiy tushuncha",
  comparison: "Taqqoslash va tahlil",
  diagram: "Vizual sxema",
  activity: "Sinf mashg'uloti",
  summary: "Xulosa va refleksiya",
};

export const SlidesViewer: React.FC<SlidesViewerProps> = ({
  slides,
  lessonTitle,
  isRegenerating,
  onRegenerate,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showNotes, setShowNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const safeIdx = Math.min(currentIdx, Math.max(0, slides.length - 1));
  const slide = slides[safeIdx];

  const goNext = useCallback(() => {
    if (safeIdx < slides.length - 1) {
      setDirection(1);
      setCurrentIdx((i) => i + 1);
    }
  }, [safeIdx, slides.length]);

  const goPrev = useCallback(() => {
    if (safeIdx > 0) {
      setDirection(-1);
      setCurrentIdx((i) => i - 1);
    }
  }, [safeIdx]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, isFullscreen]);

  const handleCopyOutline = async () => {
    const text = slides
      .map(
        (s) =>
          `Slayd ${s.slideNumber}: ${s.title}\n${s.subtitle}\n${s.bulletPoints
            .map((b) => `- ${b}`)
            .join("\n")}\nAsosiy xulosa: ${s.keyTakeaway}\nO'qituvchi izohi: ${s.speakerNotes}\n`
      )
      .join("\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!slide) return null;

  const isCover = slide.layoutType === "cover";
  const isSummary = slide.layoutType === "summary";

  const slideStage = (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 ${
        isFullscreen ? "h-full w-full max-w-6xl mx-auto p-10 lg:p-14" : "min-h-[430px] p-7 sm:p-10"
      } ${
        isCover
          ? "bg-slate-900 text-white border-slate-800"
          : isSummary
          ? "bg-blue-950 text-white border-blue-900"
          : "bg-white text-slate-900"
      }`}
    >
      {/* Top slide metadata */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <span
          className={`text-xs font-medium ${
            isCover || isSummary ? "text-blue-200" : "text-slate-500"
          }`}
        >
          {LAYOUT_LABELS[slide.layoutType] || "Dars slaydi"} · {lessonTitle}
        </span>
        <span
          className={`font-mono text-xs tabular-nums ${
            isCover || isSummary ? "text-slate-300" : "text-slate-400"
          }`}
        >
          {String(safeIdx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Animated Slide Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide.slideNumber}
          custom={direction}
          initial={{ opacity: 0, x: direction * 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -28 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col justify-center"
        >
          <h2
            className={`font-display font-bold tracking-tight [text-wrap:balance] ${
              isCover
                ? "text-3xl sm:text-4xl lg:text-5xl text-white mb-4"
                : "text-2xl sm:text-3xl text-inherit mb-2.5"
            }`}
          >
            {slide.title}
          </h2>
          <p
            className={`text-sm sm:text-base mb-6 max-w-3xl ${
              isCover || isSummary ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {slide.subtitle}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <ul
              className={`space-y-3 ${
                slide.visualDiagramHint && !isCover ? "lg:col-span-8" : "lg:col-span-12"
              }`}
            >
              {slide.bulletPoints.map((point, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  className={`flex items-start gap-3 text-sm sm:text-base leading-relaxed ${
                    isCover || isSummary ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  <span
                    className={`font-mono text-xs font-semibold mt-1 tabular-nums shrink-0 ${
                      isCover || isSummary ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>

            {slide.visualDiagramHint && !isCover && (
              <div
                className={`lg:col-span-4 rounded-xl p-4 border text-xs leading-relaxed ${
                  isSummary
                    ? "bg-blue-900/50 border-blue-800 text-blue-100"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <p
                  className={`font-semibold mb-1.5 ${
                    isSummary ? "text-white" : "text-slate-900"
                  }`}
                >
                  Doska / Sxema g'oyasi
                </p>
                <p>{slide.visualDiagramHint}</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Key Takeaway & Progress Bar */}
      <div className="mt-8 pt-4 border-t border-current/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p
          className={`text-xs sm:text-sm font-medium ${
            isCover || isSummary ? "text-blue-200" : "text-blue-800"
          }`}
        >
          Asosiy fikr: {slide.keyTakeaway}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={goPrev}
            disabled={safeIdx === 0}
            className={`p-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
              isCover || isSummary
                ? "border-white/20 hover:bg-white/10 text-white"
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            aria-label="Oldingi slayd"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={safeIdx === slides.length - 1}
            className={`p-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
              isCover || isSummary
                ? "border-white/20 hover:bg-white/10 text-white"
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            aria-label="Keyingi slayd"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle top progress hairline */}
      <div className="absolute top-0 inset-x-0 h-1 bg-slate-200/30">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((safeIdx + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Klaviatura strelkalari (← / →) bilan boshqaring</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              showNotes
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Ma'ruzachi izohi</span>
          </button>

          <button
            type="button"
            onClick={handleCopyOutline}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Nusxalandi" : "Matnni nusxalash"}</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Slaydlarni yangilash</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Taqdimot rejimi</span>
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      {slideStage}

      {/* Speaker Notes */}
      {showNotes && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-500 mb-1.5">
            O'qituvchi nutqi va izohi ({safeIdx + 1}-slayd)
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{slide.speakerNotes}</p>
        </div>
      )}

      {/* Slide Thumbnails Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {slides.map((s, idx) => {
          const active = idx === safeIdx;
          return (
            <button
              key={s.slideNumber}
              type="button"
              onClick={() => {
                setDirection(idx > safeIdx ? 1 : -1);
                setCurrentIdx(idx);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                active
                  ? "bg-white border-blue-700 ring-1 ring-blue-700/20"
                  : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300"
              }`}
            >
              <span className="block font-mono text-[11px] text-slate-400 tabular-nums mb-1">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="block text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Presenter Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 p-4 sm:p-8 flex flex-col justify-center"
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-5 right-5 z-10 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Chiqish (Esc)</span>
            </button>
            <div className="h-[82vh] w-full flex items-center justify-center">
              {slideStage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
