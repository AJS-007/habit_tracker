"use client";

import { Habit } from "@/types/habit";

interface HabitItemProps {
  habit: Habit;
  onToggle: (id: string, currentlyCompleted: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function HabitItem({ habit, onToggle, onDelete }: HabitItemProps) {
  // Generate the last 7 dates for the mini calendar
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      isToday: i === 6,
      done: habit.completedDates.includes(dateStr)
    };
  });

  return (
    <div className="habit-item">
      <div className="habit-main-col">
        <div className="habit-header">
           <span className="habit-name">{habit.name}</span>
           <span className={`streak-badge ${habit.streak >= 3 ? 'hot' : ''}`}>
             {habit.streak} day{habit.streak !== 1 ? 's' : ''}
             <svg className={`flame-icon ${habit.streak >= 3 ? 'animate-pulse' : ''}`} viewBox="0 0 24 24">
               <path d="M17.5 10.5C15 8 14.5 4 14.5 4C14.5 4 13.5 6 11.5 6C9 6 8.5 2 8.5 2C8.5 2 7 5 7 8C7 11 9.5 13.5 9.5 13.5C9.5 13.5 8 12.5 8 12.5C6 14.5 5.5 18 8.5 21C11.5 24 16.5 22.5 18.5 18C20 14.5 17.5 10.5 17.5 10.5Z" />
             </svg>
           </span>
        </div>
        <div className="calendar-grid">
           {last7Days.map(day => (
             <div 
               key={day.date} 
               className={`day-circle ${day.done ? 'done' : ''} ${day.isToday ? 'today' : ''}`}
               title={day.date + (day.done ? ' (Done)' : '')}
             />
           ))}
        </div>
      </div>
      <div className="habit-actions">
        <button
          className={`toggle-btn ${habit.completedToday ? "done" : ""}`}
          onClick={() => onToggle(habit.id, habit.completedToday)}
          title={habit.completedToday ? "Mark as undone" : "Mark as done"}
        >
          {habit.completedToday ? (
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
               <polyline points="20 6 9 17 4 12" />
             </svg>
          ) : (
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
               <circle cx="12" cy="12" r="10" />
             </svg>
          )}
        </button>
        <button
          className="delete-btn"
          onClick={() => {
            if (confirm("Are you sure you want to delete this habit?")) {
              onDelete(habit.id);
            }
          }}
          title="Delete habit"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
