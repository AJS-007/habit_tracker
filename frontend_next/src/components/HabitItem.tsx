"use client";

import { Habit, CompletionEntry } from "@/types/habit";
import StreakEvolution from "./StreakEvolution";
import { useState } from "react";

interface HabitItemProps {
  habit: Habit;
  onToggle: (id: string, currentlyCompleted: boolean, note?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: { name?: string; category?: string; frequencyType?: string; targetDaysCount?: number }) => Promise<void>;
}

export default function HabitItem({ habit, onToggle, onDelete, onUpdate }: HabitItemProps) {
  const [noteText, setNoteText] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(habit.name || "");
  const [editedCategory, setEditedCategory] = useState(habit.category || "General");
  const [editedFreq, setEditedFreq] = useState(habit.frequencyType || "daily");
  const [editedTarget, setEditedTarget] = useState(habit.targetDaysCount || 1);

  // Get tier class for milestone border glow
  const getTierClass = () => {
    if (habit.streak >= 100) return "milestone-crown";
    if (habit.streak >= 30) return "milestone-diamond";
    if (habit.streak >= 10) return "milestone-lightning";
    if (habit.streak >= 3) return "milestone-fire";
    return "";
  };

  // Generate the last 7 dates for the mini calendar
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const entry = habit.completedDates.find((e: CompletionEntry) =>
      (typeof e === 'string' ? e : e.date) === dateStr
    );
    const done = !!entry;
    const note = entry && typeof entry !== 'string' ? entry.note : '';

    return {
      date: dateStr,
      isToday: i === 6,
      done,
      note: note || '',
    };
  });

  const handleToggle = () => {
    if (!habit.completedToday) {
      setShowNote(true);
    } else {
      onToggle(habit.id, habit.completedToday);
    }
  };

  const handleNoteSubmit = () => {
    onToggle(habit.id, habit.completedToday, noteText);
    setNoteText("");
    setShowNote(false);
  };

  const handleNoteSkip = () => {
    onToggle(habit.id, habit.completedToday, "");
    setNoteText("");
    setShowNote(false);
  };

  const handleUpdate = async () => {
    if (editedName.trim() === "") return;
    await onUpdate(habit.id, { 
      name: editedName, 
      category: editedCategory,
      frequencyType: editedFreq,
      targetDaysCount: editedTarget
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(habit.name || "");
    setEditedCategory(habit.category || "General");
    setEditedFreq(habit.frequencyType || "daily");
    setEditedTarget(habit.targetDaysCount || 1);
    setIsEditing(false);
  };

  const isWeeklyTargetMet = habit.frequencyType === 'weekly' && habit.weeklyProgress >= habit.targetDaysCount;

  return (
    <div className={`habit-item ${getTierClass()} ${isEditing ? 'editing' : ''} ${isWeeklyTargetMet ? 'target-met' : ''}`}>
      <div className="habit-main-col">
        {isEditing ? (
          <div className="habit-edit-form">
            <input
              type="text"
              className="edit-name-input"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Habit name"
              autoFocus
            />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <input
                type="text"
                className="edit-category-input"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                placeholder="Category"
                style={{ flex: 1 }}
              />
              <select 
                value={editedFreq} 
                onChange={(e) => setEditedFreq(e.target.value as 'daily' | 'weekly')}
                className="edit-freq-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              {editedFreq === 'weekly' && (
                <input 
                  type="number" 
                  min="1" max="7" 
                  value={editedTarget} 
                  onChange={(e) => setEditedTarget(parseInt(e.target.value))}
                  style={{ width: "40px", textAlign: "center" }}
                />
              )}
            </div>
            <div className="edit-actions" style={{ marginTop: "0.5rem" }}>
              <button onClick={handleUpdate} className="save-edit-btn">Save</button>
              <button onClick={handleCancelEdit} className="cancel-edit-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="habit-header">
              <span className="habit-name">{habit.name}</span>
              <span className="category-tag">{habit.category}</span>
              {habit.frequencyType === 'weekly' && (
                <span className={`target-tag ${isWeeklyTargetMet ? 'met' : ''}`} style={{ 
                  fontSize: "0.7rem", 
                  padding: "0.1rem 0.4rem", 
                  borderRadius: "4px", 
                  backgroundColor: isWeeklyTargetMet ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.1)",
                  color: isWeeklyTargetMet ? "#10b981" : "var(--text-secondary)",
                  marginLeft: "0.5rem",
                  fontWeight: "bold"
                }}>
                  🎯 {habit.weeklyProgress}/{habit.targetDaysCount}
                </span>
              )}
            </div>
            <div className="habit-meta-row">
              <span className={`streak-badge ${habit.streak >= (habit.frequencyType === 'weekly' ? 1 : 3) ? 'hot' : ''}`}>
                <StreakEvolution streak={habit.streak} />
                {habit.streak} {habit.frequencyType === 'weekly' ? `week${habit.streak !== 1 ? 's' : ''}` : `day${habit.streak !== 1 ? 's' : ''}`}
              </span>
              {habit.shields > 0 && (
                <span className="shield-badge" title={`${habit.shields} shield${habit.shields !== 1 ? 's' : ''} available`}>
                  🛡️ {habit.shields}
                </span>
              )}
            </div>
            <div className="calendar-grid">
              {last7Days.map(day => (
                <div
                  key={day.date}
                  className={`day-circle ${day.done ? 'done' : ''} ${day.isToday ? 'today' : ''} ${day.note ? 'has-note' : ''}`}
                  title={day.date + (day.done ? ' ✓' : '') + (day.note ? ` — "${day.note}"` : '')}
                />
              ))}
            </div>
          </>
        )}
        {showNote && !isEditing && (
          <div className="note-input-area">
            <input
              type="text"
              className="note-input"
              placeholder="Quick note (optional)..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNoteSubmit()}
              autoFocus
            />
            <div className="note-actions">
              <button type="button" className="note-save-btn" onClick={handleNoteSubmit}>Save</button>
              <button type="button" className="note-skip-btn" onClick={handleNoteSkip}>Skip</button>
            </div>
          </div>
        )}
      </div>
      <div className="habit-actions">
        {!isEditing && (
          <>
            <button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
              title="Edit habit"
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "4px" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              className={`toggle-btn ${habit.completedToday ? "done" : ""} ${isWeeklyTargetMet && !habit.completedToday ? "pulsing" : ""}`}
              onClick={handleToggle}
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
          </>
        )}
      </div>
    </div>
  );
}
