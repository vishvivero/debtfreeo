
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
  const safeAcceleratedMonths = isNaN(acceleratedMonths) ? 0 : acceleratedMonths;
  const safeMonthsSaved = isNaN(monthsSaved) ? 0 : monthsSaved;
  
  // Calculate years and months for display
  const yearsSaved = Math.floor(safeMonthsSaved / 12);
  const remainingMonthsSaved = safeMonthsSaved % 12;
  
  // Format the time saved text
  const getFormattedTimeSaved = () => {
    if (safeMonthsSaved <= 0) return "No time";
    
    if (yearsSaved > 0 && remainingMonthsSaved > 0) {
      return `${yearsSaved} ${yearsSaved === 1 ? 'year' : 'years'} and ${remainingMonthsSaved} ${remainingMonthsSaved === 1 ? 'month' : 'months'}`;
    } else if (yearsSaved > 0) {
      return `${yearsSaved} ${yearsSaved === 1 ? 'year' : 'years'}`;
    } else {
      return `${remainingMonthsSaved} ${remainingMonthsSaved === 1 ? 'month' : 'months'}`;
    }
  };

  // Format the original term
  const getFormattedOriginalTerm = () => {
    if (safeBaselineMonths <= 0) return 'N/A';
    
    const years = Math.floor(safeBaselineMonths / 12);
    const remainingMonths = safeBaselineMonths % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years}y ${remainingMonths}m`;
    } else if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      return `${safeBaselineMonths} months`;
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
            {getFormattedOriginalTerm()}
          </p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {safeMonthsSaved > 0 ? (
          <span className="text-emerald-600">
            You'll be debt-free {getFormattedTimeSaved()} sooner and save {currencySymbol}{interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in interest!
          </span>
        ) : (
          <span className="text-gray-500">
            Using your current payment plan. Add extra payments to see potential time savings.
          </span>
        )}
      </div>
    </div>
  );
};
