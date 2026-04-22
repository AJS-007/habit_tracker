"use client";

import { Habit, CompletionEntry } from "@/types/habit";
import { useState, useRef, useCallback } from "react";
import styles from "./HeatmapCalendar.module.css";

interface HeatmapCalendarProps {
  habits: Habit[];
}

export default function HeatmapCalendar({ habits }: HeatmapCalendarProps) {
  // ─── Data Logic (preserved exactly) ───
  const completionMap = new Map<string, number>();

  habits.forEach(habit => {
    habit.completedDates.forEach((entry: CompletionEntry) => {
      const date = typeof entry === 'string' ? entry : entry.date;
      completionMap.set(date, (completionMap.get(date) || 0) + 1);
    });
  });

  // Generate last 365 days
  const today = new Date();
  const days: { date: string; count: number; dayOfWeek: number }[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: completionMap.get(dateStr) || 0,
      dayOfWeek: d.getDay(),
    });
  }

  // Group into weeks (columns)
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];

  // Pad the first week if it doesn't start on Sunday
  const firstDay = days[0];
  for (let i = 0; i < firstDay.dayOfWeek; i++) {
    currentWeek.push({ date: '', count: -1, dayOfWeek: i });
  }

  days.forEach(day => {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = -1;

  weeks.forEach((week, weekIdx) => {
    const firstValidDay = week.find(d => d.date !== '');
    if (firstValidDay) {
      const month = new Date(firstValidDay.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: months[month], weekIndex: weekIdx });
        lastMonth = month;
      }
    }
  });

  const getIntensityClass = (count: number): string => {
    if (count <= 0) return styles.empty;
    if (count === 1) return styles.l1;
    if (count === 2) return styles.l2;
    if (count <= 4) return styles.l3;
    return styles.l4;
  };

  const totalActiveDays = days.filter(d => d.count > 0).length;

  // ─── Tooltip State ───
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: string;
    count: number;
  }>({ visible: false, x: 0, y: 0, date: '', count: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCellMouseEnter = useCallback((e: React.MouseEvent, day: { date: string; count: number }) => {
    if (!day.date) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      date: day.date,
      count: day.count,
    });
  }, []);

  const handleCellMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const formatTooltipDate = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ─── Render ───
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.headerInfo}>
        <div className={styles.stats}>
          <span className={styles.statNumber}>{totalActiveDays}</span>
          <span className={styles.statLabel}>days active this year</span>
        </div>
      </div>

      {/* Scrollable Heatmap */}
      <div className={styles.scrollContainer} ref={scrollRef}>
        <div className={styles.container}>
          {/* Month Labels */}
          <div className={styles.months}>
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className={styles.month}
                style={{ gridColumnStart: m.weekIndex + 1 }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Day Labels + Grid */}
          <div className={styles.gridWrapper}>
            <div className={styles.dayLabels}>
              <span></span>
              <span>Mon</span>
              <span></span>
              <span>Wed</span>
              <span></span>
              <span>Fri</span>
              <span></span>
            </div>

            <div className={styles.grid}>
              {weeks.map((week, wi) => (
                <div key={wi} className={styles.week}>
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={
                        day.count >= 0
                          ? `${styles.cell} ${getIntensityClass(day.count)}`
                          : styles.pad
                      }
                      data-count={day.count}
                      style={{ animationDelay: `${wi * 8}ms` }}
                      onMouseEnter={(e) => handleCellMouseEnter(e, day)}
                      onMouseLeave={handleCellMouseLeave}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.footer}>
        <div className={styles.legend}>
          <span className={styles.legendLabel}>Less</span>
          <div className={`${styles.legendCell} ${styles.empty}`} />
          <div className={`${styles.legendCell} ${styles.l1}`} />
          <div className={`${styles.legendCell} ${styles.l2}`} />
          <div className={`${styles.legendCell} ${styles.l3}`} />
          <div className={`${styles.legendCell} ${styles.l4}`} />
          <span className={styles.legendLabel}>More</span>
        </div>
      </div>

      {/* Custom Tooltip */}
      {tooltip.visible && (
        <div
          className={`${styles.tooltip} ${tooltip.visible ? styles.tooltipVisible : ''}`}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <span className={styles.tooltipCount}>
            {tooltip.count} habit{tooltip.count !== 1 ? 's' : ''}
          </span>
          <span className={styles.tooltipDate}>
            {formatTooltipDate(tooltip.date)}
          </span>
        </div>
      )}
    </div>
  );
}
