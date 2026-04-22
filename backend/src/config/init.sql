-- HabitFlow Database Schema
-- This file is auto-run by Docker on first container creation

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Habits table (linked to user)
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    frequency_type VARCHAR(20) DEFAULT 'daily', -- 'daily' or 'weekly'
    target_days_count INTEGER DEFAULT 1,
    shields INTEGER DEFAULT 0,
    created_at DATE DEFAULT CURRENT_DATE
);

-- Completed dates table (linked to habit)
CREATE TABLE IF NOT EXISTS completed_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL,
    note TEXT DEFAULT '',
    UNIQUE(habit_id, completed_date)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_dates_habit_id ON completed_dates(habit_id);
