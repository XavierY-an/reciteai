
export enum AppMode {
  LOGIN = 'LOGIN',
  INPUT = 'INPUT',
  ARTICLE_LIST = 'ARTICLE_LIST',
  STUDY = 'STUDY',
  RECITE = 'RECITE',
  PROFILE = 'PROFILE',
  PAYMENT = 'PAYMENT',
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isPro?: boolean;
}

export type SegmentRole = 
  | 'SUBJECT'        // The actor
  | 'VERB'           // The action
  | 'OBJECT'         // The receiver or predicative
  | 'PREP_PHRASE'    // Prepositional phrases
  | 'CLAUSE'         // Dependent clauses (Relative, Adverbial)
  | 'NON_FINITE'     // Participles, Infinitives
  | 'PARENTHETICAL'  // Connectors, Insertions
  | 'OTHER';         // Fallback

export interface Segment {
  id: string;
  text: string;
  translation: string; // Chinese meaning
  isHidden: boolean;
  role: SegmentRole;
}

export interface StudySection {
  id: string;
  title: string;
  translation: string; // Full sentence/section translation
  theme: 'blue' | 'emerald' | 'violet' | 'amber';
  segments: Segment[];
}

export interface WordResult {
  word: string;
  status: 'correct' | 'missed' | 'wrong' | 'extra';
  correctedWord?: string;
}

export interface ReciteResult {
  score: number;
  feedback: string;
  detailedAnalysis: WordResult[];
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  mimeType: string;
}
