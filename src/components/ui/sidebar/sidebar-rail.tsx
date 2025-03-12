
import * as React from "react";
import { cn } from "@/lib/utils";

export const SidebarRail = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="rail"
    className={cn(
      "absolute inset-y-0 left-0 z-20 flex w-12 flex-col items-center border-r border-border/50 bg-background pt-3",
      className
    )}
    {...props}
  />
));

SidebarRail.displayName = "SidebarRail";
