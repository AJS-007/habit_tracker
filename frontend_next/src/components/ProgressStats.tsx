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

  const getLevel = () => {
    if (bestStreak >= 100) return { label: "👑 Legend", cls: "level-crown" };
    if (bestStreak >= 30) return { label: "💎 Master", cls: "level-diamond" };
    if (bestStreak >= 10) return { label: "⚡ Pro", cls: "level-lightning" };
    if (bestStreak >= 3) return { label: "🔥 Rising", cls: "level-fire" };
    if (bestStreak >= 1) return { label: "🌿 Starter", cls: "level-sprout" };
    return { label: "🌱 New", cls: "level-seed" };
  };

  const level = getLevel();
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="stats-container">
      <div className="stat-card">
        <span className="stat-value">{totalHabits}</span>
        <span className="stat-label">Total Habits</span>
      </div>
      <div className="stat-card">
        <span className="stat-value accent">{completionRate}%</span>
        <span className="stat-label">Done Today</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{bestStreak}</span>
        <span className="stat-label">Best Streak</span>
      </div>
      <div className={`stat-card ${level.cls}`}>
        <span className="stat-value level-value">{level.label}</span>
        <span className="stat-label">Level</span>
      </div>
    </div>
  );
}
