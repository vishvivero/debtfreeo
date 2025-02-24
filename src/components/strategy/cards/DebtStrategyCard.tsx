
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentSchedule } from "@/components/debt/PaymentSchedule";
import { Debt } from "@/lib/types";
import { PayoffDetails } from "../types/payoff";

interface DebtStrategyCardProps {
  debt: Debt;
  index: number;
  allocation: number;
  payoffDetails: PayoffDetails;
  currencySymbol: string;
}

export const DebtStrategyCard = ({
  debt,
  index,
  allocation,
  payoffDetails,
  currencySymbol
}: DebtStrategyCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>{debt.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {debt.banker_name || "Not specified"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Balance:</p>
            <p className="text-lg font-semibold">
              {currencySymbol}{debt.balance.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interest Rate:</p>
            <p className="text-lg font-semibold">
              {debt.interest_rate}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Payment:</p>
            <p className="text-lg font-semibold">
              {currencySymbol}{allocation.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payoff Date:</p>
            <p className="text-lg font-semibold">
              {payoffDetails.payoffDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Payment Schedule</h4>
            <Badge 
              variant={debt.is_gold_loan ? "secondary" : index === 0 ? "default" : "outline"} 
              className="bg-blue-100 text-blue-700"
            >
              {debt.is_gold_loan ? 'Gold Loan' : index === 0 ? 'Priority' : 'Upcoming'}
            </Badge>
          </div>
          <PaymentSchedule
            payments={payoffDetails.payments}
            currencySymbol={currencySymbol}
          />
          {payoffDetails.redistributionHistory.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-semibold mb-2">Payment Boosts</h5>
              <div className="space-y-2">
                {payoffDetails.redistributionHistory.map((redist, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    +{currencySymbol}{redist.amount.toLocaleString()} from paid off debt in month {redist.month}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
