
import React from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, PiggyBank, Calendar, Info, Target } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface SingleDebtInsightsProps {
  debt: {
    balance: number;
    interest_rate: number;
    minimum_payment: number;
    name: string;
  };
  currencySymbol: string;
}

export const SingleDebtInsights = ({ debt, currencySymbol }: SingleDebtInsightsProps) => {
  const monthlyInterest = debt.balance * (debt.interest_rate / 100) / 12;
  const totalCostIfMinimum = debt.balance + monthlyInterest * 24; // Rough 2-year estimate

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">Getting Started with Your Debt-Free Journey</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 bg-white/50 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-emerald-100">
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">Understanding Your Debt</h4>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button>
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">Monthly Interest Explained</h5>
                      <p className="text-sm text-muted-foreground">
                        Monthly interest is calculated based on your current balance and APR. This shows how much you're paying just in interest each month before any principal reduction.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Monthly Interest: {currencySymbol}
                {monthlyInterest.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This is what your debt costs you each month in interest
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
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">Payment Impact</h4>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="cursor-help">
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">Extra Payment Benefits</h5>
                      <p className="text-sm text-muted-foreground">
                        Extra payments can significantly reduce your total repayment time and interest costs. Even small additional amounts can make a big difference over time.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Adding just {currencySymbol}50 extra monthly could save you months
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Extra payments go directly to reducing your principal
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
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">Total Cost Warning</h4>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="cursor-help">
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">Understanding Total Cost</h5>
                      <p className="text-sm text-muted-foreground">
                        This 2-year projection shows the total amount you'll pay if you only make minimum payments. It includes both principal and accumulated interest, highlighting why paying more than the minimum is beneficial.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Paying minimum only: ~{currencySymbol}
                {totalCostIfMinimum.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This is your estimated 2-year cost with minimum payments
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
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">Success Tips</h4>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="cursor-help">
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-white border-gray-200 shadow-lg z-50">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">Why These Tips Matter</h5>
                      <p className="text-sm text-muted-foreground">
                        These proven strategies help ensure consistent progress towards becoming debt-free. Automatic payments prevent missed payments, tracking helps maintain motivation, and celebrating milestones reinforces positive financial habits.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="space-y-2 mt-2">
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-purple-500" />
                  Set up automatic payments
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-purple-500" />
                  Track your progress monthly
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-purple-500" />
                  Celebrate small wins
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
