
import { format } from "date-fns";

interface TimelineMetricsProps {
  baselineMonths: number;
  acceleratedMonths: number;
  monthsSaved: number;
  baselineLatestDate: Date;
  interestSaved: number;
  currencySymbol: string;
}

export const TimelineMetrics = ({ 
  baselineMonths, 
  acceleratedMonths, 
  monthsSaved,
  baselineLatestDate,
  interestSaved,
  currencySymbol
}: TimelineMetricsProps) => {
  // Ensure we have valid numbers before calculation
  const safeBaselineMonths = isNaN(baselineMonths) ? 0 : baselineMonths;
  const safeMonthsSaved = isNaN(monthsSaved) ? 0 : monthsSaved;
  
  // Calculate years and months for display
  const yearsSaved = Math.floor(safeMonthsSaved / 12);
  const remainingMonthsSaved = safeMonthsSaved % 12;
  
  // Format the time saved text
  const getFormattedTimeSaved = () => {
    if (safeMonthsSaved <= 0) return "";
    
    if (yearsSaved > 0 && remainingMonthsSaved > 0) {
      return `${yearsSaved} ${yearsSaved === 1 ? 'year' : 'years'} and ${remainingMonthsSaved} ${remainingMonthsSaved === 1 ? 'month' : 'months'}`;
    } else if (yearsSaved > 0) {
      return `${yearsSaved} ${yearsSaved === 1 ? 'year' : 'years'}`;
    } else {
      return `${remainingMonthsSaved} ${remainingMonthsSaved === 1 ? 'month' : 'months'}`;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Interest Saved</p>
          <p className="text-2xl font-bold text-emerald-600">
            {currencySymbol}{interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Original Term</p>
          <p className="text-2xl font-bold">
            {isNaN(safeBaselineMonths) ? 'N/A' : `${safeBaselineMonths} months`}
          </p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {safeMonthsSaved > 0 && (
          <span className="text-emerald-600">
            You'll be debt-free {getFormattedTimeSaved()} sooner and save {currencySymbol}{interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in interest!
          </span>
        )}
      </div>
    </div>
  );
};
