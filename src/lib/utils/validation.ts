
import { toast } from "@/components/ui/use-toast";

interface DebtFormData {
  name: string;
  balance: string;
  interestRate: string;
  minimumPayment: string;
  category: string;
  loanTermMonths?: string;
}

export const validateDebtForm = (formData: DebtFormData) => {
  if (!formData.name.trim()) {
    toast({
      title: "Error",
      description: "Please enter a debt name",
      variant: "destructive",
    });
    return false;
  }

  if (!formData.balance || Number(formData.balance) <= 0) {
    toast({
      title: "Error",
      description: "Please enter a valid balance",
      variant: "destructive",
    });
    return false;
  }

  if (!formData.interestRate || Number(formData.interestRate) < 0 || Number(formData.interestRate) > 100) {
    toast({
      title: "Error",
      description: "Please enter a valid interest rate between 0 and 100",
      variant: "destructive",
    });
    return false;
  }

  // For Gold Loans with loan term, we skip minimum payment validation
  const isGoldLoan = formData.category === "Gold Loan";
  
  if (!isGoldLoan && (!formData.minimumPayment || Number(formData.minimumPayment) <= 0)) {
    toast({
      title: "Error",
      description: "Please enter a valid minimum payment",
      variant: "destructive",
    });
    return false;
  }

  return true;
};
