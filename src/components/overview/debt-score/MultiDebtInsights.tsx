
import React from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, PiggyBank, Calendar, Info, Target, AlertTriangle } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Debt } from "@/lib/types";
import { ScoreComponents } from "@/lib/utils/scoring/debtScoreCalculator";

interface MultiDebtInsightsProps {
  debts: Debt[];
  scoreDetails: ScoreComponents;
  currencySymbol: string;
}

export const MultiDebtInsights = ({ debts, scoreDetails, currencySymbol }: MultiDebtInsightsProps) => {
  const highestInterestDebt = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)[0];
  const lowestBalance = [...debts].sort((a, b) => a.balance - b.balance)[0];
  const totalInterest = debts.reduce((sum, debt) => sum + debt.balance * (debt.interest_rate / 100), 0);

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">Action Plan</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 bg-white/50 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-green-100">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Priority Focus</h4>
              <p className="text-sm text-gray-600 mt-1">
                Focus on {highestInterestDebt.name} with {highestInterestDebt.interest_rate}% APR
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This debt has the highest interest rate and costs you the most
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/50 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-blue-100">
              <PiggyBank className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Quick Win</h4>
              <p className="text-sm text-gray-600 mt-1">
                Target {lowestBalance.name} with {currencySymbol}
                {lowestBalance.balance.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Paying this off first will give you momentum
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/50 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-amber-100">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Monthly Interest Cost</h4>
              <p className="text-sm text-gray-600 mt-1">
                {currencySymbol}{totalInterest.toFixed(2)} per month
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This is what your debt costs you monthly
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/50 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Optimization Potential</h4>
              <p className="text-sm text-gray-600 mt-1">
                {((scoreDetails.durationScore + scoreDetails.interestScore) / 80 * 100).toFixed(0)}% room for improvement
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Based on your current payment strategy
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          Recommended Next Steps
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="cursor-help">
                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Personalized steps based on your debt profile</h5>
                <p className="text-sm text-muted-foreground">
                  Personalized steps based on your debt profile
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </h4>
        
        <div className="space-y-3">
          {scoreDetails.interestScore < 25 && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <p className="text-sm text-gray-600">
                Consider consolidating your high-interest debts to reduce overall interest costs
              </p>
            </div>
          )}
          
          {scoreDetails.durationScore < 15 && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <p className="text-sm text-gray-600">
                Look for opportunities to increase your monthly payment by {currencySymbol}50-100
              </p>
            </div>
          )}
          
          {scoreDetails.behaviorScore.excessPayments < 2.5 && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <p className="text-sm text-gray-600">
                Set up automatic payments to ensure consistent debt reduction
              </p>
            </div>
          )}

          {debts.some(debt => debt.interest_rate > 20) && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <p className="text-sm text-gray-600">
                You have high-interest debt(s). Prioritize paying these off first
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
