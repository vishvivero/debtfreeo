
import { toast } from "@/components/ui/use-toast";

export const validateDebtForm = (formData: any) => {
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

  if (!formData.interestRate || Number(formData.interestRate) < 0) {
    toast({
      title: "Error",
      description: "Please enter a valid interest rate",
      variant: "destructive",
    });
    return false;
  }

  // Skip minimum payment validation for gold loans using loan term
  if (!(formData.category === "Gold Loan") && (!formData.minimumPayment || Number(formData.minimumPayment) <= 0)) {
    toast({
      title: "Error",
      description: "Please enter a valid minimum payment",
      variant: "destructive",
    });
    return false;
  }

  return true;
};
