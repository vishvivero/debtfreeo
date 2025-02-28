import { useProfile } from "@/hooks/use-profile";
import { useToast } from "@/components/ui/use-toast";
import { useDebts } from "@/hooks/use-debts";

export const useMonthlyPayment = () => {
  const { profile, updateProfile } = useProfile();
  const { debts } = useDebts();
  const { toast } = useToast();

  const totalMinimumPayments = debts?.reduce((sum, debt) => sum + debt.minimum_payment, 0) ?? 0;

  const updateMonthlyPayment = async (amount: number) => {
    if (!profile) return;

    console.log('Updating monthly payment:', {
      currentAmount: profile.monthly_payment,
      newAmount: amount,
      minimumPayments: totalMinimumPayments
    });

    try {
      await updateProfile.mutateAsync({
        ...profile,
        monthly_payment: amount
      });

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

  return {
    currentPayment: profile?.monthly_payment ?? totalMinimumPayments,
    minimumPayment: totalMinimumPayments,
    extraPayment: Math.max(0, (profile?.monthly_payment ?? totalMinimumPayments) - totalMinimumPayments),
    updateMonthlyPayment,
    resetMonthlyPayment
  };
};