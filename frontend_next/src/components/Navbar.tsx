"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Don't show navbar on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="glass-nav" style={{ border: "1px solid rgba(139, 92, 246, 0.15)" }}>
      <div className="nav-content" style={{ backgroundColor: "rgba(15, 23, 42, 0.9)" }}>
        <Link href="/" className="nav-logo" style={{ color: "white", fontWeight: "bold" }}>
          Habit<span style={{ color: "var(--primary)" }}>Flow</span>
        </Link>
        
        <div className="nav-links">
          <Link 
            href="/" 
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Dashboard
          </Link>
          <Link 
            href="/stats" 
            className={`nav-link ${pathname === "/stats" ? "active" : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Stats
          </Link>

          {isAuthenticated && (
            <div className="nav-user">
              <span className="nav-user-name">
                {user?.name}
              </span>
              <button 
                onClick={logout} 
                className="nav-logout-btn"
                title="Sign out"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
