
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export const InvestmentCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState<number>(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
  const [annualReturn, setAnnualReturn] = useState<number>(7);
  const [years, setYears] = useState<number>(30);
  const [result, setResult] = useState<{
    finalBalance: number;
    totalContributions: number;
    totalEarnings: number;
  } | null>(null);

  const calculateInvestment = () => {
    const monthlyRate = annualReturn / 12 / 100;
    const totalMonths = years * 12;
    
    let balance = initialInvestment;
    let totalContributions = initialInvestment;

    for (let i = 0; i < totalMonths; i++) {
      balance += monthlyContribution;
      totalContributions += monthlyContribution;
      balance *= (1 + monthlyRate);
    }

    setResult({
      finalBalance: Math.round(balance),
      totalContributions: Math.round(totalContributions),
      totalEarnings: Math.round(balance - totalContributions)
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initialInvestment">Initial Investment ($)</Label>
            <Input
              id="initialInvestment"
              type="number"
              min="0"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
              placeholder="Enter initial investment amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyContribution">Monthly Contribution ($)</Label>
            <Input
              id="monthlyContribution"
              type="number"
              min="0"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              placeholder="Enter monthly contribution"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualReturn">Expected Annual Return (%)</Label>
            <Input
              id="annualReturn"
              type="number"
              min="0"
              max="100"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              placeholder="Enter expected annual return"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years">Investment Period (Years)</Label>
            <Input
              id="years"
              type="number"
              min="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              placeholder="Enter investment period"
            />
          </div>

          <Button onClick={calculateInvestment} className="w-full">
            Calculate Investment Growth
          </Button>
        </div>

        <div className="space-y-4">
          {result && (
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6 bg-primary/5">
                <h3 className="text-lg font-semibold mb-2">Results</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Final Balance</p>
                    <p className="text-2xl font-bold text-primary">
                      ${result.finalBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Contributions</p>
                    <p className="text-xl font-semibold">
                      ${result.totalContributions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <p className="text-xl font-semibold text-green-600">
                      ${result.totalEarnings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
