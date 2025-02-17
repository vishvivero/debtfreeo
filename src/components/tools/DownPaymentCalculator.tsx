
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const DownPaymentCalculator = () => {
  const [homePrice, setHomePrice] = useState<number>(300000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [monthlySavings, setMonthlySavings] = useState<number>(1000);
  const [currentSavings, setCurrentSavings] = useState<number>(10000);
  const [annualReturn, setAnnualReturn] = useState<number>(2);

  const [result, setResult] = useState<{
    downPaymentAmount: number;
    monthsToGoal: number;
    totalSavingsNeeded: number;
    additionalSavingsNeeded: number;
  } | null>(null);

  const calculateDownPayment = () => {
    const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
    const additionalSavingsNeeded = downPaymentAmount - currentSavings;
    
    // Calculate months needed with compound interest
    const monthlyRate = (annualReturn / 100) / 12;
    let accumulated = currentSavings;
    let months = 0;
    
    while (accumulated < downPaymentAmount && months < 600) {
      accumulated += monthlySavings;
      accumulated *= (1 + monthlyRate);
      months++;
    }

    setResult({
      downPaymentAmount,
      monthsToGoal: months,
      totalSavingsNeeded: downPaymentAmount,
      additionalSavingsNeeded
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homePrice">Target Home Price ($)</Label>
            <Input
              id="homePrice"
              type="number"
              min="0"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              placeholder="Enter target home price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPaymentPercent">Down Payment Percentage (%)</Label>
            <Input
              id="downPaymentPercent"
              type="number"
              min="3"
              max="100"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              placeholder="Enter down payment percentage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentSavings">Current Savings ($)</Label>
            <Input
              id="currentSavings"
              type="number"
              min="0"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              placeholder="Enter current savings"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlySavings">Monthly Savings ($)</Label>
            <Input
              id="monthlySavings"
              type="number"
              min="0"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(Number(e.target.value))}
              placeholder="Enter monthly savings amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualReturn">Expected Annual Return (%)</Label>
            <Input
              id="annualReturn"
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              placeholder="Enter expected annual return"
            />
          </div>

          <Button onClick={calculateDownPayment} className="w-full">
            Calculate Down Payment Plan
          </Button>
        </div>

        <div className="space-y-4">
          {result && (
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6 bg-primary/5">
                <h3 className="text-lg font-semibold mb-2">Down Payment Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Required Down Payment</p>
                    <p className="text-2xl font-bold text-primary">
                      ${result.downPaymentAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Additional Savings Needed</p>
                    <p className="text-xl font-semibold">
                      ${result.additionalSavingsNeeded.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time to Goal</p>
                    <p className="text-xl font-semibold">
                      {result.monthsToGoal < 600 ? 
                        `${Math.round(result.monthsToGoal)} months` : 
                        'More than 50 years'}
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
