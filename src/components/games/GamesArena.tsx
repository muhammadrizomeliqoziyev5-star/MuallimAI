import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Grid3X3,
  Puzzle,
  Layers,
  Search,
  Disc,
  Zap,
  Volume2,
  VolumeX,
  RefreshCw,
} from "lucide-react";
import type { GamesData } from "../../types/lesson";
import { CrosswordGame } from "./CrosswordGame";
import { PuzzleGame } from "./PuzzleGame";
import { MemoryGame } from "./MemoryGame";
import { WordSearchGame } from "./WordSearchGame";
import { WheelGame } from "./WheelGame";
import { BlitzSortGame } from "./BlitzSortGame";
import { soundFx } from "../../utils/soundFx";

interface GamesArenaProps {
  games: GamesData;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

type GameTabId = "crossword" | "puzzle" | "memory" | "wordsearch" | "wheel" | "blitz";

export const GamesArena: React.FC<GamesArenaProps> = ({
  games,
  isRegenerating,
  onRegenerate,
}) => {
  const availableTabs = useMemo(() => {
    const list: { id: GameTabId; label: string; icon: React.FC<{ className?: string }> }[] = [];
    if (games.crossword?.length) list.push({ id: "crossword", label: "Krossvord", icon: Grid3X3 });
    if (games.puzzle?.length) list.push({ id: "puzzle", label: "Bilim pazli", icon: Puzzle });
    if (games.memory?.length) list.push({ id: "memory", label: "Xotira juftligi", icon: Layers });
    if (games.wordsearch?.length)
      list.push({ id: "wordsearch", label: "So'z ovchisi", icon: Search });
    if (games.wheel?.length) list.push({ id: "wheel", label: "Omad charxi", icon: Disc });
    if (games.blitz?.length) list.push({ id: "blitz", label: "Tezkor saralash", icon: Zap });
    return list;
  }, [games]);

  const [activeTab, setActiveTab] = useState<GameTabId>(availableTabs[0]?.id || "crossword");
  const [muted, setMuted] = useState(soundFx.muted);

  const effectiveTab = availableTabs.some((t) => t.id === activeTab)
    ? activeTab
    : availableTabs[0]?.id;

  const toggleSound = () => {
    soundFx.muted = !muted;
    setMuted(!muted);
  };

  if (availableTabs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-600">
        Ushbu dars uchun interaktiv o'yinlar yaratilmagan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Arena Header & Game Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === effectiveTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{muted ? "Ovoz o'chiq" : "Ovoz yoqiq"}</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>O'yinlarni yangilash</span>
          </button>
        </div>
      </div>

      {/* Active Game Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={effectiveTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {effectiveTab === "crossword" && games.crossword && (
            <CrosswordGame entries={games.crossword} />
          )}
          {effectiveTab === "puzzle" && games.puzzle && (
            <PuzzleGame pieces={games.puzzle} />
          )}
          {effectiveTab === "memory" && games.memory && (
            <MemoryGame pairs={games.memory} />
          )}
          {effectiveTab === "wordsearch" && games.wordsearch && (
            <WordSearchGame words={games.wordsearch} />
          )}
          {effectiveTab === "wheel" && games.wheel && (
            <WheelGame segments={games.wheel} />
          )}
          {effectiveTab === "blitz" && games.blitz && (
            <BlitzSortGame items={games.blitz} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
