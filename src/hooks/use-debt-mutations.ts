
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Debt } from "@/lib/types";

export function useDebtMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Helper function to ensure proper typing when getting data from the database
  const mapDatabaseResponseToDebt = (data: any): Debt => {
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      banker_name: data.banker_name,
      balance: data.balance,
      interest_rate: data.interest_rate,
      minimum_payment: Number(data.minimum_payment),
      created_at: data.created_at,
      updated_at: data.updated_at,
      currency_symbol: data.currency_symbol,
      next_payment_date: data.next_payment_date,
      category: data.category,
      closed_date: data.closed_date,
      status: data.status as 'active' | 'paid',
      metadata: data.metadata || null // Ensure metadata is properly typed
    };
  };

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
      debt.minimum_payment || 0 // Ensure we handle null/undefined minimum_payment
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
      
      // Create a new object with only the properties that should be sent to the database
      const debtToUpdate = {
        id: updatedDebt.id,
        name: updatedDebt.name,
        banker_name: updatedDebt.banker_name,
        balance: updatedDebt.balance,
        interest_rate: updatedDebt.interest_rate,
        minimum_payment: updatedDebt.minimum_payment,
        currency_symbol: updatedDebt.currency_symbol,
        next_payment_date: updatedDebt.next_payment_date,
        category: updatedDebt.category,
        closed_date: updatedDebt.closed_date,
        status: updatedDebt.status,
        metadata: updatedDebt.metadata
      };

      const { data, error } = await supabase
        .from("debts")
        .update(debtToUpdate)
        .eq("id", updatedDebt.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating debt:", error);
        throw error;
      }

      // Map database response to Debt type
      const typedDebt = mapDatabaseResponseToDebt(data);

      await updateDebtAndProfile(typedDebt);
      return typedDebt;
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

      // Ensure minimum_payment is a valid number
      if (typeof newDebt.minimum_payment !== 'number' || isNaN(newDebt.minimum_payment)) {
        console.error("Invalid minimum payment:", newDebt.minimum_payment);
        throw new Error("Invalid minimum payment amount");
      }

      console.log("Adding new debt with metadata:", newDebt.metadata);
      
      // Create a new object with only the properties that should be sent to the database
      const debtToInsert = {
        ...newDebt,
        user_id: user.id,
        minimum_payment: Number(newDebt.minimum_payment) // Ensure it's a number
      };

      const { data, error } = await supabase
        .from("debts")
        .insert([debtToInsert])
        .select()
        .single();

      if (error) {
        console.error("Error adding debt:", error);
        throw error;
      }

      // Map database response to Debt type
      const typedDebt = mapDatabaseResponseToDebt(data);

      console.log("Successfully added debt with minimum payment:", typedDebt.minimum_payment);
      await updateDebtAndProfile(typedDebt);
      return typedDebt;
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
        const typedDebt = mapDatabaseResponseToDebt({
          ...debt,
          minimum_payment: 0 // Set to 0 for calculation purposes when deleted
        });
        
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
