
import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu"
    className={cn("flex flex-col gap-1 py-2", className)}
    {...props}
  />
));

SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-item"
    className={cn("relative flex flex-row items-center", className)}
    {...props}
  />
));

SidebarMenuItem.displayName = "SidebarMenuItem";

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string;
  isActive?: boolean;
  asChild?: boolean;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, tooltip, isActive, children, asChild, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button";
  const content = (
    <Comp
      ref={ref}
      data-active={isActive}
      className={cn(
        "flex w-full items-center rounded-md p-2 text-sidebar-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
});

SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "ml-auto text-xs font-medium text-sidebar-foreground/50",
      className
    )}
    {...props}
  />
));

SidebarMenuBadge.displayName = "SidebarMenuBadge";
