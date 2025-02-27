
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AmortizationTable } from "@/components/debt/AmortizationTable";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/use-profile";
import { AmortizationEntry } from "@/lib/utils/payment/standardizedCalculations";
import { Debt } from "@/lib/types";

export const AmortizationCalculator = () => {
  const { profile } = useProfile();
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [currency, setCurrency] = useState(profile?.preferred_currency || "£");
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationEntry[]>([]);

  const calculateAmortization = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const months = parseInt(loanTerm) * 12;
    const monthlyRate = annualRate / 12;

    // Calculate monthly payment using the amortization formula
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const schedule: AmortizationEntry[] = [];
    let balance = principal;
    let currentDate = new Date();

    for (let i = 0; i < months; i++) {
      const interest = balance * monthlyRate;
      const principalPaid = monthlyPayment - interest;
      const startingBalance = balance;
      balance -= principalPaid;
      const endingBalance = Math.max(0, balance);

      schedule.push({
        date: new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
        startingBalance,
        payment: monthlyPayment,
        principal: principalPaid,
        interest: interest,
        endingBalance,
        remainingBalance: endingBalance
      });
    }

    setAmortizationSchedule(schedule);
  };

  // Create a dummy debt object for the amortization table
  const dummyDebt: Debt = {
    id: "calculator",
    name: "Calculator",
    banker_name: "Calculator",
    balance: parseFloat(loanAmount) || 0,
    interest_rate: parseFloat(interestRate) || 0,
    minimum_payment: 0,
    currency_symbol: currency,
    status: 'active'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Loan Amortization Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <div className="flex gap-2">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="£">GBP (£)</SelectItem>
                    <SelectItem value="$">USD ($)</SelectItem>
                    <SelectItem value="€">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="loanAmount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="Enter loan amount"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Enter interest rate"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term (Years)</Label>
              <Input
                id="loanTerm"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                placeholder="Enter loan term in years"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={calculateAmortization}
                disabled={!loanAmount || !interestRate || !loanTerm}
                className="w-full"
              >
                Calculate
              </Button>
            </div>
          </div>

          {amortizationSchedule.length > 0 && (
            <div className="mt-8">
              <AmortizationTable
                debt={dummyDebt}
                amortizationData={amortizationSchedule}
                currencySymbol={currency}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
