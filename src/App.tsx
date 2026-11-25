import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header, type AppView } from "./components/Header";
import { TopicBuilder } from "./components/TopicBuilder";
import { LessonWorkspace, type WorkspaceTabId } from "./components/LessonWorkspace";
import { SavedLessonsView } from "./components/SavedLessonsView";
import type {
  GeneratedLessonPack,
  GenerationOptions,
  LessonLanguage,
} from "./types/lesson";

const STORAGE_KEY = "muallim_studio_lessons_v1";

const LOADING_STEPS = [
  "Mavzu tahlil qilinmoqda va o'quv maqsadlari shakllantirilmoqda...",
  "Taqdimot slaydlari va pedagogik metodikalar tuzilmoqda...",
  "Krossvord, bilim pazli va sinf o'yinlari generatsiya qilinmoqda...",
  "Test savollari va uyga vazifa rubrikalari tayyorlanmoqda...",
];

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("builder");
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState<WorkspaceTabId | undefined>(
    undefined
  );

  const [savedLessons, setSavedLessons] = useState<GeneratedLessonPack[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as GeneratedLessonPack[]) : [];
    } catch {
      return [];
    }
  });

  const [currentLesson, setCurrentLesson] = useState<GeneratedLessonPack | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as GeneratedLessonPack[]) : [];
      return parsed[0] || null;
    } catch {
      return null;
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [regeneratingSection, setRegeneratingSection] = useState<WorkspaceTabId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLessons.slice(0, 20)));
    } catch {
      // Ignore quota errors
    }
  }, [savedLessons]);

  useEffect(() => {
    if (!isGenerating) {
      setLoadingStepIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingStepIdx((i) => (i + 1) % LOADING_STEPS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [isGenerating]);

  const handleGenerate = async (payload: {
    topic: string;
    grade: string;
    subject: string;
    language: LessonLanguage;
    options: GenerationOptions;
  }) => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Server xatoligi yuz berdi.");
      }

      const lesson = data as GeneratedLessonPack;
      setCurrentLesson(lesson);
      setSavedLessons((prev) => [lesson, ...prev.filter((l) => l.id !== lesson.id)]);
      setWorkspaceInitialTab(undefined);
      setActiveView("workspace");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Dars yaratishda xatolik yuz berdi.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (section: WorkspaceTabId) => {
    if (!currentLesson || regeneratingSection) return;
    setRegeneratingSection(section);
    setError(null);

    try {
      const res = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentLesson.topic,
          grade: currentLesson.lessonMeta.grade,
          subject: currentLesson.lessonMeta.subject,
          language: currentLesson.language,
          section,
          gameTypes: currentLesson.options.gameTypes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bo'limni yangilab bo'lmadi.");
      }

      const updated: GeneratedLessonPack = {
        ...currentLesson,
        ...(data.slides ? { slides: data.slides } : {}),
        ...(data.homework ? { homework: data.homework } : {}),
        ...(data.methodologies ? { methodologies: data.methodologies } : {}),
        ...(data.quiz ? { quiz: data.quiz } : {}),
        ...(data.games ? { games: data.games } : {}),
      };

      setCurrentLesson(updated);
      setSavedLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bo'limni yangilashda xatolik.";
      setError(message);
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleNavigate = (view: AppView) => {
    if (view === "games") {
      setWorkspaceInitialTab("games");
      setActiveView("workspace");
    } else if (view === "workspace") {
      setWorkspaceInitialTab(undefined);
      setActiveView("workspace");
    } else {
      setActiveView(view);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenSaved = (lesson: GeneratedLessonPack) => {
    setCurrentLesson(lesson);
    setWorkspaceInitialTab(undefined);
    setActiveView("workspace");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteSaved = (id: string) => {
    setSavedLessons((prev) => prev.filter((l) => l.id !== id));
    if (currentLesson?.id === id) {
      setCurrentLesson(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900">
      <Header
        activeView={
          activeView === "workspace" && workspaceInitialTab === "games"
            ? "games"
            : activeView
        }
        hasLesson={!!currentLesson}
        hasGames={!!currentLesson?.games}
        savedCount={savedLessons.length}
        onNavigate={handleNavigate}
        onNewLesson={() => handleNavigate("builder")}
      />

      {/* Mobile compact quick switcher */}
      <div className="md:hidden border-b border-slate-200 bg-white px-4 py-2 flex items-center gap-2 overflow-x-auto no-print">
        <button
          type="button"
          onClick={() => handleNavigate("builder")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
            activeView === "builder" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          Konstruktor
        </button>
        {currentLesson && (
          <button
            type="button"
            onClick={() => handleNavigate("workspace")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
              activeView === "workspace" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Dars to'plami
          </button>
        )}
        <button
          type="button"
          onClick={() => handleNavigate("saved")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
            activeView === "saved" ? "bg-slate-900 text-white" : "text-slate-600"
          }`}
        >
          Saqlanganlar ({savedLessons.length})
        </button>
      </div>

      <main className="flex-1">
        {/* Global section-regeneration error notice */}
        {error && activeView !== "builder" && (
          <div className="max-w-[1280px] mx-auto px-6 pt-6">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeView === "builder" && (
            <motion.div
              key="builder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TopicBuilder
                isGenerating={isGenerating}
                error={error}
                onGenerate={handleGenerate}
              />
            </motion.div>
          )}

          {activeView === "workspace" && currentLesson && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LessonWorkspace
                lesson={currentLesson}
                initialTab={workspaceInitialTab}
                regeneratingSection={regeneratingSection}
                onRegenerateSection={handleRegenerateSection}
                onBackToBuilder={() => handleNavigate("builder")}
              />
            </motion.div>
          )}

          {activeView === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SavedLessonsView
                lessons={savedLessons}
                onOpenLesson={handleOpenSaved}
                onDeleteLesson={handleDeleteSaved}
                onCreateNew={() => handleNavigate("builder")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fullscreen Animated Generation Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
            >
              {/* Animated geometric blocks */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      delay: i * 0.16,
                      ease: "easeInOut",
                    }}
                    className="w-3.5 h-3.5 rounded bg-blue-700"
                  />
                ))}
              </div>

              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                Dars to'plami yaratilmoqda
              </h3>

              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingStepIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-slate-600 min-h-[40px]"
                >
                  {LOADING_STEPS[loadingStepIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-slate-200 bg-white mt-12 no-print">
        <div className="max-w-[1280px] mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Muallim Studio · O'qituvchilar uchun interaktiv dars konstruktori</span>
          <span>Barcha yaratilgan darslar brauzeringizda saqlanadi</span>
        </div>
      </footer>
    </div>
  );
}
