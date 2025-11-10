export type LearningStyle = 'video' | 'articles' | 'practice' | 'mixed';

export interface UserInput {
  currentSkills: string;
  targetRole: string;
  timePerWeek: number;
  learningStyle: LearningStyle;
}

export interface Resource {
  type: 'video' | 'article' | 'docs' | 'course' | 'interactive' | 'project_idea';
  title: string;
  url: string;
}

export interface WeeklyPlan {
  week: number;
  topic: string;
  objectives: string[];
  resources: Resource[];
  project: {
    title: string;
    description: string;
  };
}

export interface Roadmap {
  title: string;
  totalWeeks: number;
  summary: string;
  weeklyPlans: WeeklyPlan[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  topic: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface SkillAssessmentResult {
  score: number;
  total: number;
  summary: string;
}
