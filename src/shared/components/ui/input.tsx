import React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full min-w-0 rounded-lg border px-3 py-2 text-base outline-none transition-[color,box-shadow]",
        // Background & Border
        "bg-muted/50 border-border",
        "dark:bg-muted/30 dark:border-border",
        // Text & Placeholder
        "text-foreground placeholder:text-muted-foreground",
        // Focus state
        "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]",
        "focus-visible:bg-background",
        // Selection
        "selection:bg-primary selection:text-primary-foreground",
        // Invalid state
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // File input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Responsive
        "md:text-sm md:h-9",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
