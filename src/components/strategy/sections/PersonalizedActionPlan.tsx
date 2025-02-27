
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, ArrowRight, Calendar, Target, Award, Download } from "lucide-react";
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
  isCompleted?: boolean;
}

export const PersonalizedActionPlan = () => {
  const { debts } = useDebts();
  const { profile } = useProfile();
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  
  if (!debts || !profile) return null;

  const currencySymbol = profile.preferred_currency || "£";
  const completionPercentage = getCompletionPercentage(debts);
  
  // Create personalized action items based on the user's debt situation
  const generateActionItems = (): ActionItem[] => {
    const items: ActionItem[] = [];
    
    // Always suggest making at least minimum payments
    items.push({
      title: "Make minimum payments on time",
      description: "Set up automatic payments for all your debts to ensure you never miss a payment date.",
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      priority: 'high'
    });
    
    // Check if they have high-interest debts
    const hasHighInterestDebt = debts.some(debt => debt.interest_rate > 15);
    if (hasHighInterestDebt) {
      items.push({
        title: "Focus on high-interest debt first",
        description: "Prioritize paying off debts with interest rates above 15% to save money on interest charges.",
        icon: <Target className="h-5 w-5 text-red-500" />,
        priority: 'high'
      });
    }
    
    // Check if they have multiple small debts
    const hasSmallDebts = debts.filter(debt => debt.balance < 1000).length > 1;
    if (hasSmallDebts) {
      items.push({
        title: "Eliminate small debts quickly",
        description: "Pay off your smallest debts first to reduce the number of monthly payments and build momentum.",
        icon: <Award className="h-5 w-5 text-green-500" />,
        priority: 'medium'
      });
    }
    
    // Suggest consolidation if they have many debts
    if (debts.length > 3) {
      items.push({
        title: "Consider debt consolidation",
        description: "Look into consolidating multiple debts into a single loan with a lower interest rate.",
        icon: <ListChecks className="h-5 w-5 text-purple-500" />,
        priority: 'medium'
      });
    }
    
    // Suggest increasing monthly payments
    items.push({
      title: "Increase your monthly payment",
      description: `Adding just ${currencySymbol}50 more to your monthly payment could significantly reduce your payoff time.`,
      icon: <ArrowRight className="h-5 w-5 text-orange-500" />,
      priority: 'medium'
    });
    
    // Add a debt-free celebration planning action when they're close to paying off
    if (completionPercentage > 75) {
      items.push({
        title: "Plan your debt-free celebration",
        description: "You're getting close! Start planning how you'll celebrate becoming debt-free and what financial goals you'll tackle next.",
        icon: <Award className="h-5 w-5 text-yellow-500" />,
        priority: 'low'
      });
    }
    
    return items;
  };
  
  const actionItems = generateActionItems();
  const highPriorityItems = actionItems.filter(item => item.priority === 'high');
  const mediumPriorityItems = actionItems.filter(item => item.priority === 'medium');
  const lowPriorityItems = actionItems.filter(item => item.priority === 'low');
  
  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };
  
  const handleDownloadPlan = () => {
    console.log("Download plan functionality would go here");
    // Future enhancement: implement PDF download of the action plan
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-8">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Your Personalized Action Plan
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleDownloadPlan}
          >
            <Download className="h-4 w-4" />
            Export Plan
          </Button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Your Debt Freedom Progress</span>
            <span className="text-sm font-semibold">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {highPriorityItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">DO THESE FIRST</h3>
              <div className="space-y-3">
                {highPriorityItems.map((item, index) => (
                  <motion.div
                    key={`high-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg cursor-pointer ${selectedAction === index ? 'ring-2 ring-primary' : ''} ${priorityColors.high}`}
                    onClick={() => setSelectedAction(selectedAction === index ? null : index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{item.icon}</div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        {selectedAction === index && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm mt-2"
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {mediumPriorityItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">NEXT STEPS</h3>
              <div className="space-y-3">
                {mediumPriorityItems.map((item, index) => (
                  <motion.div
                    key={`medium-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`p-4 border rounded-lg cursor-pointer ${selectedAction === highPriorityItems.length + index ? 'ring-2 ring-primary' : ''} ${priorityColors.medium}`}
                    onClick={() => setSelectedAction(selectedAction === highPriorityItems.length + index ? null : highPriorityItems.length + index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{item.icon}</div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        {selectedAction === highPriorityItems.length + index && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm mt-2"
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {lowPriorityItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">FUTURE CONSIDERATIONS</h3>
              <div className="space-y-3">
                {lowPriorityItems.map((item, index) => (
                  <motion.div
                    key={`low-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`p-4 border rounded-lg cursor-pointer ${selectedAction === highPriorityItems.length + mediumPriorityItems.length + index ? 'ring-2 ring-primary' : ''} ${priorityColors.low}`}
                    onClick={() => setSelectedAction(selectedAction === highPriorityItems.length + mediumPriorityItems.length + index ? null : highPriorityItems.length + mediumPriorityItems.length + index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{item.icon}</div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        {selectedAction === highPriorityItems.length + mediumPriorityItems.length + index && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm mt-2"
                          >
                            {item.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>This action plan is tailored based on your current debt profile and repayment strategy. Click on any action to see detailed recommendations.</p>
        </div>
      </CardContent>
    </Card>
  );
};
