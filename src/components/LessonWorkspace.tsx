import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Presentation,
  Lightbulb,
  BookOpen,
  CheckSquare,
  Gamepad2,
  ArrowLeft,
} from "lucide-react";
import type { GeneratedLessonPack } from "../types/lesson";
import { SlidesViewer } from "./SlidesViewer";
import { MethodologiesView } from "./MethodologiesView";
import { HomeworkView } from "./HomeworkView";
import { QuizView } from "./QuizView";
import { GamesArena } from "./games/GamesArena";

export type WorkspaceTabId = "slides" | "methodologies" | "homework" | "quiz" | "games";

interface LessonWorkspaceProps {
  lesson: GeneratedLessonPack;
  initialTab?: WorkspaceTabId;
  regeneratingSection: WorkspaceTabId | null;
  onRegenerateSection: (section: WorkspaceTabId) => void;
  onBackToBuilder: () => void;
}

export const LessonWorkspace: React.FC<LessonWorkspaceProps> = ({
  lesson,
  initialTab,
  regeneratingSection,
  onRegenerateSection,
  onBackToBuilder,
}) => {
  const tabs = useMemo(() => {
    const list: { id: WorkspaceTabId; label: string; icon: React.FC<{ className?: string }> }[] = [];
    if (lesson.slides?.length) {
      list.push({ id: "slides", label: `Taqdimot (${lesson.slides.length})`, icon: Presentation });
    }
    if (lesson.methodologies?.length) {
      list.push({
        id: "methodologies",
        label: `Metodikalar (${lesson.methodologies.length})`,
        icon: Lightbulb,
      });
    }
    if (lesson.homework) {
      list.push({ id: "homework", label: "Uyga vazifa", icon: BookOpen });
    }
    if (lesson.quiz?.length) {
      list.push({ id: "quiz", label: `Testlar (${lesson.quiz.length})`, icon: CheckSquare });
    }
    if (lesson.games) {
      list.push({ id: "games", label: "O'yinlar arenasi", icon: Gamepad2 });
    }
    return list;
  }, [lesson]);

  const [activeTab, setActiveTab] = useState<WorkspaceTabId>(
    initialTab && tabs.some((t) => t.id === initialTab) ? initialTab : tabs[0]?.id || "slides"
  );

  useEffect(() => {
    if (initialTab && tabs.some((t) => t.id === initialTab)) {
      setActiveTab(initialTab);
    } else if (!tabs.some((t) => t.id === activeTab) && tabs[0]) {
      setActiveTab(tabs[0].id);
    }
  }, [initialTab, tabs, activeTab]);

  return (
    <section className="max-w-[1280px] mx-auto px-6 py-8 lg:py-10 space-y-8">
      {/* Lesson Header Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={onBackToBuilder}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-700 font-medium cursor-pointer mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Konstruktorga qaytish</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>{lesson.lessonMeta.subject}</span>
            <span aria-hidden="true">·</span>
            <span>{lesson.lessonMeta.grade}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{lesson.lessonMeta.durationMinutes} daqiqa</span>
          </div>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight [text-wrap:balance] mb-2">
          {lesson.lessonMeta.title || lesson.topic}
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          {lesson.lessonMeta.objective}
        </p>

        {/* Workspace Section Tabs */}
        {tabs.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="workspace-active-tab"
                      transition={{ type: "spring", bounce: 0.18, duration: 0.35 }}
                      className="absolute inset-0 bg-blue-700 rounded-xl"
                    />
                  )}
                  <Icon className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Section Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {activeTab === "slides" && lesson.slides && (
            <SlidesViewer
              slides={lesson.slides}
              lessonTitle={lesson.lessonMeta.title || lesson.topic}
              isRegenerating={regeneratingSection === "slides"}
              onRegenerate={() => onRegenerateSection("slides")}
            />
          )}

          {activeTab === "methodologies" && lesson.methodologies && (
            <MethodologiesView
              methodologies={lesson.methodologies}
              isRegenerating={regeneratingSection === "methodologies"}
              onRegenerate={() => onRegenerateSection("methodologies")}
            />
          )}

          {activeTab === "homework" && lesson.homework && (
            <HomeworkView
              homework={lesson.homework}
              lessonTitle={lesson.lessonMeta.title || lesson.topic}
              isRegenerating={regeneratingSection === "homework"}
              onRegenerate={() => onRegenerateSection("homework")}
            />
          )}

          {activeTab === "quiz" && lesson.quiz && (
            <QuizView
              questions={lesson.quiz}
              lessonTitle={lesson.lessonMeta.title || lesson.topic}
              isRegenerating={regeneratingSection === "quiz"}
              onRegenerate={() => onRegenerateSection("quiz")}
            />
          )}

          {activeTab === "games" && lesson.games && (
            <GamesArena
              games={lesson.games}
              isRegenerating={regeneratingSection === "games"}
              onRegenerate={() => onRegenerateSection("games")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
