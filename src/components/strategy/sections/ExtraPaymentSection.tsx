
import { DecimalToggle } from "@/components/DecimalToggle";
import { PaymentOverviewSection } from "../PaymentOverviewSection";

interface ExtraPaymentSectionProps {
  showExtraPayment: boolean;
  onToggleExtraPayment: (checked: boolean) => void;
  minimumPayment: number;
  extraPayment: number;
  updateMonthlyPayment: (amount: number) => void;
  onOpenExtraPaymentDialog: () => void;
  preferredCurrency?: string;
  totalDebtValue: number;
}

export const ExtraPaymentSection = ({
  showExtraPayment,
  onToggleExtraPayment,
  minimumPayment,
  extraPayment,
  updateMonthlyPayment,
  onOpenExtraPaymentDialog,
  preferredCurrency,
  totalDebtValue
}: ExtraPaymentSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Want to pay off debt faster?</h3>
        <DecimalToggle
          showDecimals={showExtraPayment}
          onToggle={onToggleExtraPayment}
          label="Add Extra Payments"
          resetOnDisable={true}
        />
      </div>
      
      {showExtraPayment && (
        <PaymentOverviewSection
          totalMinimumPayments={minimumPayment}
          extraPayment={extraPayment}
          onExtraPaymentChange={amount => updateMonthlyPayment(amount + minimumPayment)}
          onOpenExtraPaymentDialog={onOpenExtraPaymentDialog}
          currencySymbol={preferredCurrency}
          totalDebtValue={totalDebtValue}
        />
      )}
    </div>
  );
};
