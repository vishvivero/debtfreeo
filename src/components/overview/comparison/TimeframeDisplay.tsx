
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface TimeframeDisplayProps {
  years: number;
  months: number;
  label: string;
  className?: string;
}

export const TimeframeDisplay = ({ years, months, label, className = "" }: TimeframeDisplayProps) => {
  const timeDisplay = useMemo(() => {
    const parts = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    }
    return parts.join(' and ') || 'Less than a month';
  }, [years, months]);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-blue-50">
          <Calendar className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">{label}</h3>
          <p className="text-xl font-bold mt-1">{timeDisplay}</p>
        </div>
      </div>
    </Card>
  );
};
