
import { useProfile } from "@/hooks/use-profile";
import { useToast } from "@/components/ui/use-toast";
import { useDebts } from "@/hooks/use-debts";
import { useState } from "react";

export const useMonthlyPayment = () => {
  const { profile, updateProfile } = useProfile();
  const { debts } = useDebts();
  const { toast } = useToast();
  const [pendingPayment, setPendingPayment] = useState<number | null>(null);

  const totalMinimumPayments = debts?.reduce((sum, debt) => sum + debt.minimum_payment, 0) ?? 0;

  // This function just updates local state without database update
  const setTempMonthlyPayment = (amount: number) => {
    setPendingPayment(amount);
  };

  // This function updates the database
  const updateMonthlyPayment = async (amount: number) => {
    if (!profile) return;

    console.log('Updating monthly payment in database:', {
      currentAmount: profile.monthly_payment,
      newAmount: amount,
      minimumPayments: totalMinimumPayments
    });

    try {
      await updateProfile.mutateAsync({
        ...profile,
        monthly_payment: amount
      });

      // Reset pending payment after successful update
      setPendingPayment(null);
      console.log('Monthly payment updated successfully:', amount);
    } catch (error) {
      console.error('Error updating monthly payment:', error);
      toast({
        title: "Error",
        description: "Failed to update monthly payment",
        variant: "destructive"
      });
    }
  };

  const resetMonthlyPayment = async () => {
    console.log('Resetting monthly payment to minimum:', totalMinimumPayments);
    await updateMonthlyPayment(totalMinimumPayments);
  };

  // Use pending payment if available, otherwise use profile payment or minimum
  const currentPayment = pendingPayment !== null
    ? pendingPayment
    : (profile?.monthly_payment ?? totalMinimumPayments);

  return {
    currentPayment,
    minimumPayment: totalMinimumPayments,
    extraPayment: Math.max(0, currentPayment - totalMinimumPayments),
    setTempMonthlyPayment,
    updateMonthlyPayment,
    resetMonthlyPayment,
    hasPendingChanges: pendingPayment !== null
  };
};
