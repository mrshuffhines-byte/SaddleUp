export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  experienceLevel: string;
  primaryGoal: string;
  daysPerWeek: number;
  sessionLength: number;
  ownsHorse: boolean;
  horseDetails?: string;
}

export interface TrainingPlan {
  id: string;
  visibleId: string;
  visibleIdDisplay: string;
  userId: string;
  goal: string;
  generatedContent: any;
  currentPhase: number;
  currentModule: number;
}

export interface Lesson {
  id: string;
  lessonId: string;
  lessonTitle: string;
  planId: string;
  phaseNumber: number;
  moduleNumber: number;
  lessonNumber: number;
  title: string;
  content: any;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface Session {
  id: string;
  userId: string;
  lessonId: string;
  sessionDate: Date;
  duration: number;
  rating: number;
  notes?: string;
  horseNotes?: string;
}
