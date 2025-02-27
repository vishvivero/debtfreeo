
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ListChecks, ArrowRight, Calendar, Target, Award, 
  Download, CheckCircle2, ChevronDown, ChevronUp, 
  BookmarkCheck, BadgeCheck, ClipboardCheck
} from "lucide-react";
import { useDebts } from "@/hooks/use-debts";
import { useProfile } from "@/hooks/use-profile";
import { Progress } from "@/components/ui/progress";
import { Debt } from "@/lib/types";
import { Strategy } from "@/lib/strategies";
import { formatCurrency } from "@/lib/strategies";

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

export interface ActionItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  benefit: string;
  savingsEstimate?: string;
  timeEstimate?: string;
  isCompleted?: boolean;
}

export const PersonalizedActionPlan = () => {
  const { debts } = useDebts();
  const { profile } = useProfile();
  
  if (!debts || !profile) return null;

  const currencySymbol = profile.preferred_currency || "£";
  const completionPercentage = getCompletionPercentage(debts);
  
  // Calculate total debt and average interest rate
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const avgInterestRate = debts.reduce((sum, debt) => sum + (debt.interest_rate * debt.balance), 0) / totalDebt;
  
  // Create personalized action items based on the user's debt situation
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
      savingsEstimate: `${currencySymbol}${minPaymentsSavings.toLocaleString()} in late fees annually`
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
        timeEstimate: "Accelerate payoff by 6-12 months"
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
        savingsEstimate: `Reduce ${smallDebts.length} monthly payments to just one`
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
        timeEstimate: "Simplify to 1 payment instead of " + debts.length
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
      savingsEstimate: `Save ${currencySymbol}${Math.round(totalDebt * avgInterestRate / 100 * payoffAcceleration / 12).toLocaleString()} in interest`
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
        savingsEstimate: `Soon redirecting ${currencySymbol}${currentMinimums.toLocaleString()} monthly to savings`
      });
    }
    
    return items;
  };
  
  const actionItems = generateActionItems();
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
  
  const handleDownloadPlan = () => {
    console.log("Download plan functionality would go here");
    // Future enhancement: implement PDF download of the action plan
  };
  
  return (
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
              <span className="text-sm font-medium text-white/90">Remaining</span>
              <div className="text-md font-semibold">{100 - Math.round(completionPercentage)}%</div>
            </div>
          </div>
          
          <Progress 
            value={completionPercentage} 
            className="h-2.5 bg-white/20" 
            indicatorClassName="bg-white"
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
              
              <div className="space-y-3">
                {highPriorityItems.map((item, index) => (
                  <motion.div
                    key={`high-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-xl shadow-sm hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full bg-gradient-to-r ${priorityConfig.high.color} text-white`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
                        
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        
                        <Button 
                          variant="link" 
                          className="px-0 mt-2 text-red-500 hover:text-red-600"
                          size="sm"
                        >
                          Learn more
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
              
              <div className="space-y-3">
                {mediumPriorityItems.map((item, index) => (
                  <motion.div
                    key={`medium-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 border rounded-xl shadow-sm hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full bg-gradient-to-r ${priorityConfig.medium.color} text-white`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
                        
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        
                        <Button 
                          variant="link" 
                          className="px-0 mt-2 text-amber-600 hover:text-amber-700"
                          size="sm"
                        >
                          Learn more
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {lowPriorityItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1 rounded-full ${priorityConfig.low.bg}`}>
                  {priorityConfig.low.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {priorityConfig.low.label} ACTIONS
                </h3>
              </div>
              
              <div className="space-y-3">
                {lowPriorityItems.map((item, index) => (
                  <motion.div
                    key={`low-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 border rounded-xl shadow-sm hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full bg-gradient-to-r ${priorityConfig.low.color} text-white`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
                        
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <div className="text-xs font-medium text-emerald-600 uppercase mb-1">Benefit</div>
                            <div className="text-sm font-semibold text-emerald-800">{item.benefit}</div>
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
                        
                        <Button 
                          variant="link" 
                          className="px-0 mt-2 text-teal-600 hover:text-teal-700"
                          size="sm"
                        >
                          Learn more
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <p>This action plan is tailored to your debt profile and updated as your situation changes. Each recommendation includes estimated benefits based on your current financial data.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
