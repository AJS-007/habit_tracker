"use client";

import { Habit } from "@/types/habit";

interface ProgressStatsProps {
  habits: Habit[];
}

export default function ProgressStats({ habits }: ProgressStatsProps) {
  const totalHabits = habits.length;
  
  const completedToday = habits.filter(h => h.completedToday).length;
  
  const bestStreak = habits.length > 0 
    ? Math.max(...habits.map(h => h.streak))
    : 0;

  return (
    <div className="stats-container">
      <div className="stat-card">
        <span className="stat-value">{totalHabits}</span>
        <span className="stat-label">Total Habits</span>
      </div>
      <div className="stat-card">
        <span className="stat-value accent">{completedToday}</span>
        <span className="stat-label">Done Today</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{bestStreak} 🔥</span>
        <span className="stat-label">Best Streak</span>
      </div>
    </div>
  );
}
