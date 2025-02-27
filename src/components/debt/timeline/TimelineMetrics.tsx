
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
  // Calculate years and months for display
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remainingMonthsSaved = monthsSaved % 12;
  
  // Format the time saved text
  const getFormattedTimeSaved = () => {
    if (monthsSaved <= 0) return "";
    
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
            {baselineMonths} months
          </p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {monthsSaved > 0 && (
          <span className="text-emerald-600">
            You'll be debt-free {getFormattedTimeSaved()} sooner and save {currencySymbol}{interestSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in interest!
          </span>
        )}
      </div>
    </div>
  );
};
