
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebts } from "@/hooks/use-debts";
import { CreditCard, Percent, Wallet, Coins, Loader2 } from "lucide-react";
import { DebtCategorySelect } from "@/components/debt/DebtCategorySelect";
import { DebtDateSelect } from "@/components/debt/DebtDateSelect";
import { useToast } from "@/components/ui/use-toast";
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a debt name",
        variant: "destructive",
      });
      return false;
    }

    const numberFields = {
      balance: formData.balance,
      interestRate: formData.interestRate,
      minimumPayment: formData.minimumPayment
    };

    for (const [field, value] of Object.entries(numberFields)) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue <= 0) {
        toast({
          title: "Error",
          description: `Please enter a valid ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (Number(formData.interestRate) > 100) {
      toast({
        title: "Error",
        description: "Interest rate cannot be greater than 100%",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) return;

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

        <div className="relative space-y-2">
          <Label className="text-sm font-medium text-gray-700">Debt Name</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="pl-10 bg-white hover:border-primary/50 transition-colors"
              placeholder="Credit Card, Personal Loan, etc."
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="relative space-y-2">
          <Label className="text-sm font-medium text-gray-700">Outstanding Debt Balance</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Wallet className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="number"
              value={formData.balance}
              onChange={(e) => handleInputChange("balance", e.target.value)}
              className="pl-10 bg-white hover:border-primary/50 transition-colors"
              placeholder="10000"
              required
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="relative space-y-2">
          <Label className="text-sm font-medium text-gray-700">Interest Rate (%)</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Percent className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="number"
              value={formData.interestRate}
              onChange={(e) => handleInputChange("interestRate", e.target.value)}
              className="pl-10 bg-white hover:border-primary/50 transition-colors"
              placeholder="5.5"
              required
              min="0"
              max="100"
              step="0.1"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="relative space-y-2">
          <Label className="text-sm font-medium text-gray-700">Minimum Payment / EMI</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Coins className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="number"
              value={formData.minimumPayment}
              onChange={(e) => handleInputChange("minimumPayment", e.target.value)}
              className="pl-10 bg-white hover:border-primary/50 transition-colors"
              placeholder="250"
              required
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
        </div>

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
