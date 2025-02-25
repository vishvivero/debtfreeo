
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDebts } from "@/hooks/use-debts";
import { Loader2 } from "lucide-react";
import { DebtCategorySelect } from "@/components/debt/DebtCategorySelect";
import { DebtDateSelect } from "@/components/debt/DebtDateSelect";
import { useToast } from "@/components/ui/use-toast";
import { DebtNameInput } from "@/components/debt/form/DebtNameInput";
import { BalanceInput } from "@/components/debt/form/BalanceInput";
import { InterestRateInput } from "@/components/debt/form/InterestRateInput";
import { MinimumPaymentInput } from "@/components/debt/form/MinimumPaymentInput";
import { validateDebtForm } from "@/lib/utils/validation";
import type { Debt } from "@/lib/types/debt";

export interface AddDebtFormProps {
  onAddDebt?: (debt: Omit<Debt, "id">) => Promise<void>;
  currencySymbol?: string;
}

export const AddDebtForm = ({ onAddDebt, currencySymbol = "£" }: AddDebtFormProps) => {
  const { addDebt } = useDebts();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Credit Card",
    balance: "",
    interestRate: "",
    minimumPayment: "",
    date: new Date()
  });

  const handleInputChange = (field: keyof typeof formData, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateDebtForm(formData)) return;

    setIsSubmitting(true);
    console.log("Form submitted with date:", formData.date);
    
    try {
      const newDebt: Omit<Debt, "id"> = {
        name: formData.name,
        balance: Number(formData.balance),
        interest_rate: Number(formData.interestRate),
        minimum_payment: Number(formData.minimumPayment),
        banker_name: "Not specified",
        currency_symbol: currencySymbol,
        next_payment_date: formData.date.toISOString(),
        category: formData.category,
        status: 'active'
      };

      console.log("Submitting debt:", newDebt);

      if (onAddDebt) {
        await onAddDebt(newDebt);
      } else {
        await addDebt.mutateAsync(newDebt);
        toast({
          title: "Success",
          description: "Debt added successfully",
        });
      }

      // Reset form
      setFormData({
        name: "",
        category: "Credit Card",
        balance: "",
        interestRate: "",
        minimumPayment: "",
        date: new Date()
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        <DebtCategorySelect 
          value={formData.category} 
          onChange={(value) => handleInputChange("category", value)} 
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

        <MinimumPaymentInput
          value={formData.minimumPayment}
          onChange={(value) => handleInputChange("minimumPayment", value)}
          disabled={isSubmitting}
        />

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
