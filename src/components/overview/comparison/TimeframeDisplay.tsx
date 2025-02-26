import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
interface TimeframeDisplayProps {
  years: number;
  months: number;
  label: string;
  className?: string;
}
export const TimeframeDisplay = ({
  years,
  months,
  label,
  className = ""
}: TimeframeDisplayProps) => {
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
  return;
};