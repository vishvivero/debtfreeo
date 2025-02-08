
import { Debt } from "@/lib/types/debt";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { EditDebtDialog } from "./EditDebtDialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DebtCardProps {
  debt: Debt;
  onDelete: (id: string) => void;
  calculatePayoffYears: (debt: Debt) => string;
}

export const DebtCard = ({
  debt,
  onDelete,
  calculatePayoffYears
}: DebtCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      console.log('Fetching payment history for debt:', debt.id);
      
      const { data: payments, error } = await supabase
        .from('payment_history')
        .select('total_payment')
        .eq('user_id', debt.user_id)
        .gte('payment_date', debt.created_at);

      if (error) {
        console.error('Error fetching payment history:', error);
        return;
      }

      const totalAmount = payments?.reduce((sum, payment) => sum + payment.total_payment, 0) || 0;
      console.log('Total amount paid:', totalAmount);
      setTotalPaid(totalAmount);
    };

    fetchPaymentHistory();
  }, [debt.id, debt.user_id, debt.created_at]);

  const getPayoffDetails = (debt: Debt): { months: number; formattedTime: string; progressPercentage: number } => {
    console.log('Calculating payoff details for debt:', {
      name: debt.name,
      balance: debt.balance,
      rate: debt.interest_rate,
      payment: debt.minimum_payment,
      totalPaid
    });

    const monthlyInterest = debt.interest_rate / 1200;
    const monthlyPayment = debt.minimum_payment;
    const balance = debt.balance;
    
    const monthlyInterestAmount = balance * monthlyInterest;
    
    if (monthlyPayment <= monthlyInterestAmount) {
      console.log('Payment cannot cover interest:', {
        payment: monthlyPayment,
        monthlyInterest: monthlyInterestAmount
      });
      return { months: Infinity, formattedTime: "Never", progressPercentage: 0 };
    }

    const months = Math.log(monthlyPayment / (monthlyPayment - balance * monthlyInterest)) / Math.log(1 + monthlyInterest);
    const originalBalance = balance + totalPaid;
    const progressPercentage = (totalPaid / originalBalance) * 100;
    
    console.log('Progress calculation:', {
      originalBalance,
      currentBalance: balance,
      totalPaid,
      months,
      progressPercentage
    });
    
    const years = Math.floor(months / 12);
    const remainingMonths = Math.ceil(months % 12);
    
    let formattedTime = "";
    if (years === 0) {
      formattedTime = `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else {
      formattedTime = `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }

    return { 
      months, 
      formattedTime, 
      progressPercentage: Number(progressPercentage.toFixed(1))
    };
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.scrollTo(0, 0);
    navigate(`/overview/debt/${debt.id}`);
  };

  const payoffDetails = getPayoffDetails(debt);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{debt.name}</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(debt.id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-gray-600 mb-1">Balance</p>
            <p className="text-2xl font-semibold">
              {debt.currency_symbol}{debt.balance.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Monthly Payment</p>
            <p className="text-2xl font-semibold">
              {debt.currency_symbol}{debt.minimum_payment.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">APR</p>
            <p className="text-2xl font-semibold">
              {debt.interest_rate}%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900">Progress</h4>
              <span className="text-sm font-medium text-gray-600">
                {payoffDetails.progressPercentage}%
              </span>
            </div>
            <Progress value={payoffDetails.progressPercentage} className="h-2" />
          </div>

          <Button 
            onClick={handleViewDetails}
            className="w-full bg-gradient-to-r from-emerald-400 to-blue-400 hover:from-emerald-500 hover:to-blue-500 text-white flex items-center justify-center gap-2"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-500">
              Standard repayment duration (without debt payoff strategy):
            </p>
            <p className="text-sm text-gray-600">
              {payoffDetails.formattedTime}
            </p>
          </div>
        </div>
      </motion.div>

      <EditDebtDialog 
        debt={debt}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};
