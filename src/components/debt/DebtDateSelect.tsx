
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DebtDateSelectProps {
  date: Date;
  onSelect: (date: Date | undefined) => void;
}

export const DebtDateSelect = ({ date, onSelect }: DebtDateSelectProps) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Date changed:", e.target.value);
    const newDate = e.target.value ? new Date(e.target.value) : undefined;
    onSelect(newDate);
  };

  // Format date to YYYY-MM-DD for input value
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-2 w-full">
      <Label className="text-sm font-medium text-gray-700">Next Payment Date</Label>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="date"
          value={formatDateForInput(date)}
          onChange={handleDateChange}
          className="pl-10 pr-4 py-2 w-full h-12 rounded-lg border border-gray-200 bg-white hover:border-primary/50 transition-colors text-base"
          min={formatDateForInput(new Date())}
          required
        />
      </div>
    </div>
  );
};
