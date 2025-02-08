
import { Debt } from "@/lib/types/debt";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface DebtTableRowProps {
  debt: Debt;
  index: number;
  payoffDetails: {
    months: number;
    totalInterest: number;
    payoffDate: Date;
    redistributionHistory?: {
      fromDebtId: string;
      amount: number;
      month: number;
    }[];
  };
  onUpdateDebt: (debt: Debt) => void;
  onDeleteClick: (debt: Debt) => void;
  showDecimals?: boolean;
  currencySymbol?: string;
}

export const DebtTableRow = ({
  debt,
  index,
  payoffDetails,
  onUpdateDebt,
  onDeleteClick,
  showDecimals = false,
  currencySymbol = '$'
}: DebtTableRowProps) => {
  const navigate = useNavigate();

  const formatPayoffTime = (months: number): string => {
    if (months === Infinity || months > 1200) return "Never";
    
    const years = Math.floor(months / 12);
    const remainingMonths = Math.ceil(months % 12);
    
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  const formatNumber = (num: number) => {
    return showDecimals 
      ? num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(num).toLocaleString();
  };

  const handleRowClick = () => {
    navigate(`/overview/debt/${debt.id}`);
  };

  return (
    <tr 
      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group"
    >
      <td className="py-4">
        <div>
          <h3 className="font-medium text-gray-900">{debt.banker_name}</h3>
        </div>
      </td>
      <td className="py-4">
        <span className="font-medium">{debt.name}</span>
      </td>
      <td className="py-4">
        <span className="font-medium number-font">
          {currencySymbol}{formatNumber(debt.balance)}
        </span>
      </td>
      <td className="py-4">
        <span className="font-medium number-font">{debt.interest_rate}%</span>
      </td>
      <td className="py-4">
        <span className="font-medium number-font">
          {currencySymbol}{formatNumber(debt.minimum_payment)}
        </span>
      </td>
      <td className="py-4">
        <span className="font-medium number-font">
          {currencySymbol}{formatNumber(payoffDetails.totalInterest)}
        </span>
      </td>
      <td className="py-4">
        <span className="font-medium number-font">
          {formatPayoffTime(payoffDetails.months)}
        </span>
      </td>
      <td className="py-4">
        <span className="font-medium number-font">
          {payoffDetails.payoffDate.toLocaleDateString('en-US', { 
            month: 'long',
            year: 'numeric'
          })}
        </span>
      </td>
      <td className="py-4">
        <div className="flex justify-end gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateDebt(debt);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(debt);
            }}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRowClick()}
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                >
                  <span className="text-sm">Details</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to see payment schedule and detailed analytics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </tr>
  );
};

