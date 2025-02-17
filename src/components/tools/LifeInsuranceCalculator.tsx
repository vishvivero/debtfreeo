
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const LifeInsuranceCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState<number>(50000);
  const [age, setAge] = useState<number>(30);
  const [dependents, setDependents] = useState<number>(2);
  const [debtAmount, setDebtAmount] = useState<number>(100000);
  const [coverageYears, setCoverageYears] = useState<number>(20);
  const [riskLevel, setRiskLevel] = useState<string>("moderate");

  const [result, setResult] = useState<{
    recommendedCoverage: number;
    estimatedMonthlyPremium: number;
  } | null>(null);

  const calculateInsurance = () => {
    // Basic calculation formula:
    // Income replacement: Annual income * Years of coverage
    // Plus debt and final expenses
    // Adjusted by risk level multiplier
    const incomeReplacement = annualIncome * coverageYears;
    const finalExpenses = 25000; // Average funeral and final expenses

    let riskMultiplier = 1;
    switch (riskLevel) {
      case "low":
        riskMultiplier = 0.8;
        break;
      case "high":
        riskMultiplier = 1.2;
        break;
      default:
        riskMultiplier = 1;
    }

    const recommendedCoverage = Math.round(
      (incomeReplacement + debtAmount + finalExpenses + (dependents * 50000)) * riskMultiplier
    );

    // Rough monthly premium estimate (simplified)
    const baseRate = 0.1; // Base rate per $1000 of coverage
    const ageMultiplier = 1 + ((age - 25) * 0.03); // Increase by 3% per year over 25
    const estimatedMonthlyPremium = Math.round(
      (recommendedCoverage / 1000) * baseRate * ageMultiplier
    );

    setResult({
      recommendedCoverage,
      estimatedMonthlyPremium
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="annualIncome">Annual Income ($)</Label>
            <Input
              id="annualIncome"
              type="number"
              min="0"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              placeholder="Enter annual income"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Current Age</Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="75"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder="Enter your age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependents">Number of Dependents</Label>
            <Input
              id="dependents"
              type="number"
              min="0"
              value={dependents}
              onChange={(e) => setDependents(Number(e.target.value))}
              placeholder="Enter number of dependents"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debtAmount">Total Debt Amount ($)</Label>
            <Input
              id="debtAmount"
              type="number"
              min="0"
              value={debtAmount}
              onChange={(e) => setDebtAmount(Number(e.target.value))}
              placeholder="Enter total debt amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageYears">Desired Coverage Years</Label>
            <Input
              id="coverageYears"
              type="number"
              min="10"
              max="30"
              value={coverageYears}
              onChange={(e) => setCoverageYears(Number(e.target.value))}
              placeholder="Enter desired coverage years"
            />
          </div>

          <div className="space-y-2">
            <Label>Risk Level</Label>
            <Select
              value={riskLevel}
              onValueChange={setRiskLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="moderate">Moderate Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateInsurance} className="w-full">
            Calculate Insurance Needs
          </Button>
        </div>

        <div className="space-y-4">
          {result && (
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6 bg-primary/5">
                <h3 className="text-lg font-semibold mb-2">Insurance Recommendation</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Recommended Coverage</p>
                    <p className="text-2xl font-bold text-primary">
                      ${result.recommendedCoverage.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Monthly Premium</p>
                    <p className="text-xl font-semibold">
                      ${result.estimatedMonthlyPremium.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 mt-4">
                    <p>*Premium estimates are approximate and may vary by provider</p>
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
