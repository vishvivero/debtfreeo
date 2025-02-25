
import { toast } from "@/components/ui/use-toast";

interface ValidationFields {
  name: string;
  balance: string;
  interestRate: string;
  minimumPayment: string;
}

export const validateDebtForm = (fields: ValidationFields): boolean => {
  if (!fields.name.trim()) {
    toast({
      title: "Error",
      description: "Please enter a debt name",
      variant: "destructive",
    });
    return false;
  }

  const numberFields = {
    balance: fields.balance,
    interestRate: fields.interestRate,
    minimumPayment: fields.minimumPayment
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

  if (Number(fields.interestRate) > 100) {
    toast({
      title: "Error",
      description: "Interest rate cannot be greater than 100%",
      variant: "destructive",
    });
    return false;
  }

  return true;
};
