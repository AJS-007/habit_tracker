export interface CompletionEntry {
  date: string;
  note?: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequencyType: 'daily' | 'weekly';
  targetDaysCount: number;
  weeklyProgress: number;
  completedDates: CompletionEntry[];
  createdAt: string;
  streak: number;
  shields: number;
  completedToday: boolean;
}

export interface HabitInsights {
  consistencyScore: number;
  bestDay: { day: string; rate: number } | null;
  worstDay: { day: string; rate: number } | null;
  correlations: { habitA: string; habitB: string; correlation: number }[];
  encouragement: string;
  totalCompletions: number;
  dayRates: { day: string; rate: number }[];
}
