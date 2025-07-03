"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scroll-area"
      className={cn("overflow-auto", className)}
      {...props}>
      {children}
    </div>
  );
}

// ScrollBar is not needed, but export a dummy for compatibility
function ScrollBar() {
  return null;
}

export { ScrollArea, ScrollBar };
