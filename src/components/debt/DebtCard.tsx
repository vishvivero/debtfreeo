
import { Debt } from "@/lib/types/debt";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditDebtDialog } from "./EditDebtDialog";
import { DebtCardHeader } from "./card/DebtCardHeader";
import { DebtCardDetails } from "./card/DebtCardDetails";
import { DebtCardProgress } from "./card/DebtCardProgress";
import { useDebtPaymentHistory } from "@/hooks/use-debt-payment-history";
import { calculatePayoffDetails } from "./utils/debtPayoffCalculator";

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
  const { totalPaid } = useDebtPaymentHistory(debt);
  const navigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.scrollTo(0, 0);
    navigate(`/overview/debt/${debt.id}`);
  };

  const payoffDetails = calculatePayoffDetails(debt, totalPaid);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <DebtCardHeader 
          debt={debt} 
          onDelete={onDelete} 
          onEdit={() => setIsEditDialogOpen(true)} 
        />
        
        <DebtCardDetails debt={debt} />
        
        <DebtCardProgress 
          progressPercentage={payoffDetails.progressPercentage} 
          onViewDetails={handleViewDetails}
          payoffTime={payoffDetails.formattedTime}
        />
      </motion.div>

      <EditDebtDialog 
        debt={debt}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};
