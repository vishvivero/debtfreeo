
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Debt } from "@/lib/types";

export function useDebtMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const updateDebtAndProfile = async (debt: Debt) => {
    if (!user?.id) throw new Error("No user ID available");

    // Get all debts for the user
    const { data: debts, error: debtsError } = await supabase
      .from("debts")
      .select("minimum_payment")
      .eq("user_id", user.id)
      .neq("id", debt.id); // Exclude the current debt being updated

    if (debtsError) throw debtsError;

    // Calculate total minimum payment including the new/updated debt
    const totalMinimumPayment = (debts || []).reduce(
      (sum, d) => sum + (d.minimum_payment || 0),
      debt.minimum_payment
    );

    console.log("Updating total minimum payment to:", totalMinimumPayment);

    // Update the profile with the new total minimum payment
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ monthly_payment: totalMinimumPayment })
      .eq("id", user.id);

    if (profileError) throw profileError;

    return totalMinimumPayment;
  };

  const updateDebt = useMutation({
    mutationFn: async (updatedDebt: Debt) => {
      if (!user?.id) throw new Error("No user ID available");

      console.log("Updating debt:", updatedDebt);
      const { data, error } = await supabase
        .from("debts")
        .update(updatedDebt)
        .eq("id", updatedDebt.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating debt:", error);
        throw error;
      }

      // Ensure status is of correct type before passing to updateDebtAndProfile
      const typedDebt: Debt = {
        ...updatedDebt,
        status: updatedDebt.status as 'active' | 'paid'
      };

      await updateDebtAndProfile(typedDebt);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({
        title: "Debt updated",
        description: "Your debt has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error in updateDebt mutation:", error);
      toast({
        title: "Error updating debt",
        description: "There was an error updating your debt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addDebt = useMutation({
    mutationFn: async (newDebt: Omit<Debt, "id">) => {
      if (!user?.id) throw new Error("No user ID available");

      console.log("Adding new debt:", newDebt);
      const { data, error } = await supabase
        .from("debts")
        .insert([{ ...newDebt, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error("Error adding debt:", error);
        throw error;
      }

      // Ensure data is properly typed before passing to updateDebtAndProfile
      const typedDebt: Debt = {
        ...data,
        status: data.status as 'active' | 'paid'
      };

      await updateDebtAndProfile(typedDebt);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({
        title: "Debt added",
        description: "Your new debt has been successfully added.",
      });
    },
    onError: (error) => {
      console.error("Error in addDebt mutation:", error);
      toast({
        title: "Error adding debt",
        description: "There was an error adding your debt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteDebt = useMutation({
    mutationFn: async (debtId: string) => {
      if (!user?.id) throw new Error("No user ID available");

      // Get the debt before deleting it
      const { data: debt, error: getError } = await supabase
        .from("debts")
        .select()
        .eq("id", debtId)
        .single();

      if (getError) throw getError;

      console.log("Deleting debt:", debtId);
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", debtId);

      if (error) {
        console.error("Error deleting debt:", error);
        throw error;
      }

      if (debt) {
        // Create a properly typed debt object for the update
        const typedDebt: Debt = {
          ...debt,
          status: debt.status as 'active' | 'paid',
          minimum_payment: 0
        };
        await updateDebtAndProfile(typedDebt);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({
        title: "Debt deleted",
        description: "Your debt has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error("Error in deleteDebt mutation:", error);
      toast({
        title: "Error deleting debt",
        description: "There was an error deleting your debt. Please try again.",
        variant: "destructive",
      });
    },
  });

  return { updateDebt, addDebt, deleteDebt };
}
