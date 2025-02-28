
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCw, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/strategies";

interface PaymentOverviewSectionProps {
  totalMinimumPayments: number;
  extraPayment: number;
  onExtraPaymentChange: (amount: number) => void;
  onOpenExtraPaymentDialog: () => void;
  currencySymbol?: string;
  totalDebtValue: number;
}

export const PaymentOverviewSection = ({
  totalMinimumPayments,
  extraPayment,
  onExtraPaymentChange,
  onOpenExtraPaymentDialog,
  currencySymbol = "£",
  totalDebtValue
}: PaymentOverviewSectionProps) => {
  // Add local input state to track user input without immediately updating the database
  const [inputValue, setInputValue] = useState<string>(extraPayment.toString());

  console.log('PaymentOverviewSection render:', {
    extraPayment,
    totalMinimumPayments,
    inputValue
  });

  const handleReset = () => {
    setInputValue("0");
    onExtraPaymentChange(0);
  };

  // Handle input changes without immediately updating the database
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the local input value as the user types
    setInputValue(e.target.value);
  };

  // Handle blur and Enter key to commit the changes
  const handleCommitChange = () => {
    // Parse input value and ensure it's a valid number
    const trimmedValue = inputValue.trim();
    
    // If the input is empty, set extra payment to 0
    if (!trimmedValue) {
      setInputValue("0");
      onExtraPaymentChange(0);
      return;
    }
    
    // Convert to number and validate
    const value = parseFloat(trimmedValue);
    
    // Only update if the value is a valid number
    if (!isNaN(value)) {
      // Ensure it doesn't exceed total debt value
      const validValue = Math.max(0, Math.min(value, totalDebtValue));
      
      // Update both local state and parent state
      setInputValue(validValue.toString());
      onExtraPaymentChange(validValue);
    } else {
      // Reset to current extra payment value if input is invalid
      setInputValue(extraPayment.toString());
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommitChange();
    }
  };

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Accelerate Your Debt Payoff
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add extra payments to reduce your debt faster and save on interest
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Required Monthly Payment</div>
            <div className="flex items-center h-10">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <span className="text-gray-500">{currencySymbol}</span>
                </div>
                <div className="pl-9 py-2 text-gray-700">
                  {formatCurrency(totalMinimumPayments, currencySymbol).replace(currencySymbol, '')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
            <div className="text-sm text-emerald-600 mb-2">Extra Monthly Payment</div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <span className="text-gray-500">{currencySymbol}</span>
                </div>
                <Input 
                  type="number" 
                  min="0"
                  step="any"
                  value={inputValue} 
                  onChange={handleInputChange}
                  onBlur={handleCommitChange}
                  onKeyDown={handleKeyDown}
                  className="pl-9 text-emerald-600 font-medium" 
                  placeholder="0" 
                />
              </div>
              {extraPayment > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleReset} 
                  className="h-10 w-10 rounded-full hover:bg-emerald-100/80"
                >
                  <RotateCw className="h-4 w-4 text-emerald-500" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Total Monthly Payment</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalMinimumPayments + extraPayment, currencySymbol)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
