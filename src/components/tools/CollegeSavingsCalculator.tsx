
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const CollegeSavingsCalculator = () => {
  const [childAge, setChildAge] = useState<number>(5);
  const [collegeType, setCollegeType] = useState<string>("public");
  const [yearsOfCollege, setYearsOfCollege] = useState<number>(4);
  const [currentSavings, setCurrentSavings] = useState<number>(5000);
  const [monthlySavings, setMonthlySavings] = useState<number>(200);
  const [expectedReturn, setExpectedReturn] = useState<number>(6);

  const [result, setResult] = useState<{
    totalCost: number;
    monthlyAmount: number;
    projectedSavings: number;
    shortfall: number;
  } | null>(null);

  const calculateCollegeSavings = () => {
    // Average annual costs (2023 estimates)
    const annualCosts = {
      public: 25000,
      private: 55000,
      community: 12000
    };

    const yearsUntilCollege = 18 - childAge;
    const annualCost = annualCosts[collegeType as keyof typeof annualCosts];
    const totalCost = annualCost * yearsOfCollege * Math.pow(1.05, yearsUntilCollege); // 5% annual inflation

    // Calculate future value of current savings
    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsUntilCollege * 12;
    
    let projectedSavings = currentSavings * Math.pow(1 + monthlyRate, months);
    let futureValueOfMonthly = monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    projectedSavings += futureValueOfMonthly;

    // Calculate required monthly savings for remaining amount
    const shortfall = Math.max(0, totalCost - projectedSavings);
    const requiredMonthly = shortfall === 0 ? 0 : 
      (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);

    setResult({
      totalCost: Math.round(totalCost),
      monthlyAmount: Math.round(requiredMonthly),
      projectedSavings: Math.round(projectedSavings),
      shortfall: Math.round(shortfall)
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="childAge">Child's Current Age</Label>
            <Input
              id="childAge"
              type="number"
              min="0"
              max="17"
              value={childAge}
              onChange={(e) => setChildAge(Number(e.target.value))}
              placeholder="Enter child's age"
            />
          </div>

          <div className="space-y-2">
            <Label>College Type</Label>
            <Select
              value={collegeType}
              onValueChange={setCollegeType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select college type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public University</SelectItem>
                <SelectItem value="private">Private University</SelectItem>
                <SelectItem value="community">Community College</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsOfCollege">Years of College</Label>
            <Input
              id="yearsOfCollege"
              type="number"
              min="1"
              max="6"
              value={yearsOfCollege}
              onChange={(e) => setYearsOfCollege(Number(e.target.value))}
              placeholder="Enter years of college"
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
            <Label htmlFor="monthlySavings">Current Monthly Savings ($)</Label>
            <Input
              id="monthlySavings"
              type="number"
              min="0"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(Number(e.target.value))}
              placeholder="Enter monthly savings"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
            <Input
              id="expectedReturn"
              type="number"
              step="0.1"
              min="0"
              max="15"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              placeholder="Enter expected annual return"
            />
          </div>

          <Button onClick={calculateCollegeSavings} className="w-full">
            Calculate College Savings Plan
          </Button>
        </div>

        <div className="space-y-4">
          {result && (
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6 bg-primary/5">
                <h3 className="text-lg font-semibold mb-2">College Savings Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Estimated Total Cost</p>
                    <p className="text-2xl font-bold text-primary">
                      ${result.totalCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Projected Savings</p>
                    <p className="text-xl font-semibold text-green-600">
                      ${result.projectedSavings.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Additional Monthly Savings Needed</p>
                    <p className="text-xl font-semibold">
                      ${result.monthlyAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Projected Shortfall</p>
                    <p className="text-xl font-semibold text-amber-600">
                      ${result.shortfall.toLocaleString()}
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
