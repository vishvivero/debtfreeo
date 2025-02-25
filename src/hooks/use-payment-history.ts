
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";

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
          currency_symbol: profile?.preferred_currency || "£",
          redistributed_from: debtId
        }]);

      if (error) {
        console.error("Error recording payment:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", user?.id] });
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

  return { recordPayment };
}
