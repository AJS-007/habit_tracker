# HabitFlow API Reference

This document covers the RESTful API endpoints available in the HabitFlow backend.

## Base URL
`http://localhost:3000`

## Authentication
Most endpoints require a valid JSON Web Token (JWT) provided in the `Authorization` header:
`Authorization: Bearer <your_token>`

---

## 🔐 Authentication Routes

### 1. Register User
- **Method**: `POST`
- **Path**: `/auth/register`
- **Body**: `{ "name": "John Doe", "email": "john@example.com", "password": "password123" }`
- **Response**: `201 Created` with JWT token and user info.

### 2. Login User
- **Method**: `POST`
- **Path**: `/auth/login`
- **Body**: `{ "email": "john@example.com", "password": "password123" }`
- **Response**: `200 OK` with JWT token and user info.

---

## 🏃 Habit Routes (Requires Auth)

### 3. Retrieve all Habits
Fetches habits for the authenticated user, hydrated with streaks and completion status.
- **Method**: `GET`
- **Path**: `/habits`
- **Response**: `200 OK` (Array of habits)

### 4. Create a Habit
- **Method**: `POST`
- **Path**: `/habits`
- **Body**: `{ "name": "Exercise", "category": "Health" }`
- **Response**: `201 Created`

### 5. Toggle Habit Completion
Toggles completion for the current day.
- **Method**: `PUT`
- **Path**: `/habits/:id`
- **Body**: `{ "note": "Optional session notes" }`
- **Response**: `200 OK`

### 6. Use Shield
Consumes an earned shield to protect a streak gap.
- **Method**: `PUT`
- **Path**: `/habits/:id/shield`
- **Response**: `200 OK`

### 7. Delete a Habit
- **Method**: `DELETE`
- **Path**: `/habits/:id`
- **Response**: `200 OK`

---

## 📊 Analytics Routes (Requires Auth)

### 8. Get Insights
Returns complex analytics including consistency score, best days, and correlations.
- **Method**: `GET`
- **Path**: `/habits/insights`
- **Response**: `200 OK`
  ```json
  {
    "consistencyScore": 85,
    "bestDay": { "day": "Monday", "rate": 95 },
    "worstDay": { "day": "Sunday", "rate": 40 },
    "correlations": [...],
    "encouragement": "Outstanding work!"
  }
  ```

