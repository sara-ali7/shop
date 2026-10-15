import Link from "next/link";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryHref?: string;
  retryLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryHref,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-12 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
      {retryHref && (
        <Button variant="outline" asChild>
          <Link href={retryHref}>{retryLabel}</Link>
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-12 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      {message && <p className="max-w-md text-sm text-muted-foreground">{message}</p>}
      {action?.href && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
      {action?.onClick && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
