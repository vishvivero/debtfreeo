
import React from "react";
import { Shield, User } from "lucide-react";
import { SidebarHeader } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserType } from "@supabase/supabase-js";

interface AdminSidebarHeaderProps {
  user: UserType | null;
}

export function AdminSidebarHeader({ user }: AdminSidebarHeaderProps) {
  return (
    <SidebarHeader className="p-4 border-b border-border/50">
      <div className="flex items-center gap-2 px-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
      </div>
      {user && (
        <div className="flex items-center gap-3 mt-4 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || user.email}
            </span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
        </div>
      )}
    </SidebarHeader>
  );
}
