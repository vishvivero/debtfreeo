
import { useState, useEffect } from "react";
import { DecimalToggle } from "@/components/DecimalToggle";
import { PaymentOverviewSection } from "../PaymentOverviewSection";
import { useProfile } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";

interface ExtraPaymentsSectionProps {
  totalDebtValue: number;
  minimumPayment: number;
  currencySymbol: string;
  extraPayment: number;
  onExtraPaymentChange: (amount: number) => void;
}

export const ExtraPaymentsSection = ({
  totalDebtValue,
  minimumPayment,
  currencySymbol,
  extraPayment,
  onExtraPaymentChange
}: ExtraPaymentsSectionProps) => {
  const { profile, updateProfile } = useProfile();
  const [showExtraPayment, setShowExtraPayment] = useState(profile?.show_extra_payments || false);
  const [isExtraPaymentDialogOpen, setIsExtraPaymentDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setShowExtraPayment(profile.show_extra_payments || false);
    }
  }, [profile]);

  const handleExtraPaymentToggle = async (checked: boolean) => {
    console.log('Toggling extra payments:', checked);
    setShowExtraPayment(checked);
    if (profile) {
      try {
        await updateProfile.mutate({
          show_extra_payments: checked
        });
      } catch (error) {
        console.error('Error updating extra payments preference:', error);
        toast({
          title: "Error",
          description: "Failed to save your preference",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Want to pay off debt faster?</h3>
        <DecimalToggle
          showDecimals={showExtraPayment}
          onToggle={handleExtraPaymentToggle}
          label="Add Extra Payments"
          resetOnDisable={true}
        />
      </div>
      
      {showExtraPayment && (
        <PaymentOverviewSection
          totalMinimumPayments={minimumPayment}
          extraPayment={extraPayment}
          onExtraPaymentChange={onExtraPaymentChange}
          onOpenExtraPaymentDialog={() => setIsExtraPaymentDialogOpen(true)}
          currencySymbol={currencySymbol}
          totalDebtValue={totalDebtValue}
        />
      )}
    </div>
  );
};
