"use client";

import HabitDashboard from "@/components/HabitDashboard";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return null; // Let HabitDashboard handle redirect

  return (
    <div id="app">
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div className="user-profile" style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <div style={{ 
            width: "32px", 
            height: "32px", 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: "bold",
            color: "white"
          }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{user?.name}</span>
          <button 
            onClick={logout}
            style={{ 
              background: "transparent", 
              border: "1px solid rgba(244, 63, 94, 0.2)", 
              color: "var(--danger)", 
              fontSize: "0.75rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              cursor: "pointer",
              marginLeft: "0.5rem"
            }}
          >
            Logout
          </button>
        </div>
        <Link href="/stats" style={{ color: "#a78bfa", fontSize: "0.95rem", fontWeight: 600 }}>
          📊 View Stats →
        </Link>
      </nav>

      <header>
        <h1>Habit<span>Flow</span></h1>
        <p>Master your routine, one day at a time.</p>
      </header>

      <HabitDashboard />

      <footer>
        <p>&copy; 2026 HabitFlow. Built with Next.js &amp; Node.js.</p>
      </footer>
    </div>
  );
}
