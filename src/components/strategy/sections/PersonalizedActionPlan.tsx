
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
                title="Set up automatic payments for all debts within the app"
                description="Track all your payments in one place and ensure you never miss a payment date."
              />
              <ActionChecklistItem
                title="Use the budget tracker in your dashboard"
                description="Our built-in budget tracking feature helps identify areas where you can save more for debt payments."
              />
              <ActionChecklistItem
                title="Set up payment reminders in the app"
                description="Configure alerts to remind you before each payment is due to avoid late fees."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Priority Actions</h3>
            <div className="space-y-3">
              <ActionChecklistItem
                title={`Follow your ${selectedStrategy.name} strategy consistently`}
                description={`Stick to the payment order recommended by this strategy for maximum impact on your debts.`}
              />
              {extraPayment > 0 && (
                <ActionChecklistItem
                  title={`Maintain your extra payment of ${formatCurrency(extraPayment)}/month`}
                  description={`This additional payment will save you approximately ${formatCurrency(interestSavings)} in interest over time.`}
                />
              )}
              <ActionChecklistItem
                title="Schedule a monthly payment increase of 5%"
                description="Use our payment scheduler to gradually increase your payments for faster debt elimination."
              />
              <ActionChecklistItem
                title="Set up your debt snowball in the app"
                description="Configure your account to automatically redirect freed-up payments toward your next target debt."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Financial Stability</h3>
            <div className="space-y-3">
              <ActionChecklistItem
                title="Create an emergency fund goal in your profile"
                description="Use our goal-setting feature to build a small emergency fund while paying down debt."
              />
              <ActionChecklistItem
                title="Add upcoming windfalls as one-time payments"
                description="Plan ahead by scheduling any tax refunds, bonuses, or other expected windfalls as one-time debt payments."
              />
              <ActionChecklistItem
                title="Track monthly expenses in our expense tracker"
                description="Identify one spending category to reduce each month using our expense analysis tools."
              />
              <ActionChecklistItem
                title="Set up savings goals alongside debt payments"
                description="Balance debt repayment with small savings goals using our dual-purpose financial planner."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Long-Term Habits</h3>
            <div className="space-y-3">
              <ActionChecklistItem
                title="Schedule monthly finance review sessions in the calendar"
                description="Use our integrated calendar to set aside 30 minutes each month to review your progress and adjust your plan."
              />
              <ActionChecklistItem
                title="Enable quarterly strategy check-in reminders"
                description="Let the app remind you to review your debt strategy every three months to optimize your approach."
              />
              <ActionChecklistItem
                title="Use the expense approval workflow for non-essential purchases"
                description="Enable our purchase consideration feature to help avoid impulse buys that could add new debt."
              />
              <ActionChecklistItem
                title="Activate automated saving allocations for future expenses"
                description="Set up automatic saving rules for predictable expenses to avoid using credit for these costs."
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
