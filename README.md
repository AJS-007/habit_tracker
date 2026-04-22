# HabitFlow

Welcome to HabitFlow! This application helps you build and monitor long-term habits with beautiful visualizations, streak tracking, and secure user accounts.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌟 Key Features

- **Private User Accounts**: Secure JWT-based authentication for personal habit tracking.
- **Progress Stats Component**: Instantly view active habits, daily completions, and all-time streaks.
- **Insights Dashboard**: Advanced analytics on consistency, best/worst days, and habit correlations.
- **Shield Protection**: Earn shields via streaks to protect your habit history from occasional gaps.
- **Calendar Grid**: Visual history for every habit to track trends over time.
- **Modern Glassmorphic UI**: Premium dark-mode interface with fluid animations and responsive design.

## 🏗️ Project Structure

- **`frontend_next/`**: Client application built with **Next.js 15**, **React 19**, and **TypeScript**. 
- **`backend/`**: REST API built with **Node.js**, **Express**, and **PostgreSQL**.
- **`docker-compose.yml`**: Full stack orchestration for development and production.

For detailed documentation, please refer to:
- [Architecture Details](ARCHITECTURE.md)
- [API Reference](API-DOCS.md)

---

## 🚀 Quick Start (with Docker)

The easiest way to run the entire stack is using Docker Compose.

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my_backend
   ```

2. **Environment Setup**:
   Create a `.env` file in the `backend/` directory with your secrets (see `backend/.env.example`).

3. **Spin up the stack**:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

---

## 🛠️ Usage

1. **Register/Login**: Create a private account to start tracking your habits.
2. **Add Habits**: Enter a habit name and optional category.
3. **Track Daily**: Click the completion circles to mark habits as done.
4. **View Insights**: Navigate to the Stats page for deep-dives into your productivity patterns.
5. **Protect Streaks**: Use earned shields to bridge gaps in your routine without losing your streak.

Happy tracking!
