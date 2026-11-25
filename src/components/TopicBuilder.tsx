import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Presentation,
  BookOpen,
  Lightbulb,
  CheckSquare,
  Gamepad2,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { GenerationOptions, LessonLanguage, GameSelectionOptions } from "../types/lesson";

interface TopicBuilderProps {
  isGenerating: boolean;
  error: string | null;
  onGenerate: (payload: {
    topic: string;
    grade: string;
    subject: string;
    language: LessonLanguage;
    options: GenerationOptions;
  }) => void;
}

const SAMPLE_TOPICS = [
  { topic: "Fotosintez va o'simliklarda energiya almashinuvi", grade: "6-sinf", subject: "Biologiya" },
  { topic: "Amir Temur davlat boshqaruvi va bunyodkorlik ishlari", grade: "7-sinf", subject: "Tarix" },
  { topic: "Kvadrat tenglamalar va Viyet teoremasi", grade: "8-sinf", subject: "Algebra" },
  { topic: "Quyosh tizimi sayyoralari va gravitatsiya", grade: "5-sinf", subject: "Tabiatshunoslik" },
];

const CHECKBOX_ITEMS: {
  key: keyof Omit<GenerationOptions, "gameTypes">;
  title: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    key: "slides",
    title: "Taqdimot slaydlari",
    desc: "7–8 ta interaktiv slayd, sxema g'oyasi va nutq matni",
    icon: Presentation,
  },
  {
    key: "methodologies",
    title: "Pedagogik metodikalar",
    desc: "Klaster, Aqliy hujum, Bumerang, BBB va dars taymeri",
    icon: Lightbulb,
  },
  {
    key: "homework",
    title: "Uyga vazifalar",
    desc: "3 darajali topshiriqlar va balli baholash mezoni",
    icon: BookOpen,
  },
  {
    key: "quiz",
    title: "Test savollari",
    desc: "Interaktiv viktorina, izohlar va chop etish kaliti",
    icon: CheckSquare,
  },
  {
    key: "games",
    title: "Interaktiv o'yinlar",
    desc: "Krossvord, Bilim pazli, Xotira, Filvord, Omad charxi, Tezkor saralash",
    icon: Gamepad2,
  },
];

const GAME_SUB_OPTIONS: { key: keyof GameSelectionOptions; label: string }[] = [
  { key: "crossword", label: "Krossvord" },
  { key: "puzzle", label: "Bilim pazli" },
  { key: "memory", label: "Xotira juftligi" },
  { key: "wordsearch", label: "So'z ovchisi" },
  { key: "wheel", label: "Omad charxi" },
  { key: "blitz", label: "Tezkor saralash" },
];

export const TopicBuilder: React.FC<TopicBuilderProps> = ({
  isGenerating,
  error,
  onGenerate,
}) => {
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("7-sinf");
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState<LessonLanguage>("uz");
  const [imgError, setImgError] = useState(false);

  const [options, setOptions] = useState<GenerationOptions>({
    slides: true,
    homework: true,
    methodologies: true,
    quiz: true,
    games: true,
    gameTypes: {
      crossword: true,
      puzzle: true,
      memory: true,
      wordsearch: true,
      wheel: true,
      blitz: true,
    },
  });

  const toggleOption = (key: keyof Omit<GenerationOptions, "gameTypes">) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleGameType = (key: keyof GameSelectionOptions) => {
    setOptions((prev) => ({
      ...prev,
      gameTypes: {
        ...prev.gameTypes,
        [key]: !prev.gameTypes[key],
      },
    }));
  };

  const selectedCount = [
    options.slides,
    options.methodologies,
    options.homework,
    options.quiz,
    options.games,
  ].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || selectedCount === 0 || isGenerating) return;
    onGenerate({
      topic: topic.trim(),
      grade: grade.trim(),
      subject: subject.trim(),
      language,
      options,
    });
  };

  return (
    <section className="max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Left Zone: Topic & Checkboxes Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-between"
        >
          <div>
            <p className="text-sm font-medium text-blue-700 mb-3">
              O'qituvchilar uchun aqlli dars konstruktori
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-[1.12] [text-wrap:balance] mb-4">
              Mavzuni kiriting — tayyor dars, metodika va o'yinlarni oling
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl mb-8">
              Dars mavzusini yozing va pastdan kerakli bo'limlarga ptichka qo'ying. Tizim
              slaydlar, tabaqalashtirilgan uyga vazifa, interaktiv pazl, krossvord va
              sinf o'yinlarini bir zumda tayyorlaydi.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Topic Input Surface */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div>
                  <label
                    htmlFor="lesson-topic"
                    className="block text-sm font-semibold text-slate-800 mb-2"
                  >
                    Dars mavzusi
                  </label>
                  <input
                    id="lesson-topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Masalan: Fotosintez jarayoni yoki Pifagor teoremasi..."
                    className="w-full px-4 py-3.5 text-base bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15 transition-all"
                    required
                  />
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>Namuna mavzular:</span>
                    {SAMPLE_TOPICS.map((item, idx) => (
                      <button
                        key={item.topic}
                        type="button"
                        onClick={() => {
                          setTopic(item.topic);
                          setGrade(item.grade);
                          setSubject(item.subject);
                        }}
                        className="text-slate-700 hover:text-blue-700 underline underline-offset-4 decoration-slate-300 hover:decoration-blue-700 transition-colors cursor-pointer text-left"
                      >
                        {item.subject} ({item.grade})
                        {idx < SAMPLE_TOPICS.length - 1 ? "" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metadata Inputs Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label
                      htmlFor="lesson-subject"
                      className="block text-xs font-medium text-slate-600 mb-1.5"
                    >
                      Fan nomi
                    </label>
                    <input
                      id="lesson-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Biologiya, Tarix..."
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-700 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lesson-grade"
                      className="block text-xs font-medium text-slate-600 mb-1.5"
                    >
                      Sinf yoki bosqich
                    </label>
                    <input
                      id="lesson-grade"
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="7-sinf"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-700 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lesson-language"
                      className="block text-xs font-medium text-slate-600 mb-1.5"
                    >
                      Material tili
                    </label>
                    <select
                      id="lesson-language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as LessonLanguage)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-700 transition-colors cursor-pointer"
                    >
                      <option value="uz">O'zbek tili (Lotin)</option>
                      <option value="ru">Русский язык</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Checkboxes ("Ptichka qo'yish") Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Nimalar yaratilsin? (Kerakli bo'limlarga ptichka qo'ying)
                  </h2>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {selectedCount} / 5 ta bo'lim tanlandi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHECKBOX_ITEMS.map((item) => {
                    const checked = options[item.key];
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.key}
                        type="button"
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleOption(item.key)}
                        className={`group relative flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          checked
                            ? "bg-white border-blue-700 ring-1 ring-blue-700/20 shadow-xs"
                            : "bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                        } ${item.key === "games" ? "sm:col-span-2" : ""}`}
                      >
                        {/* Tactile Ptichka Box */}
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                            checked
                              ? "bg-blue-700 border-blue-700 text-white"
                              : "bg-white border-slate-300 group-hover:border-slate-400"
                          }`}
                        >
                          <AnimatePresence initial={false}>
                            {checked && (
                              <motion.div
                                initial={{ scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.4, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                checked ? "text-blue-700" : "text-slate-500"
                              }`}
                            />
                            <span className="text-sm font-semibold text-slate-900">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Sub-options when Interaktiv o'yinlar is checked */}
                <AnimatePresence>
                  {options.games && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 bg-white border border-slate-200 rounded-xl">
                        <p className="text-xs font-medium text-slate-600 mb-2.5">
                          O'yin turlarini tanlang:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {GAME_SUB_OPTIONS.map((g) => {
                            const active = options.gameTypes[g.key];
                            return (
                              <button
                                key={g.key}
                                type="button"
                                onClick={() => toggleGameType(g.key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                  active
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                                    active ? "bg-blue-500 text-white" : "border border-slate-300"
                                  }`}
                                >
                                  {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </span>
                                {g.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <p className="font-semibold">Xatolik yuz berdi</p>
                    <p className="text-xs text-red-700 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <motion.button
                  type="submit"
                  disabled={!topic.trim() || selectedCount === 0 || isGenerating}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI agent darsni tayyorlamoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Dars materiallarini yaratish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                <span className="text-xs text-slate-500">
                  Barcha slayd, test va o'yinlar darsdan so'ng ham saqlanib qoladi
                </span>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Zone: Editorial Atelier Visual Anchor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="lg:col-span-5 flex flex-col"
        >
          <div className="relative flex-1 min-h-[360px] lg:min-h-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            {!imgError ? (
              <img
                src="/src/assets/images/atelier_teaching_desk_1795412706516.jpg"
                alt="Zamonaviy o'qituvchi ish stoli va dars konstruktori"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover lg:h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-200 to-blue-50 flex flex-col items-center justify-center p-8 text-center">
                <Presentation className="w-12 h-12 text-blue-700 mb-3" />
                <p className="font-display text-lg font-semibold text-slate-800">
                  Muallim Studio
                </p>
              </div>
            )}

            {/* Measured contrast scrim at bottom */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent p-6 pt-20 text-white">
              <p className="text-xs font-medium text-blue-200 mb-1.5">
                Bitta mavzu · To'liq dars ekotizimi
              </p>
              <p className="font-display text-lg font-semibold leading-snug mb-3">
                Sinfdoshingiz va o'quvchilaringizni qiziqtiradigan interaktiv muhit
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-200 tabular-nums">
                <span>8 ta slayd</span>
                <span aria-hidden="true">·</span>
                <span>5 ta metodika</span>
                <span aria-hidden="true">·</span>
                <span>6 xil interaktiv o'yin</span>
                <span aria-hidden="true">·</span>
                <span>3 darajali uyga vazifa</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
