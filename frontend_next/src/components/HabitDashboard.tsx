"use client";

import { useEffect, useState, useCallback } from "react";
import { Habit } from "@/types/habit";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AddHabitForm from "./AddHabitForm";
import HabitList from "./HabitList";
import ProgressStats from "./ProgressStats";
import CategoryFilter from "./CategoryFilter";
import ReminderSettings from "./ReminderSettings";

const API_URL = "http://localhost:3000/habits";

export default function HabitDashboard() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }), [token]);

  const fetchHabits = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(API_URL, {
        headers: authHeaders(),
      });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setHabits(data);
      setError(null);
      setBackendStatus("online");
    } catch (err) {
      console.error("Error fetching habits:", err);
      setError("Failed to load habits. Is the backend running?");
      setBackendStatus("offline");
    }
  }, [token, authHeaders, router]);

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token, fetchHabits]);

  // Smart reminder check
  useEffect(() => {
    const checkReminder = () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const saved = localStorage.getItem("habitflow-reminder");
      if (!saved) return;

      const { time, enabled } = JSON.parse(saved);
      if (!enabled) return;

      const now = new Date();
      const [hours, minutes] = time.split(":").map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // Check if we're within 1 minute of the reminder time
      const diff = Math.abs(now.getTime() - reminderTime.getTime());
      if (diff < 60000) {
        const incompleteCount = habits.filter(h => !h.completedToday).length;
        if (incompleteCount > 0) {
          const lastNotified = localStorage.getItem("habitflow-last-notified");
          const todayStr = now.toISOString().split("T")[0];
          if (lastNotified !== todayStr) {
            new Notification("🔔 HabitFlow Reminder", {
              body: `You have ${incompleteCount} habit${incompleteCount > 1 ? "s" : ""} left to complete today!`,
              icon: "/icon-192.png",
            });
            localStorage.setItem("habitflow-last-notified", todayStr);
          }
        }
      }
    };

    const interval = setInterval(checkReminder, 30000);
    return () => clearInterval(interval);
  }, [habits]);

  const handleAdd = async (name: string, category: string, frequencyType?: 'daily' | 'weekly', targetDaysCount?: number) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, category, frequencyType, targetDaysCount }),
      });
      if (response.ok) {
        fetchHabits();
      }
    } catch (err) {
      console.error("Error adding habit:", err);
    }
  };

  const handleToggle = async (id: string, currentlyCompleted: boolean, note?: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ note: note || "" }),
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
        headers: authHeaders(),
      });
      if (response.ok) {
        fetchHabits();
      }
    } catch (err) {
      console.error("Error deleting habit:", err);
    }
  };

  const handleUpdate = async (id: string, updates: { name?: string; category?: string }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        fetchHabits();
      }
    } catch (err) {
      console.error("Error updating habit:", err);
    }
  };

  // Show nothing while loading auth
  if (isLoading) {
    return (
      <main style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </main>
    );
  }

  // Derive unique categories from habits
  const categories = [...new Set(habits.map(h => h.category))].sort();

  // Filter habits by active category
  const filteredHabits = activeCategory === "All"
    ? habits
    : habits.filter(h => h.category === activeCategory);

  return (
    <main>
      <div className="system-status" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
        <span style={{ 
          fontSize: "0.75rem", 
          padding: "0.2rem 0.6rem", 
          borderRadius: "1rem", 
          backgroundColor: backendStatus === "online" ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
          color: backendStatus === "online" ? "var(--success)" : "var(--danger)",
          border: `1px solid ${backendStatus === "online" ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)"}`
        }}>
          ● Backend: {backendStatus}
        </span>
      </div>
      <AddHabitForm onAdd={handleAdd} />

      <div id="habit-list-container">
        {error ? (
          <p className="error" style={{ color: "var(--danger)", textAlign: "center" }}>
            {error}
          </p>
        ) : (
          <>
            <ProgressStats habits={habits} />

            {categories.length > 1 && (
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            )}

            <HabitList habits={filteredHabits} onToggle={handleToggle} onDelete={handleDelete} onUpdate={handleUpdate} />

            <ReminderSettings />
          </>
        )}
      </div>
    </main>
  );
}
