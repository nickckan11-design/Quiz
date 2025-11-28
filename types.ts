export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_BLANK = 'FILL_IN_BLANK'
}

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  questionText: string;
  options?: string[]; // Only for Multiple Choice
  correctAnswer: string;
  explanation: string;
}

export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export type UserAnswers = Record<number, string>;

export interface QuizSession {
  id: string; // Unique UUID
  timestamp: number;
  quizData: QuizData;
  userAnswers: UserAnswers;
  unsureQuestionIds: number[]; // IDs of questions marked as unsure
  isCompleted: boolean;
  score: number;
}

export enum AppState {
  DASHBOARD = 'DASHBOARD',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS',
  MISTAKE_BOOK = 'MISTAKE_BOOK'
}
