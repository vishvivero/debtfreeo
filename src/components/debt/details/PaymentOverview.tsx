
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Debt } from "@/lib/types";
import { EarlyRepaymentDialog } from "../EarlyRepaymentDialog";
import { usePaymentHistory } from "@/hooks/use-payment-history";
import { useToast } from "@/hooks/use-toast";

interface PaymentOverviewProps {
  debt: Debt;
  totalPaid: number;
  totalInterest: number;
  currencySymbol: string;
  isPayable: boolean;
  minimumViablePayment: number;
}

export const PaymentOverview = ({
  debt,
  totalPaid,
  totalInterest,
  currencySymbol,
  isPayable,
  minimumViablePayment,
}: PaymentOverviewProps) => {
  const [showEarlyRepayment, setShowEarlyRepayment] = useState(false);
  const { recordPayment } = usePaymentHistory();
  const { toast } = useToast();

  const handlePaymentComplete = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been recorded successfully.",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-gray-500">Total Paid</dt>
            <dd className="text-2xl font-semibold">
              {currencySymbol}{totalPaid.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Total Interest Paid</dt>
            <dd className="text-2xl font-semibold">
              {currencySymbol}{totalInterest.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Remaining Balance</dt>
            <dd className="text-2xl font-semibold">
              {currencySymbol}{debt.balance.toLocaleString()}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Options</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Monthly Payment</p>
            <p className="text-2xl font-semibold">
              {currencySymbol}{debt.minimum_payment.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Button
              onClick={() => setShowEarlyRepayment(true)}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Make Early Repayment
            </Button>
          </div>
        </div>
      </Card>

      <EarlyRepaymentDialog
        isOpen={showEarlyRepayment}
        onClose={() => setShowEarlyRepayment(false)}
        debtId={debt.id}
        balance={debt.balance}
        currencySymbol={currencySymbol}
        onRepaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};
