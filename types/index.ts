export type Level = "beginner" | "intermediate" | "advanced";
export type SpeechRate = "slow" | "normal" | "fast";

export interface Settings {
  level: Level;
  speechRate: SpeechRate;
  showPhonetics: boolean;
  autoPlay: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  level: "intermediate",
  speechRate: "normal",
  showPhonetics: true,
  autoPlay: true,
};

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface VocabularyWord {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
}

export interface TutorResponse {
  message: string;
  corrections: Correction[];
  vocabulary: VocabularyWord | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tutorData?: TutorResponse;
  timestamp: Date;
}

export interface Scenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  starterMessage: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "job-interview",
    title: "Job Interview Practice",
    icon: "💼",
    description: "Practice answering common interview questions confidently",
    starterMessage:
      "Welcome to your mock interview! I'll be playing the role of an interviewer today. Let's start with a classic: Can you tell me a little about yourself and why you're interested in this position?",
  },
  {
    id: "restaurant",
    title: "Ordering at a Restaurant",
    icon: "🍽️",
    description: "Practice ordering food, asking questions, and making requests",
    starterMessage:
      "Good evening! Welcome to The English Kitchen. My name is Alex and I'll be your server tonight. Can I start you off with something to drink, or are you ready to hear our specials?",
  },
  {
    id: "small-talk",
    title: "Small Talk with a Coworker",
    icon: "☕",
    description: "Practice casual conversation and building rapport",
    starterMessage:
      "Hey! I noticed you in the break room — I don't think we've officially met yet. I'm Jamie from the marketing team. How long have you been with the company?",
  },
  {
    id: "weekend",
    title: "Describing Your Weekend",
    icon: "🌅",
    description: "Practice storytelling and using past tense naturally",
    starterMessage:
      "Hey, good to see you! It's Monday already — the weekend went by so fast. What did you get up to? Did you do anything fun or just relax at home?",
  },
  {
    id: "travel",
    title: "Travel & Directions",
    icon: "✈️",
    description: "Practice asking for directions and discussing travel plans",
    starterMessage:
      "Oh, you look a bit lost! Can I help you find something? I know this area pretty well. Also, are you visiting from out of town? Where are you headed?",
  },
  {
    id: "movie-book",
    title: "Discussing a Movie or Book",
    icon: "🎬",
    description: "Practice expressing opinions and recommendations",
    starterMessage:
      "I just finished watching an amazing film last night and I can't stop thinking about it! Have you seen or read anything good recently? I'd love to hear your recommendations!",
  },
];

export interface SessionStats {
  wordsSpoken: number;
  correctionsReceived: number;
  startTime: Date;
}
