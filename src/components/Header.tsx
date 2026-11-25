import React from "react";

export type AppView = "builder" | "workspace" | "games" | "saved";

interface HeaderProps {
  activeView: AppView;
  hasLesson: boolean;
  hasGames: boolean;
  savedCount: number;
  onNavigate: (view: AppView) => void;
  onNewLesson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  hasLesson,
  hasGames,
  savedCount,
  onNavigate,
  onNewLesson,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate("builder")}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer hover:text-blue-700 transition-colors"
        >
          Muallim Studio
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate("builder")}
            className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
              activeView === "builder"
                ? "text-slate-900 border-blue-700"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Konstruktor
          </button>

          <button
            type="button"
            onClick={() => hasLesson && onNavigate("workspace")}
            disabled={!hasLesson}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              !hasLesson
                ? "opacity-40 cursor-not-allowed border-transparent"
                : activeView === "workspace"
                ? "text-slate-900 border-blue-700 cursor-pointer"
                : "border-transparent hover:text-slate-900 cursor-pointer"
            }`}
          >
            Dars to'plami
          </button>

          <button
            type="button"
            onClick={() => hasGames && onNavigate("games")}
            disabled={!hasGames}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              !hasGames
                ? "opacity-40 cursor-not-allowed border-transparent"
                : activeView === "games"
                ? "text-slate-900 border-blue-700 cursor-pointer"
                : "border-transparent hover:text-slate-900 cursor-pointer"
            }`}
          >
            O'yinlar arenasi
          </button>

          <button
            type="button"
            onClick={() => onNavigate("saved")}
            className={`py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
              activeView === "saved"
                ? "text-slate-900 border-blue-700"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            Saqlanganlar ({savedCount})
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewLesson}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Yangi dars
          </button>
        </div>
      </div>
    </header>
  );
};
