
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useDebts } from "@/hooks/use-debts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, CheckCircle, ChevronDown, ChevronRight, CircleDollarSign, ExternalLink, HandCoins, HelpCircle, LucideIcon, PiggyBank, Plus, RefreshCw, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { strategies } from "@/lib/strategies";
import { useCurrency } from "@/hooks/use-currency";
import { useMonthlyPayment } from "@/hooks/use-monthly-payment";
import { useOneTimeFunding } from "@/hooks/use-one-time-funding";
import { useDebtTimeline } from "@/hooks/use-debt-timeline";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const PersonalizedActionPlan = () => {
  const { debts, profile } = useDebts();
  const { convertToPreferredCurrency, formatCurrency } = useCurrency();
  const { currentPayment, extraPayment } = useMonthlyPayment();
  const { oneTimeFundings } = useOneTimeFunding();
  const [selectedTab, setSelectedTab] = useState("priority");
  const [openDialog, setOpenDialog] = useState<string | null>(null);

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

  // Calculate monthly savings metrics
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + convertToPreferredCurrency(debt.minimum_payment, debt.currency_symbol), 0);
  const monthlySavingsTarget = Math.max(0, currentPayment - totalMinimumPayments);
  const hasExtraPayment = extraPayment > 0;

  // Sort debts by interest rate (high to low)
  const highInterestDebts = [...debts]
    .sort((a, b) => b.interest_rate - a.interest_rate)
    .filter(debt => debt.interest_rate > 10);

  // Sort debts by balance (low to high) for small wins
  const smallBalanceDebts = [...debts]
    .sort((a, b) => a.balance - b.balance)
    .filter(debt => a.balance < totalDebt * 0.1);

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

  // Render action steps based on the selected tab
  const renderActionSteps = () => {
    switch (selectedTab) {
      case "priority":
        return (
          <div className="space-y-4">
            <ActionStep
              icon={Target}
              title="Follow Your Strategy"
              description={`Stick to the ${selectedStrategy.name} strategy to maximize your progress.`}
              actionText="How It Works"
              onAction={() => setOpenDialog("strategy")}
            />
            {hasExtraPayment && (
              <ActionStep
                icon={TrendingUp}
                title="Maintain Extra Payments"
                description={`Continue your extra payment of ${formatCurrency(extraPayment)}/month to stay ahead.`}
                actionText="Impact Details"
                onAction={() => setOpenDialog("extraPayment")}
              />
            )}
            {oneTimeFundings.length > 0 && (
              <ActionStep
                icon={PiggyBank}
                title="Apply Your Planned Lump Sums"
                description={`You have ${oneTimeFundings.length} future payment${oneTimeFundings.length > 1 ? 's' : ''} scheduled.`}
                actionText="View Timeline"
                onAction={() => window.location.href = "/strategy"}
              />
            )}
            {hasHighInterest && (
              <ActionStep
                icon={CircleDollarSign}
                title="Address High Interest Debts"
                description="You have debts with very high interest rates that need attention."
                actionText="View Details"
                onAction={() => setOpenDialog("highInterest")}
              />
            )}
          </div>
        );

      case "quick-wins":
        return (
          <div className="space-y-4">
            {smallBalanceDebts.length > 0 ? (
              <ActionStep
                icon={CheckCircle}
                title="Eliminate Small Balances"
                description={`Pay off your ${smallBalanceDebts.length} smallest debt${smallBalanceDebts.length > 1 ? 's' : ''} first for quick wins.`}
                actionText="View Details"
                onAction={() => setOpenDialog("smallBalances")}
              />
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground">
                  You don't have any small balance debts to target right now.
                </p>
              </div>
            )}
          </div>
        );

      case "long-term":
        return (
          <div className="space-y-4">
            <ActionStep
              icon={PiggyBank}
              title="Build Emergency Fund"
              description="Aim to save 3-6 months of expenses while paying down debt."
              actionText="Learn More"
              onAction={() => setOpenDialog("emergencyFund")}
            />
            <ActionStep
              icon={ShieldCheck}
              title="Review Insurance Coverage"
              description="Ensure adequate insurance while reducing monthly premiums."
              actionText="Tips"
              onAction={() => setOpenDialog("insurance")}
            />
            <ActionStep
              icon={RefreshCw}
              title="Create Regular Review Schedule"
              description="Set calendar reminders to review your debt plan quarterly."
              actionText="Why It Matters"
              onAction={() => setOpenDialog("reviewSchedule")}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
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
        <CardContent className="p-0">
          <div className="px-6 pt-4 pb-0">
            <Tabs defaultValue="priority" onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="priority">Priority Actions</TabsTrigger>
                <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
                <TabsTrigger value="long-term">Long-Term Goals</TabsTrigger>
              </TabsList>
              <TabsContent value={selectedTab} className="pt-4 pb-2 min-h-[200px]">
                {renderActionSteps()}
              </TabsContent>
            </Tabs>
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

      {/* Strategy Dialog */}
      <Dialog open={openDialog === "strategy"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedStrategy.name} Strategy</DialogTitle>
            <DialogDescription>
              How this strategy works to accelerate your debt payoff
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>{selectedStrategy.description}</p>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-semibold mb-2">Key Benefits:</h4>
              <ul className="space-y-2">
                {selectedStrategy.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extra Payment Dialog */}
      <Dialog open={openDialog === "extraPayment"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Extra Payment Impact</DialogTitle>
            <DialogDescription>
              How your additional payments accelerate debt freedom
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Your extra payment of {formatCurrency(extraPayment)}/month beyond the minimum payments creates a powerful compounding effect:
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <div className="flex items-center">
                  <span className="h-8 w-8 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 rounded-full mr-3">
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  <span>Reduces total interest paid</span>
                </div>
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/50 text-emerald-600">
                  {formatCurrency(interestSavings)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-center">
                  <span className="h-8 w-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-full mr-3">
                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </span>
                  <span>Shortens payoff timeline</span>
                </div>
                <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/50 text-blue-600">
                  {timelineResults?.monthsSaved || 0} months
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* High Interest Dialog */}
      <Dialog open={openDialog === "highInterest"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>High Interest Debts {{'>'}} 10%</DialogTitle>
            <DialogDescription>
              These high-interest debts require priority attention
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px] pr-4">
            <div className="space-y-3">
              {highInterestDebts.map((debt) => (
                <div key={debt.id} className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{debt.name}</span>
                    <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/50 text-amber-600">
                      {debt.interest_rate}%
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Balance: {formatCurrency(debt.balance)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t pt-4 mt-2">
            <h4 className="font-semibold mb-3">Action Steps:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Check if you qualify for any balance transfer offers with lower rates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Contact lenders directly to negotiate lower interest rates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Focus extra payments on highest interest debts first</span>
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Small Balances Dialog */}
      <Dialog open={openDialog === "smallBalances"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Small Balance Quick Wins</DialogTitle>
            <DialogDescription>
              Paying off these small debts first creates momentum
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px] pr-4">
            <div className="space-y-3">
              {smallBalanceDebts.map((debt) => (
                <div key={debt.id} className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{debt.name}</span>
                    <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/50 text-emerald-600">
                      {formatCurrency(debt.balance)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Min payment: {formatCurrency(debt.minimum_payment)}</span>
                    <span>Rate: {debt.interest_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t pt-4 mt-2">
            <h4 className="font-semibold mb-3">Benefits of the Small Wins Approach:</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Creates psychological momentum and motivation</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Reduces the number of monthly payments to manage</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Frees up cash flow faster for bigger debts</span>
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Fund Dialog */}
      <Dialog open={openDialog === "emergencyFund"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Building Your Emergency Fund</DialogTitle>
            <DialogDescription>
              Financial security while paying down debt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              An emergency fund prevents you from taking on new debt when unexpected expenses arise.
            </p>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-semibold mb-2">Recommended Steps:</h4>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Start with a mini fund of £1,000 while paying down high-interest debt</li>
                <li>Once high-interest debt is gone, build to 3-6 months of expenses</li>
                <li>Keep your emergency fund in a high-yield savings account</li>
                <li>Only use it for true emergencies, not planned expenses</li>
              </ol>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your emergency fund helps prevent the debt cycle from starting again when unexpected expenses occur.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insurance Dialog */}
      <Dialog open={openDialog === "insurance"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Insurance Coverage Review</DialogTitle>
            <DialogDescription>
              Protect yourself while optimizing premiums
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Adequate insurance coverage is essential for financial security, but there are ways to reduce costs.
            </p>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-semibold mb-2">Insurance Review Checklist:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Compare quotes from multiple providers annually</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Bundle policies for discounts (home, auto, etc.)</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Consider higher deductibles if you have emergency savings</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Review coverage levels to ensure they're appropriate</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ask about all available discounts</span>
                </li>
              </ul>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  The right insurance prevents catastrophic financial setbacks that could derail your debt payment plan.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Schedule Dialog */}
      <Dialog open={openDialog === "reviewSchedule"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Regular Debt Plan Reviews</DialogTitle>
            <DialogDescription>
              Stay on track with scheduled check-ins
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Regular reviews of your debt strategy help you adapt to changes and stay motivated.
            </p>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-semibold mb-2">Recommended Review Schedule:</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="h-6 w-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-full mr-2 mt-0.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">M</div>
                  <div>
                    <span className="font-medium">Monthly: Quick Check</span>
                    <p className="text-sm text-muted-foreground">Review expenses and ensure payments are on track</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-6 w-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 rounded-full mr-2 mt-0.5 text-sm font-medium text-purple-700 dark:text-purple-300">Q</div>
                  <div>
                    <span className="font-medium">Quarterly: Deep Dive</span>
                    <p className="text-sm text-muted-foreground">Assess progress, adjust allocations if needed</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-6 w-6 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 rounded-full mr-2 mt-0.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">Y</div>
                  <div>
                    <span className="font-medium">Yearly: Full Strategy Review</span>
                    <p className="text-sm text-muted-foreground">Re-evaluate strategy, set new goals, celebrate progress</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Set calendar reminders now for your quarterly reviews to maintain momentum and adjust your strategy as needed.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper component for action steps
interface ActionStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

const ActionStep = ({ icon: Icon, title, description, actionText, onAction }: ActionStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start">
        <div className="bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-full mr-4">
          <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-3 pl-11">
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 -ml-2 h-8"
          onClick={onAction}
        >
          {actionText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};
