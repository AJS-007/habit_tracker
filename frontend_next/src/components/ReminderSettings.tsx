"use client";

import { useState, useEffect } from "react";

export default function ReminderSettings() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    const saved = localStorage.getItem("habitflow-reminder");
    if (saved) {
      const parsed = JSON.parse(saved);
      setReminderTime(parsed.time || "20:00");
      setEnabled(parsed.enabled || false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("habitflow-reminder", JSON.stringify({
      time: reminderTime,
      enabled,
    }));
  }, [reminderTime, enabled]);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setEnabled(true);
      }
    }
  };

  return (
    <div className="reminder-section">
      <button
        className="heatmap-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>Smart Reminders</span>
        <span className="heatmap-summary">{enabled ? `Active at ${reminderTime}` : 'Off'}</span>
        <svg className={`chevron ${isExpanded ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="reminder-content">
          {permission !== "granted" ? (
            <div className="reminder-permission">
              <p>Enable browser notifications to get daily reminders.</p>
              <button type="button" className="reminder-enable-btn" onClick={requestPermission}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                </svg>
                Enable Notifications
              </button>
            </div>
          ) : (
            <div className="reminder-controls">
              <div className="reminder-row">
                <label htmlFor="reminder-time">Remind me at:</label>
                <input
                  type="time"
                  id="reminder-time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="reminder-time-input"
                />
              </div>
              <div className="reminder-row">
                <label htmlFor="reminder-toggle">Notifications</label>
                <button
                  type="button"
                  id="reminder-toggle"
                  className={`toggle-switch ${enabled ? 'on' : ''}`}
                  onClick={() => setEnabled(!enabled)}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
              {enabled && (
                <p className="reminder-status">
                  ✅ You&apos;ll be reminded at <strong>{reminderTime}</strong> if habits are incomplete.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
