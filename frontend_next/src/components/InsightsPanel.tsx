"use client";

import { HabitInsights } from "@/types/habit";

interface InsightsPanelProps {
  insights: HabitInsights | null;
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  if (!insights) return null;

  const getTierFromScore = (score: number): string => {
    if (score >= 80) return "Elite";
    if (score >= 60) return "Strong";
    if (score >= 40) return "Growing";
    if (score >= 20) return "Beginner";
    return "Starter";
  };

  return (
    <div className="insights-panel">
      <div className="insights-header">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
          <line x1="9" y1="21" x2="15" y2="21" />
          <line x1="10" y1="24" x2="14" y2="24" />
        </svg>
        <h3>AI Coach Insights</h3>
        <span className="insights-tier">{getTierFromScore(insights.consistencyScore)}</span>
      </div>

      <div className="insights-encouragement">
        <p>{insights.encouragement}</p>
      </div>

      <div className="insights-metrics">
        <div className="insight-metric">
          <div className="insight-metric-bar">
            <div
              className="insight-metric-fill"
              style={{ width: `${insights.consistencyScore}%` }}
            />
          </div>
          <span className="insight-metric-label">
            Consistency: <strong>{insights.consistencyScore}%</strong>
          </span>
        </div>
      </div>

      <div className="insights-days">
        {insights.bestDay && (
          <div className="insight-day best">
            <span className="insight-day-emoji">🏆</span>
            <div>
              <span className="insight-day-label">Best Day</span>
              <span className="insight-day-value">{insights.bestDay.day} ({insights.bestDay.rate}%)</span>
            </div>
          </div>
        )}
        {insights.worstDay && (
          <div className="insight-day worst">
            <span className="insight-day-emoji">📉</span>
            <div>
              <span className="insight-day-label">Needs Work</span>
              <span className="insight-day-value">{insights.worstDay.day} ({insights.worstDay.rate}%)</span>
            </div>
          </div>
        )}
      </div>

      {insights.dayRates && insights.dayRates.length > 0 && (
        <div className="insights-chart">
          <span className="insights-chart-title">Weekly Pattern</span>
          <div className="insights-bars">
            {insights.dayRates.map((dr) => (
              <div key={dr.day} className="insights-bar-col">
                <div className="insights-bar-track">
                  <div
                    className="insights-bar-fill"
                    style={{ height: `${dr.rate}%` }}
                  />
                </div>
                <span className="insights-bar-label">{dr.day.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.correlations.length > 0 && (
        <div className="insights-correlations">
          <span className="insights-chart-title">Habit Synergies</span>
          {insights.correlations.map((c, i) => (
            <div key={i} className="correlation-row">
              <span className="correlation-pair">{c.habitA} ↔ {c.habitB}</span>
              <span className="correlation-pct">{c.correlation}% overlap</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
