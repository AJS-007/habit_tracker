"use client";

import { useEffect, useState } from "react";
import { Habit } from "@/types/habit";
import AddHabitForm from "./AddHabitForm";
import HabitList from "./HabitList";
import ProgressStats from "./ProgressStats";

const API_URL = "http://localhost:3000/habits";

export default function HabitDashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setHabits(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching habits:", err);
      setError("Failed to load habits. Is the backend running?");
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleAdd = async (name: string) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        fetchHabits();
      }
    } catch (err) {
      console.error("Error adding habit:", err);
    }
  };

  const handleToggle = async (id: string, currentlyCompleted: boolean) => {
    // Optionally implement optimistic UI update here
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
      });
      if (response.ok) {
        fetchHabits();
      }
    } catch (err) {
      console.error("Error toggling habit:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchHabits();
      }
    } catch (err) {
      console.error("Error deleting habit:", err);
    }
  };

  return (
    <main>
      <AddHabitForm onAdd={handleAdd} />
      <div id="habit-list-container">
        {error ? (
          <p className="error" style={{ color: "var(--danger)", textAlign: "center" }}>
            {error}
          </p>
        ) : (
          <>
            <ProgressStats habits={habits} />
            <HabitList habits={habits} onToggle={handleToggle} onDelete={handleDelete} />
          </>
        )}
      </div>
    </main>
  );
}
