
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebts } from "@/hooks/use-debts";
import { useCurrency } from "@/hooks/use-currency";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { strategies } from "@/lib/strategies";
import { Badge } from "@/components/ui/badge";
import { 
  CircleDollarSign, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  Clock,
  Award,
  Rocket,
  BadgeCheck,
  Lightbulb,
  Shield,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionChecklistItem } from "./ActionChecklistItem";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

export const PersonalizedActionPlan = () => {
  const { debts, profile } = useDebts();
  const { convertToPreferredCurrency, formatCurrency } = useCurrency();
  const { currentPayment, extraPayment } = useMonthlyPayment();
  const { oneTimeFundings } = useOneTimeFunding();

  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    quickWins: true,
    priorityActions: true,
    financialStability: true,
    longTermHabits: true
  });

  // State for tracking completed items
  const [completionStatus, setCompletionStatus] = useState({
    quickWins: [false, false, false, false],
    priorityActions: [false, false, false, false],
    financialStability: [false, false, false, false],
    longTermHabits: [false, false, false, false]
  });

  // Calculate completion percentages
  const getCompletionPercentage = (section) => {
    const completedCount = completionStatus[section].filter(Boolean).length;
    const totalCount = completionStatus[section].length;
    return (completedCount / totalCount) * 100;
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };

  // Handle checkbox changes
  const handleCheckChange = (section, index, checked) => {
    const newStatus = { ...completionStatus };
    newStatus[section][index] = checked;
    setCompletionStatus(newStatus);
  };

  // Safety check for undefined debts
  if (!debts || debts.length === 0) {
    return (
      <Card className="mt-4 border border-indigo-100 dark:border-indigo-800/30 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500/90 to-purple-600/90 dark:from-indigo-700 dark:to-purple-800 text-white">
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-white/90" />
            Personalized Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-white/90 dark:bg-slate-900/90">
          <div className="flex flex-col items-center justify-center py-6">
            <Lightbulb className="h-12 w-12 text-indigo-400 mb-4" />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 text-center">
              Add your debts to get personalized recommendations.
            </p>
            <Button 
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              onClick={() => window.location.href = "/overview"}
            >
              Go to Dashboard
            </Button>
          </div>
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

  // Get strategy-specific action text
  const getStrategyActionText = () => {
    switch (selectedStrategy.id) {
      case 'avalanche':
        return `Follow your ${selectedStrategy.name} strategy by focusing on high-interest debts first`;
      case 'snowball':
        return `Follow your ${selectedStrategy.name} strategy by paying off small debts first`;
      case 'balance-ratio':
        return `Follow your ${selectedStrategy.name} strategy for optimal debt elimination`;
      default:
        return `Follow your ${selectedStrategy.name} strategy consistently`;
    }
  };

  // Get strategy-specific setup text
  const getStrategySetupText = () => {
    switch (selectedStrategy.id) {
      case 'avalanche':
        return "Configure automatic payment redistribution to highest-interest debts";
      case 'snowball':
        return "Set up your debt snowball in the app";
      case 'balance-ratio':
        return "Configure your balanced payment approach in the app";
      default:
        return "Configure your payment strategy in the app";
    }
  };

  // Renders a section header with a toggle button and progress bar
  const renderSectionHeader = (title: string, section: keyof typeof openSections, icon) => {
    const percentage = getCompletionPercentage(section);
    const itemCount = completionStatus[section].length;
    const completedCount = completionStatus[section].filter(Boolean).length;
    
    return (
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h3>
            <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/50">
              {completedCount}/{itemCount} complete
            </Badge>
          </div>
          <CollapsibleTrigger 
            onClick={() => toggleSection(section)}
            className="p-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400 transition-colors"
          >
            {openSections[section] ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </CollapsibleTrigger>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <Progress 
              value={percentage} 
              className="h-2 bg-indigo-100 dark:bg-indigo-950/50"
              indicatorClassName={`${percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
            />
          </div>
          <span className={`text-sm font-medium ${percentage === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-xl border-0 overflow-hidden rounded-xl bg-white dark:bg-slate-900">
      <CardHeader className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 p-8 pb-12 relative">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Your Personalized Action Plan
              </CardTitle>
              <p className="text-indigo-100 dark:text-indigo-200 text-lg">
                Follow these steps to become debt-free by {payoffDateString}
              </p>
            </div>
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 py-2 px-4 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4 mr-1.5" />
              {yearsToDebtFree > 0 ? `${yearsToDebtFree} year${yearsToDebtFree > 1 ? 's' : ''}` : ''}
              {yearsToDebtFree > 0 && remainingMonths > 0 ? ' and ' : ''}
              {remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}
              {yearsToDebtFree === 0 && remainingMonths === 0 ? 'Less than a month' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="absolute -top-6 left-0 right-0 h-12 bg-white dark:bg-slate-900 rounded-t-3xl"></div>
        <div className="relative px-8 pt-4 pb-8 space-y-6">
          
          <Collapsible open={openSections.quickWins} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
              {renderSectionHeader("Quick Wins", "quickWins", <Rocket className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />)}
            </div>
            <CollapsibleContent className="p-6 space-y-4">
              {smallBalanceDebts.length > 0 && (
                <ActionChecklistItem
                  title={`Pay off your smallest debt: ${smallBalanceDebts[0].name}`}
                  description={`Eliminating this ${formatCurrency(smallBalanceDebts[0].balance)} debt will give you momentum and reduce your monthly obligations.`}
                  onCheckedChange={(checked) => handleCheckChange("quickWins", 0, checked)}
                  defaultChecked={completionStatus.quickWins[0]}
                />
              )}
              <ActionChecklistItem
                title="Set up automatic payments for all debts within the app"
                description="Track all your payments in one place and ensure you never miss a payment date."
                onCheckedChange={(checked) => handleCheckChange("quickWins", 1, checked)}
                defaultChecked={completionStatus.quickWins[1]}
              />
              <ActionChecklistItem
                title="Use the budget tracker in your dashboard"
                description="Our built-in budget tracking feature helps identify areas where you can save more for debt payments."
                onCheckedChange={(checked) => handleCheckChange("quickWins", 2, checked)}
                defaultChecked={completionStatus.quickWins[2]}
              />
              <ActionChecklistItem
                title="Set up payment reminders in the app"
                description="Configure alerts to remind you before each payment is due to avoid late fees."
                onCheckedChange={(checked) => handleCheckChange("quickWins", 3, checked)}
                defaultChecked={completionStatus.quickWins[3]}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.priorityActions} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
              {renderSectionHeader("Priority Actions", "priorityActions", <BadgeCheck className="h-5 w-5 text-purple-500 dark:text-purple-400" />)}
            </div>
            <CollapsibleContent className="p-6 space-y-4">
              <ActionChecklistItem
                title={getStrategyActionText()}
                description={`Stick to the payment order recommended by this strategy for maximum impact on your debts.`}
                onCheckedChange={(checked) => handleCheckChange("priorityActions", 0, checked)}
                defaultChecked={completionStatus.priorityActions[0]}
              />
              {extraPayment > 0 && (
                <ActionChecklistItem
                  title={`Maintain your extra payment of ${formatCurrency(extraPayment)}/month`}
                  description={`This additional payment will save you approximately ${formatCurrency(interestSavings)} in interest over time.`}
                  onCheckedChange={(checked) => handleCheckChange("priorityActions", 1, checked)}
                  defaultChecked={completionStatus.priorityActions[1]}
                />
              )}
              <ActionChecklistItem
                title="Schedule a monthly payment increase of 5%"
                description="Use our payment scheduler to gradually increase your payments for faster debt elimination."
                onCheckedChange={(checked) => handleCheckChange("priorityActions", 2, checked)}
                defaultChecked={completionStatus.priorityActions[2]}
              />
              <ActionChecklistItem
                title={getStrategySetupText()}
                description="Use our app to automatically redirect freed-up payments toward your next target debt."
                onCheckedChange={(checked) => handleCheckChange("priorityActions", 3, checked)}
                defaultChecked={completionStatus.priorityActions[3]}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.financialStability} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 to-emerald-50/50 dark:from-blue-950/20 dark:to-emerald-950/20">
              {renderSectionHeader("Financial Stability", "financialStability", <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400" />)}
            </div>
            <CollapsibleContent className="p-6 space-y-4">
              <ActionChecklistItem
                title="Create an emergency fund goal in your profile"
                description="Use our goal-setting feature to build a small emergency fund while paying down debt."
                onCheckedChange={(checked) => handleCheckChange("financialStability", 0, checked)}
                defaultChecked={completionStatus.financialStability[0]}
              />
              <ActionChecklistItem
                title="Add upcoming windfalls as one-time payments"
                description="Plan ahead by scheduling any tax refunds, bonuses, or other expected windfalls as one-time debt payments."
                onCheckedChange={(checked) => handleCheckChange("financialStability", 1, checked)}
                defaultChecked={completionStatus.financialStability[1]}
              />
              <ActionChecklistItem
                title="Track monthly expenses in our expense tracker"
                description="Identify one spending category to reduce each month using our expense analysis tools."
                onCheckedChange={(checked) => handleCheckChange("financialStability", 2, checked)}
                defaultChecked={completionStatus.financialStability[2]}
              />
              <ActionChecklistItem
                title="Set up savings goals alongside debt payments"
                description="Balance debt repayment with small savings goals using our dual-purpose financial planner."
                onCheckedChange={(checked) => handleCheckChange("financialStability", 3, checked)}
                defaultChecked={completionStatus.financialStability[3]}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.longTermHabits} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 to-indigo-50/50 dark:from-emerald-950/20 dark:to-indigo-950/20">
              {renderSectionHeader("Long-Term Habits", "longTermHabits", <Timer className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />)}
            </div>
            <CollapsibleContent className="p-6 space-y-4">
              <ActionChecklistItem
                title="Schedule monthly finance review sessions in the calendar"
                description="Use our integrated calendar to set aside 30 minutes each month to review your progress and adjust your plan."
                onCheckedChange={(checked) => handleCheckChange("longTermHabits", 0, checked)}
                defaultChecked={completionStatus.longTermHabits[0]}
              />
              <ActionChecklistItem
                title="Enable quarterly strategy check-in reminders"
                description="Let the app remind you to review your debt strategy every three months to optimize your approach."
                onCheckedChange={(checked) => handleCheckChange("longTermHabits", 1, checked)}
                defaultChecked={completionStatus.longTermHabits[1]}
              />
              <ActionChecklistItem
                title="Use the expense approval workflow for non-essential purchases"
                description="Enable our purchase consideration feature to help avoid impulse buys that could add new debt."
                onCheckedChange={(checked) => handleCheckChange("longTermHabits", 2, checked)}
                defaultChecked={completionStatus.longTermHabits[2]}
              />
              <ActionChecklistItem
                title="Activate automated saving allocations for future expenses"
                description="Set up automatic saving rules for predictable expenses to avoid using credit for these costs."
                onCheckedChange={(checked) => handleCheckChange("longTermHabits", 3, checked)}
                defaultChecked={completionStatus.longTermHabits[3]}
              />
            </CollapsibleContent>
          </Collapsible>
          
        </div>
      </CardContent>
      <CardFooter className="bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900/90 dark:to-indigo-950/20 py-6 px-8 border-t border-indigo-100/50 dark:border-indigo-800/30">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center text-sm">
            <CircleDollarSign className="h-5 w-5 mr-2 text-emerald-500" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(interestSavings)}
            </span>
            <span className="ml-1 text-slate-600 dark:text-slate-400">potential interest savings</span>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
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
