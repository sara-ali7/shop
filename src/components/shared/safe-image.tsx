"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => setFailed(false), [src]);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} (image unavailable)`}
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
      >
        <ImageOff className="size-8" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
