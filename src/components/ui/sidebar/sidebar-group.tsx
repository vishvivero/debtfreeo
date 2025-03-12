
import * as React from "react";
import { cn } from "@/lib/utils";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group"
    className={cn("flex flex-col gap-1", className)}
    {...props}
  />
));

SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("flex flex-col gap-1", className)}
    {...props}
  />
));

SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-label"
    className={cn("px-2 text-xs font-medium text-sidebar-foreground/50", className)}
    {...props}
  />
));

SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    data-sidebar="group-action"
    className={cn(
      "rounded text-xs font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring",
      className
    )}
    {...props}
  />
));

SidebarGroupAction.displayName = "SidebarGroupAction";
