"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
}

function Avatar({ src, name, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && failedSrc !== src;
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground",
        className,
      )}
    >
      {showImage ? (
        <img
          src={src!}
          alt={name ? `${name}'s avatar` : "User avatar"}
          className="size-full object-cover"
          onError={() => setFailedSrc(src!)}
        />
      ) : initials !== "?" ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <UserRound className="size-1/2 text-muted-foreground" aria-hidden="true" />
      )}
    </span>
  );
}
export { Avatar };
