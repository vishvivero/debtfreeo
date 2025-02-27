
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
      icon: <Calendar className="h-5 w-5" />,
      priority: 'high'
    });
    
    // Check if they have high-interest debts
    const hasHighInterestDebt = debts.some(debt => debt.interest_rate > 15);
    if (hasHighInterestDebt) {
      items.push({
        title: "Focus on high-interest debt first",
        description: "Prioritize paying off debts with interest rates above 15% to save money on interest charges.",
        icon: <Target className="h-5 w-5" />,
        priority: 'high'
      });
    }
    
    // Check if they have multiple small debts
    const hasSmallDebts = debts.filter(debt => debt.balance < 1000).length > 1;
    if (hasSmallDebts) {
      items.push({
        title: "Eliminate small debts quickly",
        description: "Pay off your smallest debts first to reduce the number of monthly payments and build momentum.",
        icon: <Award className="h-5 w-5" />,
        priority: 'medium'
      });
    }
    
    // Suggest consolidation if they have many debts
    if (debts.length > 3) {
      items.push({
        title: "Consider debt consolidation",
        description: "Look into consolidating multiple debts into a single loan with a lower interest rate.",
        icon: <ListChecks className="h-5 w-5" />,
        priority: 'medium'
      });
    }
    
    // Suggest increasing monthly payments
    items.push({
      title: "Increase your monthly payment",
      description: `Adding just ${currencySymbol}50 more to your monthly payment could significantly reduce your payoff time.`,
      icon: <ArrowRight className="h-5 w-5" />,
      priority: 'medium'
    });
    
    // Add a debt-free celebration planning action when they're close to paying off
    if (completionPercentage > 75) {
      items.push({
        title: "Plan your debt-free celebration",
        description: "You're getting close! Start planning how you'll celebrate becoming debt-free and what financial goals you'll tackle next.",
        icon: <Award className="h-5 w-5" />,
        priority: 'low'
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
                    className={`p-4 border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer 
                      ${selectedAction === index ? 'ring-2 ring-red-400 bg-red-50' : 'bg-white'}`}
                    onClick={() => setSelectedAction(selectedAction === index ? null : index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full bg-gradient-to-r ${priorityConfig.high.color} text-white`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          {selectedAction === index ? 
                            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          }
                        </div>
                        
                        {selectedAction === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                          >
                            <p className="text-gray-600">{item.description}</p>
                            <Button 
                              variant="link" 
                              className="px-0 mt-2 text-red-500 hover:text-red-600"
                              size="sm"
                            >
                              Learn more
                            </Button>
                          </motion.div>
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
                    className={`p-4 border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer 
                      ${selectedAction === highPriorityItems.length + index ? 'ring-2 ring-amber-400 bg-amber-50' : 'bg-white'}`}
                    onClick={() => setSelectedAction(selectedAction === highPriorityItems.length + index ? null : highPriorityItems.length + index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full bg-gradient-to-r ${priorityConfig.medium.color} text-white`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          {selectedAction === highPriorityItems.length + index ? 
                            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          }
                        </div>
                        
                        {selectedAction === highPriorityItems.length + index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                          >
                            <p className="text-gray-600">{item.description}</p>
                            <Button 
                              variant="link" 
                              className="px-0 mt-2 text-amber-600 hover:text-amber-700"
                              size="sm"
                            >
                              Learn more
                            </Button>
                          </motion.div>
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
                    className={`p-4 border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer 
                      ${selectedAction === highPriorityItems.length + mediumPriorityItems.length + index 
                        ? 'ring-2 ring-teal-400 bg-teal-50' 
                        : 'bg-white'}`}
                    onClick={() => setSelectedAction(
                      selectedAction === highPriorityItems.length + mediumPriorityItems.length + index 
                        ? null 
                        : highPriorityItems.length + mediumPriorityItems.length + index
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full bg-gradient-to-r ${priorityConfig.low.color} text-white`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          {selectedAction === highPriorityItems.length + mediumPriorityItems.length + index ? 
                            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          }
                        </div>
                        
                        {selectedAction === highPriorityItems.length + mediumPriorityItems.length + index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                          >
                            <p className="text-gray-600">{item.description}</p>
                            <Button 
                              variant="link" 
                              className="px-0 mt-2 text-teal-600 hover:text-teal-700"
                              size="sm"
                            >
                              Learn more
                            </Button>
                          </motion.div>
                        )}
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
            <p>This action plan is tailored to your debt profile and updated as your situation changes. Click any action for more details and guidance.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
