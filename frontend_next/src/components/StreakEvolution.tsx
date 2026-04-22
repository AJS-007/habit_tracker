"use client";

interface StreakEvolutionProps {
  streak: number;
}

export default function StreakEvolution({ streak }: StreakEvolutionProps) {
  const getTier = () => {
    if (streak >= 100) return { name: "Crown", cls: "tier-crown" };
    if (streak >= 30) return { name: "Diamond", cls: "tier-diamond" };
    if (streak >= 10) return { name: "Lightning", cls: "tier-lightning" };
    if (streak >= 3) return { name: "Fire", cls: "tier-fire" };
    if (streak >= 1) return { name: "Sprout", cls: "tier-sprout" };
    return { name: "Seed", cls: "tier-seed" };
  };

  const tier = getTier();

  return (
    <span className={`streak-evolution ${tier.cls}`} title={`${tier.name} tier`}>
      {streak >= 100 && (
        <svg className="evo-icon" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      )}
      {streak >= 30 && streak < 100 && (
        <svg className="evo-icon" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      )}
      {streak >= 10 && streak < 30 && (
        <svg className="evo-icon" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )}
      {streak >= 3 && streak < 10 && (
        <svg className="evo-icon" viewBox="0 0 24 24">
          <path d="M17.5 10.5C15 8 14.5 4 14.5 4C14.5 4 13.5 6 11.5 6C9 6 8.5 2 8.5 2C8.5 2 7 5 7 8C7 11 9.5 13.5 9.5 13.5C9.5 13.5 8 12.5 8 12.5C6 14.5 5.5 18 8.5 21C11.5 24 16.5 22.5 18.5 18C20 14.5 17.5 10.5 17.5 10.5Z" />
        </svg>
      )}
      {streak >= 1 && streak < 3 && (
        <svg className="evo-icon" viewBox="0 0 24 24">
          <path d="M12 22C6.5 22 4 17 4 14C4 11 6 8 8 6C8.5 9 10 11 12 11C14 11 15.5 9 16 6C18 8 20 11 20 14C20 17 17.5 22 12 22Z" />
          <path d="M12 22C10 22 8 20 8 18C8 16 10 14 12 14C14 14 16 16 16 18C16 20 14 22 12 22Z" />
        </svg>
      )}
      {streak === 0 && (
        <svg className="evo-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="16" r="4" />
          <path d="M12 12V8" />
          <path d="M12 8C12 8 9 6 9 4C9 2 12 2 12 2C12 2 15 2 15 4C15 6 12 8 12 8Z" />
        </svg>
      )}
    </span>
  );
}
