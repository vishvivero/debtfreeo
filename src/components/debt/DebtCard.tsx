
import { useState } from "react";
import { Debt } from "@/lib/types/debt";
import { Card } from "@/components/ui/card";
import { DebtCardHeader } from "./card/DebtCardHeader";
import { DebtCardDetails } from "./card/DebtCardDetails";
import { DebtCardProgress } from "./card/DebtCardProgress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditDebtDialog } from "./EditDebtDialog";
import { motion } from "framer-motion";
import { useDebtMutations } from "@/hooks/use-debt-mutations";

interface DebtCardProps {
  debt: Debt;
  onDelete: (id: string) => void;
  calculatePayoffYears: (debt: Debt) => string;
}

export const DebtCard = ({ debt, onDelete, calculatePayoffYears }: DebtCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { updateDebt } = useDebtMutations();

  const handleViewDetails = () => {
    navigate(`/overview/debt/${debt.id}`);
  };
  
  // Calculate progress percentage
  const progressPercentage = 0; // This should be calculated based on debt payment history
  const payoffTime = calculatePayoffYears(debt);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-100">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <DebtCardHeader 
            debt={debt} 
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => onDelete(debt.id)}
          />
          
          <DebtCardDetails 
            debt={debt}
            calculatePayoffYears={calculatePayoffYears}
            onViewDetails={handleViewDetails}
            isExpanded={isOpen}
          />
          
          {/* Show progress bar if debt is active and has some minimum payment */}
          {debt.status === 'active' && debt.minimum_payment > 0 && (
            <DebtCardProgress 
              debt={debt}
              progressPercentage={progressPercentage}
              payoffTime={payoffTime}
              onViewDetails={handleViewDetails}
            />
          )}
          
          <CollapsibleTrigger className="w-full flex items-center justify-center py-1 hover:bg-gray-50 text-gray-500">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            {/* Additional content when expanded */}
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {/* Edit Debt Dialog */}
      <EditDebtDialog 
        debt={debt} 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
      />
    </motion.div>
  );
};
