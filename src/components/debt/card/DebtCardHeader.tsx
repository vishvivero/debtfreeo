
import { Debt } from "@/lib/types/debt";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

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
  return (
    <div className="flex justify-between items-start mb-6">
      <h3 className="text-2xl font-bold text-gray-900">{debt.name}</h3>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
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
  );
};
