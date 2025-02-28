
import { Debt } from "@/lib/types/debt";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "./CircularProgress";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { DollarSign, Calendar, Tag, Info } from "lucide-react";
import { InterestCalculator } from "@/lib/services/calculations/core/InterestCalculator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DebtHeroSectionProps {
  debt: Debt;
  totalPaid: number;
  payoffDate: Date;
  currencySymbol: string;
}

export const DebtHeroSection = ({ debt, totalPaid, payoffDate, currencySymbol }: DebtHeroSectionProps) => {
  // Calculate progress percentage based on total paid vs current balance
  const totalAmount = totalPaid + debt.balance;
  const progressPercentage = totalAmount > 0 
    ? Math.min(Math.round((totalPaid / totalAmount) * 100), 100)
    : 0;

  // Check if this is a loan with interest included
  const isInterestIncluded = debt.metadata?.interest_included === true;
  const remainingMonths = debt.metadata?.remaining_months;
  
  // Calculate principal for loans with interest included
  const calculatedPrincipal = isInterestIncluded && remainingMonths
    ? InterestCalculator.calculatePrincipalFromTotal(
        debt.balance,
        debt.interest_rate,
        debt.minimum_payment,
        remainingMonths
      )
    : null;

  console.log('Progress calculation:', {
    totalPaid,
    currentBalance: debt.balance,
    totalAmount,
    progressPercentage,
    isInterestIncluded,
    calculatedPrincipal,
    debtCurrency: debt.currency_symbol,
    displayCurrency: currencySymbol
  });

  // Determine what to display as the balance
  const displayBalance = isInterestIncluded && calculatedPrincipal 
    ? calculatedPrincipal 
    : debt.balance;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-6 md:grid-cols-2"
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{debt.name}</h1>
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <Tag className="h-4 w-4" />
            <span>Debt Category: {debt.category}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  {isInterestIncluded && calculatedPrincipal && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-blue-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white">
                          <p className="text-sm">
                            {isInterestIncluded 
                              ? `Showing principal amount only (total with interest: ${currencySymbol}${debt.balance.toLocaleString()})` 
                              : 'Current outstanding balance'
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-lg font-semibold">
                  {currencySymbol}{displayBalance.toLocaleString()}
                </p>
                {isInterestIncluded && calculatedPrincipal && (
                  <span className="text-xs text-blue-600">
                    Principal only (interest excluded)
                  </span>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-600">Payoff Date</p>
                <p className="text-lg font-semibold">
                  {format(payoffDate, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-center md:justify-end items-center">
        <CircularProgress
          percentage={progressPercentage}
          size={200}
          strokeWidth={20}
          circleColor="stroke-emerald-500"
          label={`${progressPercentage}% Paid`}
        />
      </div>
    </motion.div>
  );
};
