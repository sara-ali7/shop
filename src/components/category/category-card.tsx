import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SafeImage } from "@/components/shared/safe-image";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Card className="overflow-hidden transition-colors focus-within:border-ring hover:border-ring">
      <Link
        href={`/categories/${category.slug}`}
        className="block focus-visible:outline-none"
      >
        <SafeImage src={category.image} alt="" className="aspect-[4/3] w-full" />
        <div className="p-3 sm:p-4">
          <h3 className="truncate font-medium">{category.name}</h3>
          <p className="text-sm text-muted-foreground">Browse products</p>
        </div>
      </Link>
    </Card>
  );
}
