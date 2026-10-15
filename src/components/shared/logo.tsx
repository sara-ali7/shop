"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  badge?: string;
}

export function Logo({
  className,
  showText = true,
  size = "md",
  href = "/",
  badge,
}: LogoProps) {
  const iconSizes = {
    sm: "size-7",
    md: "size-8",
    lg: "size-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2 select-none group", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105",
          iconSizes[size],
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bexpert-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="60%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="9" fill="url(#bexpert-grad)" />
          <path
            d="M10 12.5h12l-.8 9.2a1.6 1.6 0 0 1-1.6 1.5h-7.2a1.6 1.6 0 0 1-1.6-1.5L10 12.5z"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M13 12.5V10.8a3 3 0 0 1 6 0v1.7"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={cn("font-extrabold tracking-tight text-foreground", textSizes[size])}>
            BE<span className="text-primary">-xpert</span>
          </span>
          {badge && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/20">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center shrink-0" aria-label="BE-xpert Home">
        {content}
      </Link>
    );
  }

  return content;
}
