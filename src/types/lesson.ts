export type LessonLanguage = 'uz' | 'ru' | 'en';

export interface GameSelectionOptions {
  crossword: boolean;
  puzzle: boolean;
  memory: boolean;
  wordsearch: boolean;
  wheel: boolean;
  blitz: boolean;
}

export interface GenerationOptions {
  slides: boolean;
  homework: boolean;
  methodologies: boolean;
  quiz: boolean;
  games: boolean;
  gameTypes: GameSelectionOptions;
}

export interface LessonMeta {
  title: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  objective: string;
  summary: string;
}

export type SlideLayoutType =
  | 'cover'
  | 'concept'
  | 'comparison'
  | 'diagram'
  | 'activity'
  | 'summary';

export interface SlideItem {
  slideNumber: number;
  layoutType: SlideLayoutType;
  title: string;
  subtitle: string;
  bulletPoints: string[];
  keyTakeaway: string;
  speakerNotes: string;
  visualDiagramHint: string;
}

export interface HomeworkTier {
  level: string;
  title: string;
  estimatedMinutes: number;
  tasks: string[];
  creativeBonus: string;
}

export interface RubricCriterion {
  criterion: string;
  maxPoints: number;
  description: string;
}

export interface HomeworkData {
  overview: string;
  tiers: HomeworkTier[];
  gradingRubric: RubricCriterion[];
}

export interface MethodologyItem {
  methodName: string;
  stage: string;
  durationMinutes: number;
  goal: string;
  steps: string[];
  teacherPrompt: string;
  expectedOutcome: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
}

export interface CrosswordEntry {
  word: string;
  clue: string;
}

export interface PuzzlePieceData {
  id: string;
  pieceTitle: string;
  promptSide: string;
  matchSide: string;
  hint: string;
}

export interface MemoryPairData {
  id: string;
  term: string;
  match: string;
}

export interface WheelChallengeData {
  label: string;
  challenge: string;
  points: number;
  answerHint: string;
}

export interface BlitzSortItem {
  statement: string;
  isTrue: boolean;
  correction: string;
}

export interface GamesData {
  crossword?: CrosswordEntry[];
  puzzle?: PuzzlePieceData[];
  memory?: MemoryPairData[];
  wordsearch?: string[];
  wheel?: WheelChallengeData[];
  blitz?: BlitzSortItem[];
}

export interface GeneratedLessonPack {
  id: string;
  createdAt: string;
  topic: string;
  language: LessonLanguage;
  options: GenerationOptions;
  lessonMeta: LessonMeta;
  slides?: SlideItem[];
  homework?: HomeworkData;
  methodologies?: MethodologyItem[];
  quiz?: QuizQuestion[];
  games?: GamesData;
}
