"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full bg-muted items-center justify-center",
        className
      )}
      {...props}>
      {children}
    </div>
  );
}

function AvatarImage({
  className,
  alt = "Avatar",
  ...props
}: React.ComponentProps<"img"> & { alt?: string }) {
  return (
    <img
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      alt={alt}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-white font-bold",
        className
      )}
      {...props}>
      {children}
    </span>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
