"use client";

import { cn } from "@/lib/utils";

export function ShinyText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block bg-[linear-gradient(110deg,oklch(0.38_0.18_295),45%,oklch(0.62_0.22_295),55%,oklch(0.38_0.18_295))] bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_2s_infinite]",
        className
      )}
    >
      {text}
    </span>
  );
}
