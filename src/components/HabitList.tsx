"use client";

import { Habit } from "@/types/habit";
import HabitItem from "./HabitItem";

interface HabitListProps {
  habits: Habit[];
  onToggle: (id: string, currentlyCompleted: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function HabitList({ habits, onToggle, onDelete }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p>No habits added yet.<br/>Start your journey!</p>
      </div>
    );
  }

  return (
    <div id="habit-list">
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
