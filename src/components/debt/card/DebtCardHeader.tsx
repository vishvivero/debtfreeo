
import { Debt } from "@/lib/types/debt";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DebtCardHeaderProps {
  debt: Debt;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export const DebtCardHeader = ({ 
  debt, 
  onDelete, 
  onEdit 
}: DebtCardHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex justify-between items-center">
      <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-gray-900 truncate`}>{debt.name}</h3>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(debt.id)}
          className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
