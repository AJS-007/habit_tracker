"use client";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  const allCategories = ["All", ...categories];

  return (
    <div className="category-filter">
      {allCategories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat === "Health" && "💊 "}
          {cat === "Productivity" && "⚡ "}
          {cat === "Mindfulness" && "🧘 "}
          {cat === "Fitness" && "🏋️ "}
          {cat === "Learning" && "📚 "}
          {cat === "Creative" && "🎨 "}
          {cat === "All" && "✦ "}
          {cat}
        </button>
      ))}
    </div>
  );
}
