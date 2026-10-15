import type { Category } from "@/types";
import { CategoryCard } from "./category-card";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {categories.map((category) => (
        <li key={category.id}>
          <CategoryCard category={category} />
        </li>
      ))}
    </ul>
  );
}
