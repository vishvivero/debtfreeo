import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ListChecks, ArrowRight, Calendar, Target, Award, Download, CheckCircle2, ChevronDown, ChevronUp, BookmarkCheck, BadgeCheck, ClipboardCheck, Check, Plus } from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { useProfile } from "@/hooks/use-profile";
import { Progress } from "@/components/ui/progress";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { formatCurrency } from "@/lib/strategies";
import { Toggle } from "@/components/ui/toggle";
const getCompletionPercentage = (debts: Debt[]): number => {
  if (!debts?.length) return 0;
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalOriginalDebt = debts.reduce((sum, debt) => {
    // Estimate original debt based on payment history or just use current balance if no data
    return sum + debt.balance * 1.1; // Simple estimation
  }, 0);
  if (totalOriginalDebt === 0) return 0;
  return Math.min(100, Math.max(0, 100 - totalDebt / totalOriginalDebt * 100));
};
export interface ActionStep {
  id: string;
  description: string;
  isCompleted: boolean;
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
  const {
    debts
  } = useDebts();
  const {
    profile
  } = useProfile();
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newStep, setNewStep] = useState("");
  const [addingStepToItemIndex, setAddingStepToItemIndex] = useState<number | null>(null);
  if (!debts || !profile) return null;
  const currencySymbol = profile.preferred_currency || "£";
  const completionPercentage = getCompletionPercentage(debts);

  // Calculate total debt and average interest rate
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interest_rate * debt.balance, 0) / totalDebt;

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
        steps: [{
          id: crypto.randomUUID(),
          description: "List all debt payment due dates",
          isCompleted: false
        }, {
          id: crypto.randomUUID(),
          description: "Set up automatic payments with your bank",
          isCompleted: false
        }, {
          id: crypto.randomUUID(),
          description: "Create calendar reminders 5 days before each payment",
          isCompleted: false
        }]
      });

      // Check if they have high-interest debts
      const highInterestDebts = debts.filter(debt => debt.interest_rate > 15);
      if (highInterestDebts.length > 0) {
        const highInterestTotal = highInterestDebts.reduce((sum, debt) => sum + debt.balance, 0);
        const avgHighRate = highInterestDebts.reduce((sum, debt) => sum + debt.interest_rate * debt.balance, 0) / highInterestTotal;
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
          steps: [{
            id: crypto.randomUUID(),
            description: "Identify all debts with >15% interest rate",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Allocate extra payments to highest interest debt first",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Research balance transfer options for high-interest cards",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Call creditors to negotiate lower interest rates",
            isCompleted: false
          }]
        });
      }

      // Check if they have multiple small debts
      const smallDebts = debts.filter(debt => debt.balance < 1000);
      if (smallDebts.length > 1) {
        const smallDebtTotal = smallDebts.reduce((sum, debt) => sum + debt.balance, 0);
        const avgSmallInterest = smallDebts.reduce((sum, debt) => sum + debt.interest_rate * debt.balance, 0) / smallDebtTotal;
        const monthsToPayoff = Math.ceil(smallDebtTotal / (smallDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0) * 1.5)); // Assuming 1.5x minimum payment

        items.push({
          title: "Eliminate small debts quickly",
          description: "Pay off your smallest debts first to reduce the number of monthly payments and build momentum.",
          icon: <Award className="h-5 w-5" />,
          priority: 'medium',
          benefit: "Build psychological momentum and simplify your finances",
          timeEstimate: `Clear ${smallDebts.length} smaller debts in ~${monthsToPayoff} months`,
          savingsEstimate: `Reduce ${smallDebts.length} monthly payments to just one`,
          steps: [{
            id: crypto.randomUUID(),
            description: "List all debts from smallest to largest balance",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Calculate how much extra you can put toward the smallest debt",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Pay minimum on all other debts while focusing on smallest",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "After paying off smallest, move to next smallest debt",
            isCompleted: false
          }]
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
          steps: [{
            id: crypto.randomUUID(),
            description: "Check your credit score to see what rates you qualify for",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Research consolidation loans from banks and credit unions",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Compare total cost of current debts vs. consolidation options",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Apply for consolidation if it saves money overall",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Set up automatic payments for the new consolidated loan",
            isCompleted: false
          }]
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
        steps: [{
          id: crypto.randomUUID(),
          description: "Review your monthly budget to find areas to cut back",
          isCompleted: false
        }, {
          id: crypto.randomUUID(),
          description: `Find ways to free up at least ${currencySymbol}${suggestedExtraPayment} per month`,
          isCompleted: false
        }, {
          id: crypto.randomUUID(),
          description: "Set up automatic transfer of extra payment amount",
          isCompleted: false
        }, {
          id: crypto.randomUUID(),
          description: "Apply extra payment to highest priority debt",
          isCompleted: false
        }]
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
          steps: [{
            id: crypto.randomUUID(),
            description: "Create a vision board for debt-free life",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Plan a modest celebration for when you make your final payment",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Set your next financial goal (emergency fund, investing, etc.)",
            isCompleted: false
          }, {
            id: crypto.randomUUID(),
            description: "Create a plan to redirect debt payments to your new goal",
            isCompleted: false
          }]
        });
      }
      return items;
    };

    // Only regenerate items if we don't have any yet
    if (actionItems.length === 0) {
      setActionItems(generateActionItems());
    }
  }, [debts, profile, currencySymbol, completionPercentage, totalDebt, avgInterestRate]);
  const toggleStepCompletion = (itemIndex: number, stepId: string) => {
    setActionItems(prevItems => {
      const newItems = [...prevItems];
      const item = {
        ...newItems[itemIndex]
      };
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
  const addNewStep = (itemIndex: number) => {
    if (!newStep.trim()) return;
    setActionItems(prevItems => {
      const newItems = [...prevItems];
      const item = {
        ...newItems[itemIndex]
      };
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
  const planCompletionPercentage = totalSteps > 0 ? Math.round(completedSteps / totalSteps * 100) : 0;
  return <Card className="overflow-hidden border-none shadow-lg">
      
      
      
    </Card>;
};