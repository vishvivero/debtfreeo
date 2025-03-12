
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebts } from "@/hooks/use-debts";
import { useCurrency } from "@/hooks/use-currency";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { strategies } from "@/lib/strategies";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionChecklistItem } from "./ActionChecklistItem";

export const PersonalizedActionPlan = () => {
  const { debts, profile } = useDebts();
  const { convertToPreferredCurrency, formatCurrency } = useCurrency();
  const { currentPayment, extraPayment } = useMonthlyPayment();
  const { oneTimeFundings } = useOneTimeFunding();

  // Safety check for undefined debts
  if (!debts || debts.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Personalized Action Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Add your debts to get personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get the selected strategy
  const selectedStrategyId = profile?.selected_strategy || strategies[0].id;
  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId) || strategies[0];

  // Calculate total debt
  const totalDebt = debts.reduce((sum, debt) => sum + convertToPreferredCurrency(debt.balance, debt.currency_symbol), 0);

  // Calculate timeline
  const { timelineResults } = useDebtTimeline(
    debts,
    currentPayment,
    selectedStrategy,
    oneTimeFundings
  );

  // Pre-calculate some debt stats
  const maxInterestRate = Math.max(...debts.map(debt => debt.interest_rate));
  const avgInterestRate = debts.reduce((sum, debt) => sum + (debt.interest_rate * debt.balance), 0) / totalDebt;
  const hasHighInterest = maxInterestRate > 15;
  
  // Time to debt free in months
  const monthsToDebtFree = timelineResults?.acceleratedMonths || 0;
  const yearsToDebtFree = Math.floor(monthsToDebtFree / 12);
  const remainingMonths = monthsToDebtFree % 12;
  
  // Determine payoff date
  const payoffDate = timelineResults?.payoffDate || new Date();
  const payoffDateString = payoffDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  
  // Potential interest savings
  const interestSavings = timelineResults?.interestSaved || 0;

  // Calculate monthly savings metrics
  const totalMinimumPayments = debts.reduce((sum, debt) => 
    sum + convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol), 0);
  const monthlySavingsTarget = Math.max(0, currentPayment - totalMinimumPayments);

  // Sort debts by interest rate (high to low)
  const highInterestDebts = [...debts]
    .sort((a, b) => b.interest_rate - a.interest_rate)
    .filter(debt => debt.interest_rate > 10);

  // Sort debts by balance (low to high) for small wins
  const smallBalanceDebts = [...debts]
    .sort((a, b) => a.balance - b.balance)
    .filter(debt => debt.balance < totalDebt * 0.1);

  return (
    <Card className="bg-white dark:bg-slate-950 rounded-lg shadow-md overflow-hidden border">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Your Personalized Action Plan
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">
              Follow these steps to become debt-free by {payoffDateString}
            </p>
          </div>
          <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 text-indigo-600 dark:text-indigo-400 font-medium px-3 py-1 rounded-full">
            {yearsToDebtFree > 0 ? `${yearsToDebtFree} year${yearsToDebtFree > 1 ? 's' : ''}` : ''}
            {yearsToDebtFree > 0 && remainingMonths > 0 ? ' and ' : ''}
            {remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}
            {yearsToDebtFree === 0 && remainingMonths === 0 ? 'Less than a month' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Quick Wins</h3>
            <div className="space-y-3">
              {smallBalanceDebts.length > 0 && (
                <ActionChecklistItem
                  title={`Pay off your smallest debt: ${smallBalanceDebts[0].name}`}
                  description={`Eliminating this ${formatCurrency(smallBalanceDebts[0].balance)} debt will give you momentum and reduce your monthly obligations.`}
                />
              )}
              <ActionChecklistItem
                title="Set up automatic payments for all minimum payments"
                description="Ensure you never miss a payment and avoid late fees that can add to your debt."
              />
              <ActionChecklistItem
                title="Create a budget spreadsheet or use a budgeting app"
                description="Track all income and expenses to understand your cash flow better and find areas to save."
              />
              <ActionChecklistItem
                title="Identify and cancel unused subscriptions"
                description="Redirect these savings toward your debt payoff strategy for faster results."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Priority Actions</h3>
            <div className="space-y-3">
              <ActionChecklistItem
                title={`Follow your ${selectedStrategy.name} strategy consistently`}
                description={`Stick to the payment order this strategy recommends for maximum impact on your debts.`}
              />
              {extraPayment > 0 && (
                <ActionChecklistItem
                  title={`Maintain your extra payment of ${formatCurrency(extraPayment)}/month`}
                  description={`This additional payment will save you approximately ${formatCurrency(interestSavings)} in interest over time.`}
                />
              )}
              {hasHighInterest && highInterestDebts.length > 0 && (
                <ActionChecklistItem
                  title={`Contact ${highInterestDebts[0].name} to negotiate a lower rate`}
                  description={`This ${highInterestDebts[0].interest_rate}% interest debt is costing you significantly. Even a small rate reduction can save money.`}
                />
              )}
              <ActionChecklistItem
                title="Research balance transfer options for high-interest debt"
                description="Look for 0% promotional offers to reduce interest costs while you pay down the balance."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Financial Stability</h3>
            <div className="space-y-3">
              <ActionChecklistItem
                title="Build a small emergency fund (£1,000)"
                description="This prevents new debt when unexpected expenses arise and protects your debt payoff plan."
              />
              <ActionChecklistItem
                title="Review your insurance coverage"
                description="Ensure you have adequate protection while looking for ways to reduce premiums."
              />
              <ActionChecklistItem
                title="Identify one expense category to reduce"
                description="Find at least one spending area where you can trim costs and redirect to debt payments."
              />
              <ActionChecklistItem
                title="Create a plan for windfalls and bonuses"
                description="Decide in advance what percentage of any unexpected income will go toward debt repayment."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Long-Term Habits</h3>
            <div className="space-y-3">
              <ActionChecklistItem
                title="Schedule monthly finance review sessions"
                description="Set aside 30 minutes each month to track progress and adjust your plan as needed."
              />
              <ActionChecklistItem
                title="Set quarterly debt strategy check-ins"
                description="Every three months, review your approach and make adjustments based on your progress."
              />
              <ActionChecklistItem
                title="Create a system to avoid new debt"
                description="Implement a 48-hour waiting period before any non-essential purchases."
              />
              <ActionChecklistItem
                title="Set up automatic saving for future expenses"
                description="Start saving small amounts for predictable expenses to avoid using credit cards."
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/10 dark:to-blue-950/10 py-4 px-6">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <CircleDollarSign className="h-4 w-4 mr-2 text-emerald-500" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(interestSavings)}
            </span>
            <span className="ml-1">potential interest savings</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-900/50 dark:hover:bg-indigo-950/30"
            onClick={() => window.location.href = "/strategy"}
          >
            Update Your Strategy
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
