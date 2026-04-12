import HabitDashboard from "@/components/HabitDashboard";

export default function Home() {
  return (
    <div id="app">
      <header>
        <h1>Habit<span>Flow</span></h1>
        <p>Master your routine, one day at a time.</p>
      </header>

      <HabitDashboard />

      <footer>
        <p>&copy; 2026 HabitFlow SPA. Built with Next.js & Node.js.</p>
      </footer>
    </div>
  );
}
