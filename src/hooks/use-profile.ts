
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { Profile } from "./types";

export function useProfile() {
  const { toast } = useToast();
  const { user } = useAuth();

  console.log("useProfile hook - user:", user?.id);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for profile fetch");
        return null;
      }
      
      console.log("Fetching profile for user:", user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive",
        });
        return null;
      }

      console.log("Profile data fetched:", data);
      return data as Profile;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
    enabled: !!user?.id,
    retry: 1, // Only retry once to avoid excessive fetching
    retryDelay: 1000, // Retry after 1 second
  });

  return {
    profile,
    isLoading,
    error
  };
}
