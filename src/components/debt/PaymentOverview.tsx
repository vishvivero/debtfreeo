
import { Debt } from "@/lib/types/debt";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { DollarSign, Percent, MinusCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface PaymentOverviewProps {
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
  minimumViablePayment 
}: PaymentOverviewProps) => {
  const principalReduction = totalPaid - totalInterest;
  const isInterestIncluded = debt.metadata?.interest_included === true;

  console.log('Payment overview calculations:', {
    totalPaid,
    totalInterest,
    principalReduction,
    debtId: debt.id,
    isPayable,
    minimumViablePayment,
    isInterestIncluded
  });

  const cards = [
    {
      title: "Total Paid",
      amount: totalPaid,
      icon: DollarSign,
      color: "emerald"
    },
    {
      title: isInterestIncluded ? "Interest (Included in Balance)" : "Interest Paid",
      amount: isInterestIncluded ? 0 : totalInterest,
      icon: Percent,
      color: "blue",
      tooltip: isInterestIncluded ? "Interest is pre-calculated and included in your balance" : undefined
    },
    {
      title: "Principal Reduction",
      amount: principalReduction,
      icon: MinusCircle,
      color: "violet"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Payment Overview</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full bg-${card.color}-500`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    {card.tooltip && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">{card.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <card.icon className={`h-5 w-5 text-${card.color}-500`} />
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {currencySymbol}{card.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {!isPayable && !isInterestIncluded && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600">
              This debt requires a minimum payment of at least {currencySymbol}{minimumViablePayment} 
              to begin reducing the principal balance.
            </p>
          </CardContent>
        </Card>
      )}
      
      {isInterestIncluded && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-blue-600">
              This loan has pre-calculated interest included in the balance. Your payments will go entirely toward paying down the combined principal and interest amount.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
