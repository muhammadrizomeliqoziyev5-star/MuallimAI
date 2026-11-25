import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY sozlanmagan. Iltimos, Secrets bo'limida API kalitni tekshiring.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function getLanguageInstruction(language: string): string {
  if (language === "ru") {
    return "Barcha matnlar, sarlavhalar, savollar, izohlar va o'yin topshiriqlari sof, savodli RUS tilida bo'lishi shart. Krossvord va filvord so'zlari faqat bitta so'zdan iborat bo'lsin (bo'shliq va tirelarsiz, katta kirill harflarida).";
  }
  if (language === "en") {
    return "All content, titles, questions, explanations, and game prompts must be in clear, natural ENGLISH. Crossword and word-search words must be single uppercase words (A-Z only, no spaces or hyphens).";
  }
  return "Barcha matnlar, sarlavhalar, savollar, izohlar va o'yin topshiriqlari adabiy O'ZBEK tilida (lotin yozuvida) bo'lishi shart. Krossvord va so'z qidiruv o'yinlari uchun so'zlar FAQAT bitta so'zdan iborat bo'lsin, bo'shliq (probel) va apostrof (') ishlatilmasin (masalan: FOTOSINTEZ, ENERGIYA, KLOROFILL, KISLOROD, QUYOSH, MOLEKULA, ILDIZ, BARG, QONUN, TARIX).";
}

function buildSectionSchemas(options: {
  slides?: boolean;
  homework?: boolean;
  methodologies?: boolean;
  quiz?: boolean;
  games?: boolean;
  gameTypes?: {
    crossword?: boolean;
    puzzle?: boolean;
    memory?: boolean;
    wordsearch?: boolean;
    wheel?: boolean;
    blitz?: boolean;
  };
}) {
  const properties: Record<string, unknown> = {
    lessonMeta: {
      type: Type.OBJECT,
      description: "Darsning umumiy pasporti va maqsadi",
      properties: {
        title: { type: Type.STRING },
        subject: { type: Type.STRING },
        grade: { type: Type.STRING },
        durationMinutes: { type: Type.INTEGER },
        objective: { type: Type.STRING },
        summary: { type: Type.STRING },
      },
      required: ["title", "subject", "grade", "durationMinutes", "objective", "summary"],
    },
  };

  const required = ["lessonMeta"];

  if (options.slides) {
    properties.slides = {
      type: Type.ARRAY,
      description: "7 yoki 8 ta taqdimot slaydi",
      items: {
        type: Type.OBJECT,
        properties: {
          slideNumber: { type: Type.INTEGER },
          layoutType: {
            type: Type.STRING,
            description: "cover | concept | comparison | diagram | activity | summary",
          },
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          bulletPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          keyTakeaway: { type: Type.STRING },
          speakerNotes: { type: Type.STRING },
          visualDiagramHint: { type: Type.STRING },
        },
        required: [
          "slideNumber",
          "layoutType",
          "title",
          "subtitle",
          "bulletPoints",
          "keyTakeaway",
          "speakerNotes",
          "visualDiagramHint",
        ],
      },
    };
    required.push("slides");
  }

  if (options.homework) {
    properties.homework = {
      type: Type.OBJECT,
      description: "3 darajali uyga vazifalar va baholash mezoni",
      properties: {
        overview: { type: Type.STRING },
        tiers: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING },
              title: { type: Type.STRING },
              estimatedMinutes: { type: Type.INTEGER },
              tasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              creativeBonus: { type: Type.STRING },
            },
            required: ["level", "title", "estimatedMinutes", "tasks", "creativeBonus"],
          },
        },
        gradingRubric: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              criterion: { type: Type.STRING },
              maxPoints: { type: Type.INTEGER },
              description: { type: Type.STRING },
            },
            required: ["criterion", "maxPoints", "description"],
          },
        },
      },
      required: ["overview", "tiers", "gradingRubric"],
    };
    required.push("homework");
  }

  if (options.methodologies) {
    properties.methodologies = {
      type: Type.ARRAY,
      description: "4-5 ta interaktiv pedagogik metodika",
      items: {
        type: Type.OBJECT,
        properties: {
          methodName: { type: Type.STRING },
          stage: { type: Type.STRING },
          durationMinutes: { type: Type.INTEGER },
          goal: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          teacherPrompt: { type: Type.STRING },
          expectedOutcome: { type: Type.STRING },
        },
        required: [
          "methodName",
          "stage",
          "durationMinutes",
          "goal",
          "steps",
          "teacherPrompt",
          "expectedOutcome",
        ],
      },
    };
    required.push("methodologies");
  }

  if (options.quiz) {
    properties.quiz = {
      type: Type.ARRAY,
      description: "8 ta test savoli, har biri 4 ta variantli",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          difficulty: { type: Type.STRING },
        },
        required: ["id", "question", "options", "correctIndex", "explanation", "difficulty"],
      },
    };
    required.push("quiz");
  }

  if (options.games) {
    const gt = options.gameTypes || {
      crossword: true,
      puzzle: true,
      memory: true,
      wordsearch: true,
      wheel: true,
      blitz: true,
    };

    const gameProps: Record<string, unknown> = {};
    const gameReq: string[] = [];

    if (gt.crossword !== false) {
      gameProps.crossword = {
        type: Type.ARRAY,
        description: "8 ta krossvord so'zi (faqat 1 so'z, 4-10 harf, umumiy harflari kesishadigan qilib tanlang)",
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            clue: { type: Type.STRING },
          },
          required: ["word", "clue"],
        },
      };
      gameReq.push("crossword");
    }

    if (gt.puzzle !== false) {
      gameProps.puzzle = {
        type: Type.ARRAY,
        description: "6 ta pazl bo'lagi (har bir bo'lakda sarlavha, savol/qism tomoni va mos keluvchi javob/tushuncha tomoni)",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            pieceTitle: { type: Type.STRING },
            promptSide: { type: Type.STRING },
            matchSide: { type: Type.STRING },
            hint: { type: Type.STRING },
          },
          required: ["id", "pieceTitle", "promptSide", "matchSide", "hint"],
        },
      };
      gameReq.push("puzzle");
    }

    if (gt.memory !== false) {
      gameProps.memory = {
        type: Type.ARRAY,
        description: "6 ta xotira o'yini juftligi (qisqa atama va qisqa ta'rif/fakt)",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            term: { type: Type.STRING },
            match: { type: Type.STRING },
          },
          required: ["id", "term", "match"],
        },
      };
      gameReq.push("memory");
    }

    if (gt.wordsearch !== false) {
      gameProps.wordsearch = {
        type: Type.ARRAY,
        description: "7 ta bitta so'zli kalit atama (4-10 harf, bo'shliq va belgilarsiz)",
        items: { type: Type.STRING },
      };
      gameReq.push("wordsearch");
    }

    if (gt.wheel !== false) {
      gameProps.wheel = {
        type: Type.ARRAY,
        description: "8 ta Omad charxi sektori (qisqa nom, sinf topshirig'i/savoli, ball va javob ishorasi)",
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            challenge: { type: Type.STRING },
            points: { type: Type.INTEGER },
            answerHint: { type: Type.STRING },
          },
          required: ["label", "challenge", "points", "answerHint"],
        },
      };
      gameReq.push("wheel");
    }

    if (gt.blitz !== false) {
      gameProps.blitz = {
        type: Type.ARRAY,
        description: "10 ta Tezkor Saralash (To'g'ri yoki Noto'g'ri) faktlari",
        items: {
          type: Type.OBJECT,
          properties: {
            statement: { type: Type.STRING },
            isTrue: { type: Type.BOOLEAN },
            correction: { type: Type.STRING },
          },
          required: ["statement", "isTrue", "correction"],
        },
      };
      gameReq.push("blitz");
    }

    if (gameReq.length > 0) {
      properties.games = {
        type: Type.OBJECT,
        properties: gameProps,
        required: gameReq,
      };
      required.push("games");
    }
  }

  return {
    type: Type.OBJECT,
    properties,
    required,
  };
}

function buildLessonPrompt(params: {
  topic: string;
  grade: string;
  subject: string;
  language: string;
  options: {
    slides?: boolean;
    homework?: boolean;
    methodologies?: boolean;
    quiz?: boolean;
    games?: boolean;
    gameTypes?: Record<string, boolean>;
  };
  customInstruction?: string;
}) {
  const { topic, grade, subject, language, options, customInstruction } = params;

  const requestedParts: string[] = [];
  if (options.slides) {
    requestedParts.push(
      "- TAQDIMOT SLAYDLARI (7-8 ta): 1-slayd 'cover', keyingi slaydlar 'concept', 'comparison', 'diagram', 'activity', oxirgi slayd 'summary' turida bo'lsin. Har bir slaydda aniq 3-4 ta qisqa tezis, speakerNotes (o'qituvchi nutqi) va visualDiagramHint (doskada yoki slaydda chiziladigan sxema tavsifi) bo'lsin."
    );
  }
  if (options.methodologies) {
    requestedParts.push(
      "- PEDAGOGIK METODIKALAR (4-5 ta): O'zbekiston va xalqaro ilg'or pedagogik texnologiyalardan foydalaning (masalan: 'Aqliy hujum', 'Klaster', 'Bumerang', 'BBB jadvali', 'Baliq skeleti', 'Sinkveyn', 'Insert', 'Venn diagrammasi'). Har bir metodika aynan shu mavzuga mos qadam-baqadam yo'riqnoma, o'qituvchi savoli va kutilayotgan natijani bersin."
    );
  }
  if (options.homework) {
    requestedParts.push(
      "- UYGA VAZIFALAR: 3 ta darajada ('Boshlangich', 'Orta', 'Ilgor') tabaqalashtirilgan topshiriqlar va 4 mezonli aniq baholash rubrikasi (jami 100 ballik tizimga mos yoki 25 balldan) tuzing."
    );
  }
  if (options.quiz) {
    requestedParts.push(
      "- TEST SAVOLLARI (8 ta): Har bir savolda aniq 4 ta variant (options), to'g'ri javob indeksi (0-3), qisqa ilmiy tushuntirish (explanation) va qiyinlik darajasi ('Oson', 'Orta', 'Qiyin') bo'lsin. To'g'ri javob indekslarini turlicha taqsimlang."
    );
  }
  if (options.games) {
    requestedParts.push(
      "- INTERAKTIV O'YINLAR: Krossvord so'zlari o'zaro harflar bilan kesishishi uchun unli va undosh harflarga boy, mavzuga oid 8 ta Bitta-so'zli atama tanlang (faqat bitta so'z, bo'shliqsiz va belgilarsiz, masalan: ENERGIYA, FOTOSINTEZ, QUYOSH). Pazl (6 ta mantiqiy bo'lak, har biri qisqa va aniq), Xotira juftliklari (6 ta juftlik), So'z qidiruv (7 ta toza bitta-so'zli atama), Omad charxi (8 ta qiziqarli sinf topshirig'i, 10-50 ball), Tezkor saralash (10 ta To'g'ri/Noto'g'ri faktlar)."
    );
  }

  return `
Siz tajribali metodist va zamonaviy pedagogika bo'yicha AI assistentsiz.
O'qituvchi quyidagi dars uchun materiallar yaratmoqchi:
- Mavzu: "${topic}"
- Sinf / Bosqich: "${grade || "Umumiy o'rta ta'lim"}"
- Fan: "${subject || "Mavzuga mos fan"}"
${customInstruction ? `- Qo'shimcha talab: "${customInstruction}"` : ""}

Til talabi:
${getLanguageInstruction(language || "uz")}

Quyidagi tanlangan bo'limlarni chuqur, amaliy va darsda darhol ishlatishga tayyor holda yarating:
${requestedParts.join("\n")}

Muhim: Barcha JSON maydonlarini aniq to'ldiring. Testlarda variantlar mazmunli bo'lsin. Krossvord va so'z qidiruvdagi so'zlar qat'iy ravishda bitta so'z bo'lsin (bo'shliq, tire, tinish belgilari va apostrof ishlatmang).
`.trim();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/generate-lesson", async (req, res) => {
    try {
      const { topic, grade, subject, language = "uz", options } = req.body ?? {};
      if (!topic || typeof topic !== "string" || !topic.trim()) {
        res.status(400).json({ error: "Iltimos, dars mavzusini kiriting." });
        return;
      }

      if (
        !options ||
        (!options.slides &&
          !options.homework &&
          !options.methodologies &&
          !options.quiz &&
          !options.games)
      ) {
        res.status(400).json({ error: "Kamida bitta bo'limni (ptichka) tanlang." });
        return;
      }

      const ai = getGeminiClient();
      const responseSchema = buildSectionSchemas(options);
      const prompt = buildLessonPrompt({
        topic: topic.trim(),
        grade: typeof grade === "string" ? grade.trim() : "",
        subject: typeof subject === "string" ? subject.trim() : "",
        language,
        options,
      });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: "application/json",
          responseSchema: responseSchema as never,
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);

      res.json({
        id: `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        topic: topic.trim(),
        language,
        options,
        ...parsed,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Dars materiallarini yaratishda kutilmagan xatolik yuz berdi.";
      console.error("Generate lesson error:", error);
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/regenerate-section", async (req, res) => {
    try {
      const { topic, grade, subject, language = "uz", section, gameTypes, customInstruction } =
        req.body ?? {};
      if (!topic || !section) {
        res.status(400).json({ error: "Mavzu va bo'lim nomi talab qilinadi." });
        return;
      }

      const singleOption = {
        slides: section === "slides",
        homework: section === "homework",
        methodologies: section === "methodologies",
        quiz: section === "quiz",
        games: section === "games",
        gameTypes: gameTypes || {
          crossword: true,
          puzzle: true,
          memory: true,
          wordsearch: true,
          wheel: true,
          blitz: true,
        },
      };

      const ai = getGeminiClient();
      const responseSchema = buildSectionSchemas(singleOption);
      const prompt = buildLessonPrompt({
        topic,
        grade: grade || "",
        subject: subject || "",
        language,
        options: singleOption,
        customInstruction,
      });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: "application/json",
          responseSchema: responseSchema as never,
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Bo'limni qayta yaratishda xatolik yuz berdi.";
      console.error("Regenerate section error:", error);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Muallim Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
