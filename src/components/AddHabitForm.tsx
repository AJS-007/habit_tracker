"use client";

import { useState } from "react";

interface AddHabitFormProps {
  onAdd: (name: string) => Promise<void>;
}

export default function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    await onAdd(trimmed);
    setName("");
  };

  return (
    <div className="glass-panel add-habit-card">
      <form id="add-habit-form" onSubmit={handleSubmit}>
        <input
          type="text"
          id="habit-name"
          placeholder="What's your new habit?"
          required
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">
          <span>Add</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </form>
    </div>
  );
}
