const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// --- Helper Functions ---

/**
 * Get today's date as a YYYY-MM-DD string.
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate the current streak for a habit.
 * Supports shield-protected streaks: if a 1-day gap exists
 * and shields > 0, the gap is bridged and a shield is consumed.
 * Returns { streak, shieldsUsed }
 */
/**
 * Calculate the current streak for a habit.
 * Supports:
 * - 'daily': consecutive days, with optional shields.
 * - 'weekly': consecutive weeks where target_days_count is met.
 */
function calculateStreak(dateStrings, availableShields = 0, frequency = 'daily', target = 1) {
  if (dateStrings.length === 0) return { streak: 0, shieldsUsed: 0 };

  const sorted = [...dateStrings].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date(getTodayDate());

  if (frequency === 'daily') {
    const latestCompleted = new Date(sorted[0]);
    const diffDays = Math.floor((today - latestCompleted) / (1000 * 60 * 60 * 24));

    let shieldsRemaining = availableShields;
    let shieldsUsed = 0;

    if (diffDays > 1) {
      const gapDays = diffDays - 1;
      if (gapDays <= shieldsRemaining) {
        shieldsUsed += gapDays;
        shieldsRemaining -= gapDays;
      } else {
        return { streak: 0, shieldsUsed: 0 };
      }
    }

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const current = new Date(sorted[i]);
      const previous = new Date(sorted[i - 1]);
      const gap = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

      if (gap === 1) {
        streak++;
      } else if (gap === 2 && shieldsRemaining > 0) {
        streak++;
        shieldsUsed++;
        shieldsRemaining--;
      } else {
        break;
      }
    }
    return { streak, shieldsUsed };
  } else {
    // Weekly Logic
    // Group completions by week (Mon-Sun)
    const completionsByWeek = {};
    sorted.forEach(dateStr => {
      const d = new Date(dateStr);
      const day = d.getDay() || 7; // 1 (Mon) - 7 (Sun)
      const mon = new Date(d);
      mon.setDate(d.getDate() - (day - 1));
      const weekId = mon.toISOString().split('T')[0];
      completionsByWeek[weekId] = (completionsByWeek[weekId] || 0) + 1;
    });

    const weekIds = Object.keys(completionsByWeek).sort((a, b) => new Date(b) - new Date(a));
    
    // Check current week
    const currentDay = today.getDay() || 7;
    const currentMon = new Date(today);
    currentMon.setDate(today.getDate() - (currentDay - 1));
    const currentWeekId = currentMon.toISOString().split('T')[0];

    const latestWeekId = weekIds[0];
    const latestWeekDate = new Date(latestWeekId);
    const diffWeeks = Math.floor((currentMon - latestWeekDate) / (1000 * 60 * 60 * 24 * 7));

    if (diffWeeks > 1) return { streak: 0, shieldsUsed: 0 };
    
    // If we are in a new week but haven't finished it yet, streak might be from last week
    // But if we missed the target last week, streak is 0.
    let streak = 0;
    let activeWeek = currentWeekId;
    
    // Iterate backwards through weeks
    while (true) {
      const count = completionsByWeek[activeWeek] || 0;
      const isCurrentWeek = activeWeek === currentWeekId;
      
      if (count >= target) {
        streak++;
      } else if (!isCurrentWeek) {
        // Broke streak in a past week
        break;
      } else if (isCurrentWeek && diffWeeks === 1) {
        // We are in current week, but last week (latestWeekId) was the one we care about
        // if latestWeekId is not currentWeekId, it means currentWeekId has 0 completions.
        // We continue the loop to check the previous week.
      } else if (isCurrentWeek && count < target) {
        // Current week target not met yet, but streak could still be alive from previous week
      } else {
        break;
      }
      
      const nextWeek = new Date(activeWeek);
      nextWeek.setDate(nextWeek.getDate() - 7);
      activeWeek = nextWeek.toISOString().split('T')[0];
      
      // Safety break
      if (streak > 5000) break;
    }

    return { streak, shieldsUsed: 0 };
  }
}

/**
 * Calculate shields earned based on streak milestones.
 */
function calculateEarnedShields(streak) {
  return Math.floor(streak / 10);
}

// --- API Routes ---

/**
 * GET /habits
 * Returns all habits for the authenticated user with streaks calculated.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDate();

    // Get all habits for this user
    const habitsResult = await pool.query(
      'SELECT id, name, category, shields, frequency_type, target_days_count, created_at FROM habits WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );

    // Get all completed dates for this user's habits
    const habitIds = habitsResult.rows.map(h => h.id);

    let completedDatesMap = {};
    if (habitIds.length > 0) {
      const cdResult = await pool.query(
        'SELECT habit_id, completed_date, note FROM completed_dates WHERE habit_id = ANY($1) ORDER BY completed_date ASC',
        [habitIds]
      );

      // Group completed dates by habit_id
      cdResult.rows.forEach(row => {
        if (!completedDatesMap[row.habit_id]) {
          completedDatesMap[row.habit_id] = [];
        }
        completedDatesMap[row.habit_id].push({
          date: row.completed_date.toISOString().split('T')[0],
          note: row.note || '',
        });
      });
    }

    const currentDay = new Date(today).getDay() || 7;
    const currentMon = new Date(today);
    currentMon.setDate(new Date(today).getDate() - (currentDay - 1));
    const currentWeekId = currentMon.toISOString().split('T')[0];

    const habitsWithStreak = habitsResult.rows.map(habit => {
      const completedDates = completedDatesMap[habit.id] || [];
      const dateStrings = completedDates.map(cd => cd.date);
      const { streak } = calculateStreak(dateStrings, habit.shields, habit.frequency_type, habit.target_days_count);
      const earnedShields = calculateEarnedShields(streak);

      // Calculate weekly progress
      const weekCompletions = dateStrings.filter(d => {
        const dDate = new Date(d);
        const dDay = dDate.getDay() || 7;
        const dMon = new Date(dDate);
        dMon.setDate(dDate.getDate() - (dDay - 1));
        return dMon.toISOString().split('T')[0] === currentWeekId;
      }).length;

      return {
        id: habit.id,
        name: habit.name,
        category: habit.category,
        frequencyType: habit.frequency_type,
        targetDaysCount: habit.target_days_count,
        weeklyProgress: weekCompletions,
        shields: Math.max(habit.shields, earnedShields),
        createdAt: habit.created_at.toISOString ? habit.created_at.toISOString().split('T')[0] : habit.created_at,
        completedDates,
        streak,
        completedToday: dateStrings.includes(today),
      };
    });

    res.json(habitsWithStreak);
  } catch (err) {
    console.error('Error fetching habits:', err);
    res.status(500).json({ error: 'Failed to fetch habits.' });
  }
});

/**
 * POST /habits
 * Create a new habit for the authenticated user.
 * Body: { name, category? }
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, category, frequencyType, targetDaysCount } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Habit name is required.' });
    }

    const result = await pool.query(
      'INSERT INTO habits (user_id, name, category, frequency_type, target_days_count) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, category, frequency_type, target_days_count, shields, created_at',
      [
        userId, 
        name.trim(), 
        (category && category.trim()) || 'General',
        frequencyType || 'daily',
        targetDaysCount || 1
      ]
    );

    const habit = result.rows[0];

    res.status(201).json({
      id: habit.id,
      name: habit.name,
      category: habit.category,
      frequencyType: habit.frequency_type,
      targetDaysCount: habit.target_days_count,
      weeklyProgress: 0,
      shields: habit.shields,
      createdAt: habit.created_at.toISOString().split('T')[0],
      completedDates: [],
      streak: 0,
      completedToday: false,
    });
  } catch (err) {
    console.error('Error creating habit:', err);
    res.status(500).json({ error: 'Failed to create habit.' });
  }
});

/**
 * PUT /habits/:id
 * Toggle today's completion status for a habit.
 * Body: { note? }
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { note } = req.body || {};
    const today = getTodayDate();

    // Verify ownership
    const habitResult = await pool.query(
      'SELECT id, name, category, shields, created_at FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    const habit = habitResult.rows[0];

    // Check if already completed today
    const existingResult = await pool.query(
      'SELECT id FROM completed_dates WHERE habit_id = $1 AND completed_date = $2',
      [id, today]
    );

    if (existingResult.rows.length === 0) {
      // Mark as done today
      await pool.query(
        'INSERT INTO completed_dates (habit_id, completed_date, note) VALUES ($1, $2, $3)',
        [id, today, note || '']
      );
    } else {
      // Mark as undone today
      await pool.query(
        'DELETE FROM completed_dates WHERE habit_id = $1 AND completed_date = $2',
        [id, today]
      );
    }

    // Recalculate streak
    const cdResult = await pool.query(
      'SELECT completed_date, note FROM completed_dates WHERE habit_id = $1 ORDER BY completed_date ASC',
      [id]
    );

    const completedDates = cdResult.rows.map(row => ({
      date: row.completed_date.toISOString().split('T')[0],
      note: row.note || '',
    }));
    const dateStrings = completedDates.map(cd => cd.date);
    const { streak } = calculateStreak(dateStrings, habit.shields);
    const earnedShields = calculateEarnedShields(streak);
    const newShields = Math.max(habit.shields, earnedShields);

    // Update shields if earned new ones
    if (newShields > habit.shields) {
      await pool.query('UPDATE habits SET shields = $1 WHERE id = $2', [newShields, id]);
    }

    res.json({
      id: habit.id,
      name: habit.name,
      category: habit.category,
      shields: newShields,
      createdAt: habit.created_at.toISOString ? habit.created_at.toISOString().split('T')[0] : habit.created_at,
      completedDates,
      streak,
      completedToday: dateStrings.includes(today),
    });
  } catch (err) {
    console.error('Error toggling habit:', err);
    res.status(500).json({ error: 'Failed to toggle habit.' });
  }
});

/**
 * PUT /habits/:id/shield
 * Use a shield to protect a broken streak.
 */
router.put('/:id/shield', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const habitResult = await pool.query(
      'SELECT id, name, category, shields, created_at FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (habitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    const habit = habitResult.rows[0];

    if (habit.shields <= 0) {
      return res.status(400).json({ error: 'No shields available.' });
    }

    // Decrement shield
    await pool.query('UPDATE habits SET shields = shields - 1 WHERE id = $1', [id]);

    // Get completed dates and recalculate streak
    const cdResult = await pool.query(
      'SELECT completed_date, note FROM completed_dates WHERE habit_id = $1 ORDER BY completed_date ASC',
      [id]
    );

    const completedDates = cdResult.rows.map(row => ({
      date: row.completed_date.toISOString().split('T')[0],
      note: row.note || '',
    }));
    const dateStrings = completedDates.map(cd => cd.date);
    const today = getTodayDate();
    const { streak } = calculateStreak(dateStrings, habit.shields - 1);

    res.json({
      id: habit.id,
      name: habit.name,
      category: habit.category,
      shields: habit.shields - 1,
      createdAt: habit.created_at.toISOString ? habit.created_at.toISOString().split('T')[0] : habit.created_at,
      completedDates,
      streak,
      completedToday: dateStrings.includes(today),
    });
  } catch (err) {
    console.error('Error using shield:', err);
    res.status(500).json({ error: 'Failed to use shield.' });
  }
});

/**
 * DELETE /habits/:id
 * Delete a habit by ID (only if owned by the authenticated user).
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    res.json({ message: 'Habit deleted successfully.' });
  } catch (err) {
    console.error('Error deleting habit:', err);
    res.status(500).json({ error: 'Failed to delete habit.' });
  }
});

/**
 * PATCH /habits/:id
 * Update habit details (name or category).
 * Body: { name?, category? }
 */
router.patch('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, category, frequencyType, targetDaysCount } = req.body;

    if (!name && !category && !frequencyType && !targetDaysCount) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    let query = 'UPDATE habits SET ';
    let params = [];
    let setClauses = [];

    if (name) {
      if (name.trim() === '') return res.status(400).json({ error: 'Name cannot be empty.' });
      setClauses.push(`name = $${params.length + 1}`);
      params.push(name.trim());
    }

    if (category) {
      setClauses.push(`category = $${params.length + 1}`);
      params.push(category.trim());
    }

    if (frequencyType) {
      setClauses.push(`frequency_type = $${params.length + 1}`);
      params.push(frequencyType);
    }

    if (targetDaysCount) {
      setClauses.push(`target_days_count = $${params.length + 1}`);
      params.push(targetDaysCount);
    }

    query += setClauses.join(', ') + ` WHERE id = $${params.length + 1} AND user_id = $${params.length + 2} RETURNING *`;
    params.push(id, userId);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating habit:', err);
    res.status(500).json({ error: 'Failed to update habit.' });
  }
});

/**
 * GET /habits/insights
 * Returns analytics insights about the authenticated user's habits.
 */
router.get('/insights', async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date(getTodayDate());

    // Get all habits for this user
    const habitsResult = await pool.query(
      'SELECT id, name, category, shields, created_at FROM habits WHERE user_id = $1',
      [userId]
    );

    const habits = habitsResult.rows;

    if (habits.length === 0) {
      return res.json({
        consistencyScore: 0,
        bestDay: null,
        worstDay: null,
        correlations: [],
        encouragement: 'Add your first habit to start tracking your journey!',
        totalCompletions: 0,
      });
    }

    // Get all completed dates for user's habits
    const habitIds = habits.map(h => h.id);
    const cdResult = await pool.query(
      'SELECT habit_id, completed_date FROM completed_dates WHERE habit_id = ANY($1)',
      [habitIds]
    );

    // Group completed dates by habit
    const habitCompletions = {};
    habits.forEach(h => { habitCompletions[h.id] = []; });
    cdResult.rows.forEach(row => {
      habitCompletions[row.habit_id].push(row.completed_date.toISOString().split('T')[0]);
    });

    // Day-of-week analysis
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = new Array(7).fill(0);
    const dayTotals = new Array(7).fill(0);

    let totalPossible = 0;
    let totalCompletions = 0;

    habits.forEach(habit => {
      const created = new Date(habit.created_at);
      const dateStrings = habitCompletions[habit.id];

      const daysCursor = new Date(created);
      while (daysCursor <= today) {
        const dayOfWeek = daysCursor.getDay();
        const dateStr = daysCursor.toISOString().split('T')[0];
        dayTotals[dayOfWeek]++;
        totalPossible++;

        if (dateStrings.includes(dateStr)) {
          dayCounts[dayOfWeek]++;
          totalCompletions++;
        }

        daysCursor.setDate(daysCursor.getDate() + 1);
      }
    });

    // Consistency score
    const consistencyScore = totalPossible > 0
      ? Math.round((totalCompletions / totalPossible) * 100)
      : 0;

    // Best and worst days
    const dayRates = dayNames.map((name, i) => ({
      day: name,
      rate: dayTotals[i] > 0 ? Math.round((dayCounts[i] / dayTotals[i]) * 100) : 0,
    }));

    const sortedDays = [...dayRates].sort((a, b) => b.rate - a.rate);
    const bestDay = sortedDays[0];
    const worstDay = sortedDays[sortedDays.length - 1];

    // Correlations
    const correlations = [];
    for (let i = 0; i < habits.length; i++) {
      for (let j = i + 1; j < habits.length; j++) {
        const datesA = new Set(habitCompletions[habits[i].id]);
        const datesB = new Set(habitCompletions[habits[j].id]);
        const overlap = [...datesA].filter(d => datesB.has(d)).length;
        const total = new Set([...datesA, ...datesB]).size;

        if (total > 0 && overlap > 2) {
          const correlation = Math.round((overlap / total) * 100);
          if (correlation >= 40) {
            correlations.push({
              habitA: habits[i].name,
              habitB: habits[j].name,
              correlation,
            });
          }
        }
      }
    }

    correlations.sort((a, b) => b.correlation - a.correlation);

    // Encouragement
    let encouragement = '';
    if (consistencyScore >= 80) {
      encouragement = "🏆 Outstanding! You're in the top tier of consistency. Keep that momentum going!";
    } else if (consistencyScore >= 60) {
      encouragement = "💪 Great work! You're above average. Push a little harder to reach elite status!";
    } else if (consistencyScore >= 40) {
      encouragement = "🌱 You're building momentum! Consistency compounds — every day matters.";
    } else if (consistencyScore >= 20) {
      encouragement = "🔄 Room for growth! Try focusing on just 1-2 habits until they become automatic.";
    } else {
      encouragement = "🚀 Every journey starts with a single step. Mark one habit complete today!";
    }

    res.json({
      consistencyScore,
      bestDay,
      worstDay,
      correlations: correlations.slice(0, 5),
      encouragement,
      totalCompletions,
      dayRates,
    });
  } catch (err) {
    console.error('Error fetching insights:', err);
    res.status(500).json({ error: 'Failed to fetch insights.' });
  }
});

module.exports = router;
