import * as React from "react";

import { cn } from "./utils";

interface InputDateProps extends React.ComponentProps<"input"> {}

export function InputDate({ className, ...props }: InputDateProps) {
  return (
    <input
      type="date"
      data-slot="input"
      className={cn(
        "file: dark:bg-input/30",
        "h-9 w-full rounded-md border border-input bg-input-background px-3 pr-10 py-1 text-base md:text-sm",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
