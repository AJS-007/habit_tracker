"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Habit, HabitInsights } from "@/types/habit";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import InsightsPanel from "@/components/InsightsPanel";

export default function StatsPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [insights, setInsights] = useState<HabitInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch("http://localhost:3000/habits", {
        signal: controller.signal,
        headers: authHeaders(),
      });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch habits");
      const data = await response.json();
      setHabits(data);
    } catch {
      setError("Could not load habit data. Is the backend running?");
    } finally {
      clearTimeout(timeout);
    }
  }, [authHeaders, router]);

  const fetchInsights = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch("http://localhost:3000/habits/insights", {
        signal: controller.signal,
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch insights");
      const data = await response.json();
      setInsights(data);
    } catch {
      console.error("Insights fetch failed");
    } finally {
      clearTimeout(timeout);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchHabits(), fetchInsights()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, fetchHabits, fetchInsights]);

  if (isLoading || loading) {
    return (
      <div id="app" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <p style={{ color: "#94a3b8" }}>Loading your progress...</p>
      </div>
    );
  }

  return (
    <div id="app">
      {/* Simple text nav — top right */}
      <nav style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Link href="/" style={{ color: "#a78bfa", fontSize: "0.95rem", fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>
      </nav>

      <header>
        <h1 style={{ fontSize: "2.5rem" }}>
          Performance <span>&amp;</span> Insights
        </h1>
        <p style={{ color: "#94a3b8" }}>A deep dive into your consistency and habit trends.</p>
      </header>

      {error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "rgba(244, 63, 94, 0.1)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          borderRadius: "12px",
          marginBottom: "2rem",
          color: "#f43f5e"
        }}>
          {error}
        </div>
      )}

      {habits.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <h2>No data yet!</h2>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
            Complete some habits on the dashboard to see your stats here.
          </p>
          <Link href="/" style={{
            display: "inline-block",
            marginTop: "1.5rem",
            padding: "0.6rem 1.5rem",
            backgroundColor: "#8b5cf6",
            color: "white",
            borderRadius: "8px",
            fontWeight: 600
          }}>
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <main style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section className="glass-panel" style={{ padding: "1.5rem", borderRadius: "16px" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
              📅 Yearly Activity
            </h2>
            <HeatmapCalendar habits={habits} />
          </section>

          <section className="glass-panel" style={{ padding: "1.5rem", borderRadius: "16px" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
              🧠 AI Consistency Analysis
            </h2>
            <InsightsPanel insights={insights} />
          </section>
        </main>
      )}
    </div>
  );
}