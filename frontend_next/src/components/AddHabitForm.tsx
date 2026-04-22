"use client";

import { useState } from "react";

const PRESET_CATEGORIES = ["General", "Health", "Productivity", "Mindfulness", "Fitness", "Learning", "Creative"];

interface AddHabitFormProps {
  onAdd: (name: string, category: string, frequencyType?: 'daily' | 'weekly', targetDaysCount?: number) => Promise<void>;
}

export default function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly'>('daily');
  const [targetDaysCount, setTargetDaysCount] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const finalCategory = showCustom ? (customCategory.trim() || "General") : category;
    await onAdd(trimmed, finalCategory, frequencyType, targetDaysCount);
    setName("");
  };

  return (
    <div className="glass-panel add-habit-card">
      <form id="add-habit-form" onSubmit={handleSubmit}>
        <div className="form-row">
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
        </div>
        <div className="habit-options-row" style={{ display: "flex", gap: "1rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
          <div className="category-group" style={{ flex: "1", minWidth: "150px" }}>
            {!showCustom ? (
              <select
                className="category-select"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                value={category}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setShowCustom(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
              >
                {PRESET_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">+ Custom...</option>
              </select>
            ) : (
              <div className="custom-category-row" style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  className="custom-category-input"
                  style={{ flex: "1", padding: "0.5rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  placeholder="Custom category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  autoFocus
                />
                <button type="button" className="custom-category-back" onClick={() => setShowCustom(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                  ←
                </button>
              </div>
            )}
          </div>

          <div className="frequency-group" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select 
              value={frequencyType} 
              onChange={(e) => setFrequencyType(e.target.value as 'daily' | 'weekly')}
              style={{ padding: "0.5rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            
            {frequencyType === 'weekly' && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input 
                  type="number" 
                  min="1" 
                  max="7" 
                  value={targetDaysCount} 
                  onChange={(e) => setTargetDaysCount(parseInt(e.target.value))}
                  style={{ width: "45px", padding: "0.5rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", textAlign: "center" }}
                />
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>times/week</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
