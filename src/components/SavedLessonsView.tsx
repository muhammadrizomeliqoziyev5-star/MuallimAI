import React from "react";
import { motion } from "motion/react";
import { Trash2, ArrowUpRight, FolderOpen } from "lucide-react";
import type { GeneratedLessonPack } from "../types/lesson";

interface SavedLessonsViewProps {
  lessons: GeneratedLessonPack[];
  onOpenLesson: (lesson: GeneratedLessonPack) => void;
  onDeleteLesson: (id: string) => void;
  onCreateNew: () => void;
}

export const SavedLessonsView: React.FC<SavedLessonsViewProps> = ({
  lessons,
  onOpenLesson,
  onDeleteLesson,
  onCreateNew,
}) => {
  if (lessons.length === 0) {
    return (
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <FolderOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
            Hali saqlangan darslar yo'q
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Konstruktorda birinchi dars mavzusini yarating — barcha materiallar avtomatik
            tarzda shu yerda saqlanadi.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Yangi dars yaratish
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1280px] mx-auto px-6 py-10">
      <div className="flex items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Saqlangan dars to'plamlari
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Avval yaratilgan taqdimotlar, testlar va o'yinlarni qayta oching
          </p>
        </div>
        <span className="text-xs text-slate-500 tabular-nums">
          Jami: {lessons.length} ta dars
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lessons.map((lesson, idx) => {
          const dateStr = new Date(lesson.createdAt).toLocaleDateString("uz-UZ", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          const parts: string[] = [];
          if (lesson.slides?.length) parts.push(`${lesson.slides.length} slayd`);
          if (lesson.methodologies?.length) parts.push(`${lesson.methodologies.length} metodika`);
          if (lesson.quiz?.length) parts.push(`${lesson.quiz.length} test`);
          if (lesson.games) parts.push("O'yinlar");

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <span>
                    {lesson.lessonMeta.subject} · {lesson.lessonMeta.grade}
                  </span>
                  <span className="tabular-nums">{dateStr}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 leading-snug mb-2">
                  {lesson.lessonMeta.title || lesson.topic}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  {lesson.lessonMeta.objective}
                </p>
                <p className="text-xs text-slate-500 mb-5 tabular-nums">
                  {parts.join(" · ")}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenLesson(lesson)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
                >
                  <span>Ochish</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteLesson(lesson.id)}
                  aria-label="Darsni o'chirish"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
