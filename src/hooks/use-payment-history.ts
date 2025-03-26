
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { PaymentHistory } from "@/lib/types/debt";

export function usePaymentHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile } = useProfile();

  const recordPayment = useMutation({
    mutationFn: async ({ amount, debtId }: { amount: number; debtId: string }) => {
      if (!user?.id) throw new Error("No user ID available");

      console.log("Recording payment:", { amount, debtId });
      const { error } = await supabase
        .from("payment_history")
        .insert([{
          user_id: user.id,
          total_payment: amount,
          payment_date: new Date().toISOString(),
          currency_symbol: profile?.preferred_currency || "£"
        }]);

      if (error) {
        console.error("Error recording payment:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["payment-history", user?.id] });
      toast({
        title: "Payment recorded",
        description: "Your payment has been successfully recorded.",
      });
    },
    onError: (error) => {
      console.error("Error in recordPayment mutation:", error);
      toast({
        title: "Error recording payment",
        description: "There was an error recording your payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payment-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log("Fetching payment history for user:", user.id);
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

      if (error) {
        console.error("Error fetching payment history:", error);
        throw error;
      }

      return data as PaymentHistory[];
    },
    enabled: !!user?.id,
  });

  return { 
    recordPayment,
    payments: payments || [],
    isLoading
  };
}
