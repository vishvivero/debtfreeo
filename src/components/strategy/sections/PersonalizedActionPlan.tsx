import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  ListChecks, ArrowRight, Calendar, Target, Award, 
  Download, CheckCircle2, ChevronDown, ChevronUp, 
  BookmarkCheck, BadgeCheck, ClipboardCheck,
  Check, Plus, CalendarCheck
} from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { useProfile } from "@/hooks/use-profile";
import { Progress } from "@/components/ui/progress";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { formatCurrency } from "@/lib/strategies";
import { Toggle } from "@/components/ui/toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { format } from "date-fns";

const getCompletionPercentage = (debts: Debt[]): number => {
  if (!debts?.length) return 0;
  
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalOriginalDebt = debts.reduce((sum, debt) => {
    // Estimate original debt based on payment history or just use current balance if no data
    return sum + (debt.balance * 1.1); // Simple estimation
  }, 0);
  
  if (totalOriginalDebt === 0) return 0;
  return Math.min(100, Math.max(0, 100 - (totalDebt / totalOriginalDebt * 100)));
};

export interface ActionStep {
  id: string;
  description: string;
  isCompleted: boolean;
  action?: string; // Optional action identifier
}

export interface ActionItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  benefit: string;
  savingsEstimate?: string;
  timeEstimate?: string;
  isCompleted?: boolean;
  steps: ActionStep[];
}

export const PersonalizedActionPlan = () => {
  const { debts } = useDebts();
  const { profile } = useProfile();
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newStep, setNewStep] = useState("");
  const [addingStepToItemIndex, setAddingStepToItemIndex] = useState<number | null>(null);
  const [showDueDateDialog, setShowDueDateDialog] = useState(false);
  
  if (!debts || !profile) return null;

  const currencySymbol = profile.preferred_currency || "£";
  const completionPercentage = getCompletionPercentage(debts);
  
  // Calculate total debt and average interest rate
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const avgInterestRate = debts.reduce((sum, debt) => sum + (debt.interest_rate * debt.balance), 0) / totalDebt;
  
  // Create personalized action items based on the user's debt situation
  useEffect(() => {
    const generateActionItems = (): ActionItem[] => {
      const items: ActionItem[] = [];
      
      // Always suggest making at least minimum payments
      const minPaymentsSavings = Math.round(totalDebt * 0.05); // Rough estimate of late fee avoidance
      items.push({
        title: "Make minimum payments on time",
        description: "Set up automatic payments for all your debts to ensure you never miss a payment date.",
        icon: <Calendar className="h-5 w-5" />,
        priority: 'high',
        benefit: "Avoid late fees and credit score damage",
        savingsEstimate: `${currencySymbol}${minPaymentsSavings.toLocaleString()} in late fees annually`,
        steps: [
          { 
            id: crypto.randomUUID(), 
            description: "List all debt payment due dates", 
            isCompleted: false,
            action: "showDueDates" 
          },
          { id: crypto.randomUUID(), description: "Set up automatic payments with your bank", isCompleted: false },
          { id: crypto.randomUUID(), description: "Create calendar reminders 5 days before each payment", isCompleted: false }
        ]
      });
      
      // Check if they have high-interest debts
      const highInterestDebts = debts.filter(debt => debt.interest_rate > 15);
      if (highInterestDebts.length > 0) {
        const highInterestTotal = highInterestDebts.reduce((sum, debt) => sum + debt.balance, 0);
        const avgHighRate = highInterestDebts.reduce((sum, debt) => sum + (debt.interest_rate * debt.balance), 0) / highInterestTotal;
        const avgNormalRate = 10; // Assuming this is an achievable rate
        const interestSavings = Math.round(highInterestTotal * (avgHighRate - avgNormalRate) / 100);
        
        items.push({
          title: "Focus on high-interest debt first",
          description: "Prioritize paying off debts with interest rates above 15% to save money on interest charges.",
          icon: <Target className="h-5 w-5" />,
          priority: 'high',
          benefit: "Reduce your high-cost interest payments",
          savingsEstimate: `${currencySymbol}${interestSavings.toLocaleString()} per year in interest charges`,
          timeEstimate: "Accelerate payoff by 6-12 months",
          steps: [
            { id: crypto.randomUUID(), description: "Identify all debts with >15% interest rate", isCompleted: false },
            { id: crypto.randomUUID(), description: "Allocate extra payments to highest interest debt first", isCompleted: false },
            { id: crypto.randomUUID(), description: "Research balance transfer options for high-interest cards", isCompleted: false },
            { id: crypto.randomUUID(), description: "Call creditors to negotiate lower interest rates", isCompleted: false }
          ]
        });
      }
      
      // Check if they have multiple small debts
      const smallDebts = debts.filter(debt => debt.balance < 1000);
      if (smallDebts.length > 1) {
        const smallDebtTotal = smallDebts.reduce((sum, debt) => sum + debt.balance, 0);
        const avgSmallInterest = smallDebts.reduce((sum, debt) => sum + (debt.interest_rate * debt.balance), 0) / smallDebtTotal;
        const monthsToPayoff = Math.ceil(smallDebtTotal / (smallDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0) * 1.5)); // Assuming 1.5x minimum payment
        
        items.push({
          title: "Eliminate small debts quickly",
          description: "Pay off your smallest debts first to reduce the number of monthly payments and build momentum.",
          icon: <Award className="h-5 w-5" />,
          priority: 'medium',
          benefit: "Build psychological momentum and simplify your finances",
          timeEstimate: `Clear ${smallDebts.length} smaller debts in ~${monthsToPayoff} months`,
          savingsEstimate: `Reduce ${smallDebts.length} monthly payments to just one`,
          steps: [
            { id: crypto.randomUUID(), description: "List all debts from smallest to largest balance", isCompleted: false },
            { id: crypto.randomUUID(), description: "Calculate how much extra you can put toward the smallest debt", isCompleted: false },
            { id: crypto.randomUUID(), description: "Pay minimum on all other debts while focusing on smallest", isCompleted: false },
            { id: crypto.randomUUID(), description: "After paying off smallest, move to next smallest debt", isCompleted: false }
          ]
        });
      }
      
      // Suggest consolidation if they have many debts
      if (debts.length > 3) {
        const potentialConsolidationRate = avgInterestRate > 12 ? avgInterestRate - 3 : avgInterestRate - 1; // Estimated potential rate
        const annualSavings = Math.round(totalDebt * (avgInterestRate - potentialConsolidationRate) / 100);
        
        items.push({
          title: "Consider debt consolidation",
          description: "Look into consolidating multiple debts into a single loan with a lower interest rate.",
          icon: <ListChecks className="h-5 w-5" />,
          priority: 'medium',
          benefit: "Simplify payments and potentially reduce interest",
          savingsEstimate: `${currencySymbol}${annualSavings.toLocaleString()} per year in interest`,
          timeEstimate: "Simplify to 1 payment instead of " + debts.length,
          steps: [
            { id: crypto.randomUUID(), description: "Check your credit score to see what rates you qualify for", isCompleted: false },
            { id: crypto.randomUUID(), description: "Research consolidation loans from banks and credit unions", isCompleted: false },
            { id: crypto.randomUUID(), description: "Compare total cost of current debts vs. consolidation options", isCompleted: false },
            { id: crypto.randomUUID(), description: "Apply for consolidation if it saves money overall", isCompleted: false },
            { id: crypto.randomUUID(), description: "Set up automatic payments for the new consolidated loan", isCompleted: false }
          ]
        });
      }
      
      // Suggest increasing monthly payments
      const currentMinimums = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
      const suggestedExtraPayment = Math.max(50, Math.round(currentMinimums * 0.1)); // Either 50 or 10% of minimum payments, whichever is greater
      const payoffAcceleration = Math.round(12 * suggestedExtraPayment / (totalDebt * avgInterestRate / 1200));
      
      items.push({
        title: "Increase your monthly payment",
        description: `Adding just ${currencySymbol}${suggestedExtraPayment} more to your monthly payment could significantly reduce your payoff time.`,
        icon: <ArrowRight className="h-5 w-5" />,
        priority: 'medium',
        benefit: "Accelerate your debt payoff timeline",
        timeEstimate: `Become debt-free ~${payoffAcceleration} months sooner`,
        savingsEstimate: `Save ${currencySymbol}${Math.round(totalDebt * avgInterestRate / 100 * payoffAcceleration / 12).toLocaleString()} in interest`,
        steps: [
          { id: crypto.randomUUID(), description: "Review your monthly budget to find areas to cut back", isCompleted: false },
          { id: crypto.randomUUID(), description: `Find ways to free up at least ${currencySymbol}${suggestedExtraPayment} per month`, isCompleted: false },
          { id: crypto.randomUUID(), description: "Set up automatic transfer of extra payment amount", isCompleted: false },
          { id: crypto.randomUUID(), description: "Apply extra payment to highest priority debt", isCompleted: false }
        ]
      });
      
      // Add a debt-free celebration planning action when they're close to paying off
      if (completionPercentage > 75) {
        const remainingDebt = totalDebt * (1 - completionPercentage / 100);
        const monthsRemaining = Math.ceil(remainingDebt / currentMinimums);
        
        items.push({
          title: "Plan your debt-free celebration",
          description: "You're getting close! Start planning how you'll celebrate becoming debt-free and what financial goals you'll tackle next.",
          icon: <Award className="h-5 w-5" />,
          priority: 'low',
          benefit: "Keep motivated during the final stretch",
          timeEstimate: `Only ~${monthsRemaining} months remaining at current pace`,
          savingsEstimate: `Soon redirecting ${currencySymbol}${currentMinimums.toLocaleString()} monthly to savings`,
          steps: [
            { id: crypto.randomUUID(), description: "Create a vision board for debt-free life", isCompleted: false },
            { id: crypto.randomUUID(), description: "Plan a modest celebration for when you make your final payment", isCompleted: false },
            { id: crypto.randomUUID(), description: "Set your next financial goal (emergency fund, investing, etc.)", isCompleted: false },
            { id: crypto.randomUUID(), description: "Create a plan to redirect debt payments to your new goal", isCompleted: false }
          ]
        });
      }
      
      return items;
    };

    // Only regenerate items if we don't have any yet
    if (actionItems.length === 0) {
      setActionItems(generateActionItems());
    }
  }, [debts, profile, currencySymbol, completionPercentage, totalDebt, avgInterestRate, actionItems.length]);
  
  const toggleStepCompletion = (itemIndex: number, stepId: string) => {
    setActionItems(prevItems => {
      const newItems = [...prevItems];
      const item = {...newItems[itemIndex]};
      const steps = [...item.steps];
      
      const stepIndex = steps.findIndex(step => step.id === stepId);
      if (stepIndex !== -1) {
        steps[stepIndex] = {
          ...steps[stepIndex],
          isCompleted: !steps[stepIndex].isCompleted
        };
      }
      
      item.steps = steps;
      newItems[itemIndex] = item;
      
      // Check if all steps are completed and update the item's isCompleted status
      const allStepsCompleted = steps.every(step => step.isCompleted);
      item.isCompleted = allStepsCompleted;
      
      return newItems;
    });
  };

  const handleStepClick = (itemIndex: number, stepId: string, action?: string) => {
    if (action === "showDueDates") {
      setShowDueDateDialog(true);
    } else {
      toggleStepCompletion(itemIndex, stepId);
    }
  };
  
  const addNewStep = (itemIndex: number) => {
    if (!newStep.trim()) return;
    
    setActionItems(prevItems => {
      const newItems = [...prevItems];
      const item = {...newItems[itemIndex]};
      const steps = [...item.steps];
      
      steps.push({
        id: crypto.randomUUID(),
        description: newStep.trim(),
        isCompleted: false
      });
      
      item.steps = steps;
      newItems[itemIndex] = item;
      
      return newItems;
    });
    
    setNewStep("");
    setAddingStepToItemIndex(null);
  };
  
  const handleDownloadPlan = () => {
    console.log("Download plan functionality would go here");
    // Future enhancement: implement PDF download of the action plan
  };
  
  const highPriorityItems = actionItems.filter(item => item.priority === 'high');
  const mediumPriorityItems = actionItems.filter(item => item.priority === 'medium');
  const lowPriorityItems = actionItems.filter(item => item.priority === 'low');
  
  const priorityConfig = {
    high: {
      icon: <BadgeCheck className="h-5 w-5 text-white" />,
      color: 'from-red-500 to-rose-600',
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      label: 'Critical'
    },
    medium: {
      icon: <BookmarkCheck className="h-5 w-5 text-white" />,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      label: 'Important'
    },
    low: {
      icon: <ClipboardCheck className="h-5 w-5 text-white" />,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      label: 'Suggested'
    }
  };
  
  // Calculate the total steps and completed steps
  const totalSteps = actionItems.reduce((sum, item) => sum + item.steps.length, 0);
  const completedSteps = actionItems.reduce((sum, item) => sum + item.steps.filter(step => step.isCompleted).length, 0);
  const planCompletionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Format the payment due date for display
  const formatDueDate = (dateString: string | undefined): string => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting due date:", error);
      return "Invalid date";
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-br from-violet-500/90 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ListChecks className="h-6 w-6" />
              Your Personalized Action Plan
            </CardTitle>
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 bg-white/20 hover:bg-white/30 text-white"
              onClick={handleDownloadPlan}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-white/90">Debt Freedom Progress</span>
                <div className="text-2xl font-bold">{Math.round(completionPercentage)}%</div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-white/90">Action Plan Progress</span>
                <div className="text-lg font-semibold">{planCompletionPercentage}% Complete</div>
                <div className="text-xs text-white/70">
                  {completedSteps} of {totalSteps} steps
                </div>
              </div>
            </div>
            
            <Progress 
              value={completionPercentage} 
              className="h-2.5 bg-white/20" 
              indicatorClassName="bg-white"
            />
            
            <Progress 
              value={planCompletionPercentage} 
              className="h-2.5 mt-2 bg-white/20" 
              indicatorClassName="bg-green-400"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="space-y-6">
            {highPriorityItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1 rounded-full ${priorityConfig.high.bg}`}>
                    {priorityConfig.high.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {priorityConfig.high.label} ACTIONS
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {highPriorityItems.map((item, index) => {
                    const itemIndex = actionItems.findIndex(i => i.title === item.title);
                    const completedStepsCount = item.steps.filter(step => step.isCompleted).length;
                    const totalStepsCount = item.steps.length;
                    const stepPercentage = Math.round((completedStepsCount / totalStepsCount) * 100);
                    
                    return (
                      <motion.div
                        key={`high-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border rounded-xl shadow-sm hover:shadow-md transition-all bg-white 
                          ${item.isCompleted ? 'border-green-300 bg-green-50' : ''}`}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-2 rounded-full ${item.isCompleted ? 
                              'bg-green-500' : 
                              `bg-gradient-to-r ${priorityConfig.high.color}`} text-white`}
                            >
                              {item.isCompleted ? <Check className="h-5 w-5" /> : item.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  {item.title}
                                  {item.isCompleted && (
                                    <span className="text-xs font-normal px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                </h4>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setExpandedItem(expandedItem === itemIndex ? null : itemIndex)}
                                  className="p-1 h-8 w-8"
                                >
                                  {expandedItem === itemIndex ? 
                                    <ChevronUp className="h-5 w-5" /> : 
                                    <ChevronDown className="h-5 w-5" />}
                                </Button>
                              </div>
                              
                              <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
                              
                              <div className="mt-3 flex items-center gap-2">
                                <Progress 
                                  value={stepPercentage} 
                                  className="h-2 flex-1 bg-gray-100" 
                                  indicatorClassName={item.isCompleted ? "bg-green-500" : "bg-red-500"}
                                />
                                <span className="text-xs font-medium text-gray-600">
                                  {completedStepsCount}/{totalStepsCount} steps
                                </span>
                              </div>
                              
                              {expandedItem === itemIndex && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-4"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                      <div className="text-xs font-medium text-red-600 uppercase mb-1">Benefit</div>
                                      <div className="text-sm font-semibold text-red-800">{item.benefit}</div>
                                    </div>
                                    
                                    {item.savingsEstimate && (
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="text-xs font-medium text-blue-600 uppercase mb-1">Estimated Savings</div>
                                        <div className="text-sm font-semibold text-blue-800">{item.savingsEstimate}</div>
                                      </div>
                                    )}
                                    
                                    {item.timeEstimate && (
                                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                        <div className="text-xs font-medium text-purple-600 uppercase mb-1">Time Impact</div>
                                        <div className="text-sm font-semibold text-purple-800">{item.timeEstimate}</div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2 mt-4">
                                    <h5 className="text-sm font-semibold text-gray-700">Action Steps:</h5>
                                    
                                    {item.steps.map((step, stepIndex) => (
                                      <div 
                                        key={step.id} 
                                        className={`flex items-start gap-2 p-2 rounded-lg border 
                                          ${step.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                                      >
                                        <Checkbox 
                                          id={step.id} 
                                          checked={step.isCompleted}
                                          onCheckedChange={() => handleStepClick(itemIndex, step.id, step.action)}
                                          className="mt-0.5 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                                        />
                                        <label 
                                          htmlFor={step.id} 
                                          className={`text-sm flex-1 cursor-pointer ${step.isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                                        >
                                          {step.description}
                                          {step.action === "showDueDates" && (
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="ml-2 text-blue-600 p-0 h-auto text-xs underline hover:text-blue-800"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowDueDateDialog(true);
                                              }}
                                            >
                                              View Dates
                                            </Button>
                                          )}
                                        </label>
                                      </div>
                                    ))}
                                    
                                    {addingStepToItemIndex === itemIndex ? (
                                      <div className="mt-3 space-y-2">
                                        <Textarea 
                                          placeholder="Enter a new action step..." 
                                          value={newStep}
                                          onChange={(e) => setNewStep(e.target.value)}
                                          className="min-h-[80px] text-sm"
                                        />
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            onClick={() => addNewStep(itemIndex)}
                                            disabled={!newStep.trim()}
                                          >
                                            Add Step
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => {
                                              setNewStep("");
                                              setAddingStepToItemIndex(null);
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-2 gap-1"
                                        onClick={() => setAddingStepToItemIndex(itemIndex)}
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Custom Step
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {mediumPriorityItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1 rounded-full ${priorityConfig.medium.bg}`}>
                    {priorityConfig.medium.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {priorityConfig.medium.label} ACTIONS
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {mediumPriorityItems.map((item, index) => {
                    const itemIndex = actionItems.findIndex(i => i.title === item.title);
                    const completedStepsCount = item.steps.filter(step => step.isCompleted).length;
                    const totalStepsCount = item.steps.length;
                    const stepPercentage = Math.round((completedStepsCount / totalStepsCount) * 100);
                    
                    return (
                      <motion.div
                        key={`medium-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`border rounded-xl shadow-sm hover:shadow-md transition-all bg-white 
                          ${item.isCompleted ? 'border-green-300 bg-green-50' : ''}`}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-2 rounded-full ${item.isCompleted ? 
                              'bg-green-500' : 
                              `bg-gradient-to-r ${priorityConfig.medium.color}`} text-white`}
                            >
                              {item.isCompleted ? <Check className="h-5 w-5" /> : item.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  {item.title}
                                  {item.isCompleted && (
                                    <span className="text-xs font-normal px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                </h4>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setExpandedItem(expandedItem === itemIndex ? null : itemIndex)}
                                  className="p-1 h-8 w-8"
                                >
                                  {expandedItem === itemIndex ? 
                                    <ChevronUp className="h-5 w-5" /> : 
                                    <ChevronDown className="h-5 w-5" />}
                                </Button>
                              </div>
                              
                              <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
                              
                              <div className="mt-3 flex items-center gap-2">
                                <Progress 
                                  value={stepPercentage} 
                                  className="h-2 flex-1 bg-gray-100" 
                                  indicatorClassName={item.isCompleted ? "bg-green-500" : "bg-amber-500"}
                                />
                                <span className="text-xs font-medium text-gray-600">
                                  {completedStepsCount}/{totalStepsCount} steps
                                </span>
                              </div>
                              
                              {expandedItem === itemIndex && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-4"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                      <div className="text-xs font-medium text-amber-600 uppercase mb-1">Benefit</div>
                                      <div className="text-sm font-semibold text-amber-800">{item.benefit}</div>
                                    </div>
                                    
                                    {item.savingsEstimate && (
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="text-xs font-medium text-blue-600 uppercase mb-1">Estimated Savings</div>
                                        <div className="text-sm font-semibold text-blue-800">{item.savingsEstimate}</div>
                                      </div>
                                    )}
                                    
                                    {item.timeEstimate && (
                                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                        <div className="text-xs font-medium text-purple-600 uppercase mb-1">Time Impact</div>
                                        <div className="text-sm font-semibold text-purple-800">{item.timeEstimate}</div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2 mt-4">
                                    <h5 className="text-sm font-semibold text-gray-700">Action Steps:</h5>
                                    
                                    {item.steps.map((step, stepIndex) => (
                                      <div 
                                        key={step.id} 
                                        className={`flex items-start gap-2 p-2 rounded-lg border 
                                          ${step.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                                      >
                                        <Checkbox 
                                          id={step.id} 
                                          checked={step.isCompleted}
                                          onCheckedChange={() => handleStepClick(itemIndex, step.id, step.action)}
                                          className="mt-0.5 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                                        />
                                        <label 
                                          htmlFor={step.id} 
                                          className={`text-sm flex-1 cursor-pointer ${step.isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                                        >
                                          {step.description}
                                          {step.
