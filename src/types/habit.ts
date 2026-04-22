export interface Habit {
  id: string;
  name: string;
  completedDates: string[];
  createdAt: string;
  streak: number;
  completedToday: boolean;
}
