import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number | null;
  loading: boolean;
  error?: string | null;
  href: string;
}

export function StatCard({ label, value, loading, error, href }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : value === null ? (
          <div className="mt-1">
            <p className="text-2xl font-semibold text-muted-foreground">Unavailable</p>
            {error && <p className="mt-1 text-xs text-muted-foreground">{error}</p>}
          </div>
        ) : (
          <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
        )}
        <Link href={href} className="mt-3 inline-block text-sm hover:underline">
          Manage
        </Link>
      </CardContent>
    </Card>
  );
}
