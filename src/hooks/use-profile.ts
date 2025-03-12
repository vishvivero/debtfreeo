
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { Profile } from "./types";

export function useProfile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }
      
      // Use a more reliable approach for fetching the profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data as Profile;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user?.id,
    retry: 1,
    retryDelay: 1000,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) {
        throw new Error("No user ID available for profile update");
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", user?.id], data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile
  };
}
