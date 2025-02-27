import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { useDebtMutations } from "./use-debt-mutations";
import { usePaymentHistory } from "./use-payment-history";
import type { Debt } from "@/lib/types";

export const useDebts = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { updateDebt, addDebt, deleteDebt } = useDebtMutations();
  const { recordPayment } = usePaymentHistory();

  const { data: debts, isLoading } = useQuery({
    queryKey: ["debts", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for debt fetch");
        return null;
      }

      console.log("Fetching debts for user:", user.id);
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching debts:", error);
        throw error;
      }

      console.log("Fetched debts for user:", data);
      return data as Debt[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
    enabled: !!user?.id,
  });

  return {
    debts,
    isLoading,
    updateDebt,
    addDebt,
    deleteDebt,
    recordPayment,
    profile
  };
};