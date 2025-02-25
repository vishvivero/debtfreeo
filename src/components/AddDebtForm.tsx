
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDebts } from "@/hooks/use-debts";
import { Loader2, Info } from "lucide-react";
import { DebtCategorySelect } from "@/components/debt/DebtCategorySelect";
import { DebtDateSelect } from "@/components/debt/DebtDateSelect";
import { useToast } from "@/components/ui/use-toast";
import { DebtNameInput } from "@/components/debt/form/DebtNameInput";
import { BalanceInput } from "@/components/debt/form/BalanceInput";
import { InterestRateInput } from "@/components/debt/form/InterestRateInput";
import { MinimumPaymentInput } from "@/components/debt/form/MinimumPaymentInput";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { validateDebtForm } from "@/lib/utils/validation";
import { addMonths } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Debt } from "@/lib/types/debt";

export interface AddDebtFormProps {
  onAddDebt?: (debt: Omit<Debt, "id">) => Promise<void>;
  currencySymbol?: string;
}

export const AddDebtForm = ({ onAddDebt, currencySymbol = "£" }: AddDebtFormProps) => {
  const { addDebt } = useDebts();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useLoanTerm, setUseLoanTerm] = useState(false);
  const [calculatedInterest, setCalculatedInterest] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Credit Card",
    balance: "",
    interestRate: "",
    minimumPayment: "",
    date: new Date(),
    loanTermMonths: "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateGoldLoanMinimumPayment = (balance: number, interestRate: number): number => {
    const monthlyInterestRate = interestRate / 100 / 12;
    return Number((balance * monthlyInterestRate).toFixed(2));
  };

  // Calculate interest whenever balance or interest rate changes
  useEffect(() => {
    if (formData.category === "Gold Loan" && useLoanTerm && formData.balance && formData.interestRate) {
      const interest = calculateGoldLoanMinimumPayment(
        Number(formData.balance),
        Number(formData.interestRate)
      );
      setCalculatedInterest(interest);
    } else {
      setCalculatedInterest(null);
    }
  }, [formData.balance, formData.interestRate, formData.category, useLoanTerm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const isGoldLoan = formData.category === "Gold Loan";
    
    if (isGoldLoan && useLoanTerm) {
      if (!formData.loanTermMonths || Number(formData.loanTermMonths) <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid loan term",
          variant: "destructive",
        });
        return;
      }
    } else if (!validateDebtForm(formData)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const balance = Number(formData.balance);
      const interestRate = Number(formData.interestRate);
      const loanTermMonths = isGoldLoan && useLoanTerm ? parseInt(formData.loanTermMonths) : undefined;
      const finalPaymentDate = isGoldLoan && loanTermMonths 
        ? addMonths(formData.date, loanTermMonths).toISOString()
        : undefined;

      // Calculate minimum payment for gold loans with loan term
      let minimumPayment = Number(formData.minimumPayment);
      if (isGoldLoan && useLoanTerm) {
        minimumPayment = calculateGoldLoanMinimumPayment(balance, interestRate);
        console.log('Calculated gold loan minimum payment:', {
          balance,
          interestRate,
          minimumPayment,
          loanTermMonths
        });
      }

      const newDebt: Omit<Debt, "id"> = {
        name: formData.name,
        balance: balance,
        interest_rate: interestRate,
        minimum_payment: minimumPayment,
        banker_name: "Not specified",
        currency_symbol: currencySymbol,
        next_payment_date: formData.date.toISOString(),
        category: formData.category,
        status: 'active',
        is_gold_loan: isGoldLoan,
        loan_term_months: loanTermMonths,
        final_payment_date: finalPaymentDate
      };

      if (onAddDebt) {
        await onAddDebt(newDebt);
      } else {
        await addDebt.mutateAsync(newDebt);
        toast({
          title: "Success",
          description: "Debt added successfully",
        });
      }

      setFormData({
        name: "",
        category: "Credit Card",
        balance: "",
        interestRate: "",
        minimumPayment: "",
        date: new Date(),
        loanTermMonths: ""
      });
      setUseLoanTerm(false);
    } catch (error) {
      console.error("Error adding debt:", error);
      toast({
        title: "Error",
        description: "Failed to add debt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGoldLoan = formData.category === "Gold Loan";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        <DebtCategorySelect 
          value={formData.category} 
          onChange={(value) => {
            handleInputChange("category", value);
            if (value !== "Gold Loan") {
              setUseLoanTerm(false);
            }
          }} 
        />

        <DebtNameInput
          value={formData.name}
          onChange={(value) => handleInputChange("name", value)}
          disabled={isSubmitting}
        />

        <BalanceInput
          value={formData.balance}
          onChange={(value) => handleInputChange("balance", value)}
          disabled={isSubmitting}
        />

        <InterestRateInput
          value={formData.interestRate}
          onChange={(value) => handleInputChange("interestRate", value)}
          disabled={isSubmitting}
        />

        {isGoldLoan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="payment-type" className="text-sm font-medium text-gray-700">
                Use Loan Term Instead of Minimum Payment
              </Label>
              <Switch
                id="payment-type"
                checked={useLoanTerm}
                onCheckedChange={setUseLoanTerm}
              />
            </div>

            {useLoanTerm && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="loanTermMonths" className="text-sm font-medium text-gray-700">
                    Loan Term (Months)
                  </Label>
                  <Input
                    id="loanTermMonths"
                    type="number"
                    min="1"
                    max="240"
                    value={formData.loanTermMonths}
                    onChange={(e) => handleInputChange("loanTermMonths", e.target.value)}
                    placeholder="Enter loan term in months"
                    className="w-full"
                    required
                  />
                </div>

                {calculatedInterest !== null && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      Your monthly interest-only payment will be {currencySymbol}{calculatedInterest.toLocaleString()}. 
                      The full principal amount of {currencySymbol}{Number(formData.balance).toLocaleString()} will be due at the end of the loan term.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        {(!isGoldLoan || !useLoanTerm) && (
          <MinimumPaymentInput
            value={formData.minimumPayment}
            onChange={(value) => handleInputChange("minimumPayment", value)}
            disabled={isSubmitting}
          />
        )}

        <DebtDateSelect 
          date={formData.date} 
          onSelect={(newDate) => {
            console.log("Date selected in form:", newDate);
            newDate && handleInputChange("date", newDate);
          }} 
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white transition-colors"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Debt...
          </>
        ) : (
          'Add Debt'
        )}
      </Button>
    </form>
  );
};

export default AddDebtForm;
