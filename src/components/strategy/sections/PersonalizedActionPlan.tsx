
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebts } from "@/hooks/use-debts";
import { useCurrency } from "@/hooks/use-currency";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { strategies } from "@/lib/strategies";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, ChevronRight, ChevronDown, ChevronUp, Rocket, BadgeCheck, Shield, Timer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionChecklistItem } from "./ActionChecklistItem";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

export const PersonalizedActionPlan = () => {
  const { debts, profile } = useDebts();
  const { convertToPreferredCurrency, formatCurrency } = useCurrency();
  const { currentPayment, extraPayment } = useMonthlyPayment();
  const { oneTimeFundings } = useOneTimeFunding();

  // Define the checklist items for each section
  const quickWinsItems = [
    {
      title: "Pay off your smallest debt first",
      description: "Eliminating a small debt will give you momentum.",
      defaultChecked: false
    },
    {
      title: "Set up automatic payments for all debts",
      description: "Track all your payments in one place and never miss a payment date.",
      defaultChecked: false
    },
    {
      title: "Use the budget tracker in your dashboard",
      description: "Identify areas where you can save more for debt payments.",
      defaultChecked: false,
      comingSoon: true
    },
    {
      title: "Set up payment reminders in the app",
      description: "Configure alerts to remind you before each payment is due.",
      defaultChecked: false,
      comingSoon: true
    }
  ];

  const priorityActionsItems = [
    {
      title: "Focus on high-interest debts first",
      description: "Stick to the payment order recommended by your strategy.",
      defaultChecked: false
    },
    {
      title: "Maintain your extra monthly payment",
      description: "This additional payment will save you significant interest.",
      defaultChecked: false
    },
    {
      title: "Schedule a monthly payment increase of 5%",
      description: "Gradually increase your payments for faster debt elimination.",
      defaultChecked: false
    }
  ];

  const financialStabilityItems = [
    {
      title: "Create an emergency fund goal",
      description: "Build a small emergency fund while paying down debt.",
      defaultChecked: false
    },
    {
      title: "Add upcoming windfalls as one-time payments",
      description: "Schedule tax refunds, bonuses, or other windfalls as one-time debt payments.",
      defaultChecked: false
    },
    {
      title: "Track monthly expenses in our expense tracker",
      description: "Identify one spending category to reduce each month.",
      defaultChecked: false,
      comingSoon: true
    },
    {
      title: "Set up savings goals alongside debt payments",
      description: "Balance debt repayment with small savings goals.",
      defaultChecked: false
    }
  ];

  const longTermHabitsItems = [
    {
      title: "Schedule monthly finance review sessions",
      description: "Set aside 30 minutes each month to review your progress.",
      defaultChecked: false
    },
    {
      title: "Enable quarterly strategy check-in reminders",
      description: "Review your debt strategy every three months to optimize your approach.",
      defaultChecked: false
    },
    {
      title: "Use the expense approval workflow",
      description: "Help avoid impulse buys that could add new debt.",
      defaultChecked: false,
      comingSoon: true
    }
  ];

  // State for collapsible sections - all closed by default
  const [openSections, setOpenSections] = useState({
    quickWins: false,
    priorityActions: false,
    financialStability: false,
    longTermHabits: false
  });

  // State for tracking completed items
  const [completionStatus, setCompletionStatus] = useState({
    quickWins: Array(quickWinsItems.length).fill(false),
    priorityActions: Array(priorityActionsItems.length).fill(false),
    financialStability: Array(financialStabilityItems.length).fill(false),
    longTermHabits: Array(longTermHabitsItems.length).fill(false)
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
      <Card className="mt-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-slate-900 dark:text-slate-100">Personalized Action Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 text-center">
              Add your debts to get personalized recommendations.
            </p>
            <Button 
              className="mt-4"
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
  const renderSectionHeader = (title: string, section: keyof typeof openSections, icon, itemCount: number) => {
    const percentage = getCompletionPercentage(section);
    const completedCount = completionStatus[section].filter(Boolean).length;
    
    return (
      <div className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">
              {title}
            </h3>
            <Badge variant="outline" className="ml-1 text-xs bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700">
              {completedCount}/{itemCount}
            </Badge>
          </div>
          <CollapsibleTrigger 
            onClick={() => toggleSection(section)}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            {openSections[section] ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </div>
        <div className="flex items-center gap-3 mt-2 mb-1">
          <div className="flex-1">
            <Progress 
              value={percentage} 
              className="h-1.5 bg-slate-100 dark:bg-slate-800"
              indicatorClassName={`${percentage === 100 ? 'bg-green-500' : 'bg-green-400'}`}
            />
          </div>
          <span className={`text-xs font-medium ${percentage === 100 ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  // Function to render an item with optional "Coming Soon" badge
  const renderActionItem = (item, section, index) => (
    <ActionChecklistItem
      key={`${section}-${index}`}
      title={item.title}
      description={item.description}
      onCheckedChange={(checked) => handleCheckChange(section, index, checked)}
      defaultChecked={completionStatus[section][index]}
      comingSoon={item.comingSoon}
    />
  );

  return (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden rounded-lg bg-white dark:bg-slate-900">
      <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Your Action Plan
          </CardTitle>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Debt-free by {payoffDateString}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-6 pt-2 pb-6 space-y-4">
          
          <Collapsible open={openSections.quickWins} className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              {renderSectionHeader("Quick Wins", "quickWins", <Rocket className="h-4 w-4 text-slate-500 dark:text-slate-400" />, quickWinsItems.length)}
            </div>
            <CollapsibleContent className="p-4 space-y-3">
              {smallBalanceDebts.length > 0 ? (
                <ActionChecklistItem
                  title={`Pay off your smallest debt: ${smallBalanceDebts[0].name}`}
                  description={`Eliminating this ${formatCurrency(smallBalanceDebts[0].balance)} debt will give you momentum.`}
                  onCheckedChange={(checked) => handleCheckChange("quickWins", 0, checked)}
                  defaultChecked={completionStatus.quickWins[0]}
                />
              ) : (
                <ActionChecklistItem
                  title={quickWinsItems[0].title}
                  description={quickWinsItems[0].description}
                  onCheckedChange={(checked) => handleCheckChange("quickWins", 0, checked)}
                  defaultChecked={completionStatus.quickWins[0]}
                />
              )}
              {quickWinsItems.slice(1).map((item, index) => (
                renderActionItem(item, "quickWins", index + 1)
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.priorityActions} className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              {renderSectionHeader("Priority Actions", "priorityActions", <BadgeCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />, priorityActionsItems.length)}
            </div>
            <CollapsibleContent className="p-4 space-y-3">
              <ActionChecklistItem
                title={getStrategyActionText()}
                description="Stick to the payment order recommended by this strategy."
                onCheckedChange={(checked) => handleCheckChange("priorityActions", 0, checked)}
                defaultChecked={completionStatus.priorityActions[0]}
              />
              {extraPayment > 0 && (
                <ActionChecklistItem
                  title={`Maintain your extra payment of ${formatCurrency(extraPayment)}/month`}
                  description={`This additional payment will save you approximately ${formatCurrency(interestSavings)} in interest.`}
                  onCheckedChange={(checked) => handleCheckChange("priorityActions", 1, checked)}
                  defaultChecked={completionStatus.priorityActions[1]}
                />
              )}
              <ActionChecklistItem
                title="Schedule a monthly payment increase of 5%"
                description="Gradually increase your payments for faster debt elimination."
                onCheckedChange={(checked) => handleCheckChange("priorityActions", 2, checked)}
                defaultChecked={completionStatus.priorityActions[2]}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.financialStability} className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              {renderSectionHeader("Financial Stability", "financialStability", <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400" />, financialStabilityItems.length)}
            </div>
            <CollapsibleContent className="p-4 space-y-3">
              {financialStabilityItems.map((item, index) => (
                renderActionItem(item, "financialStability", index)
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.longTermHabits} className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              {renderSectionHeader("Long-Term Habits", "longTermHabits", <Timer className="h-4 w-4 text-slate-500 dark:text-slate-400" />, longTermHabitsItems.length)}
            </div>
            <CollapsibleContent className="p-4 space-y-3">
              {longTermHabitsItems.map((item, index) => (
                renderActionItem(item, "longTermHabits", index)
              ))}
            </CollapsibleContent>
          </Collapsible>
          
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-800/20 py-4 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center text-sm">
            <CircleDollarSign className="h-4 w-4 mr-1.5 text-green-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {formatCurrency(interestSavings)}
            </span>
            <span className="ml-1 text-slate-500 dark:text-slate-400 text-xs">potential interest savings</span>
          </div>
          <Button
            className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm h-9 px-3 py-2"
            onClick={() => window.location.href = "/strategy"}
          >
            Update Strategy
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
