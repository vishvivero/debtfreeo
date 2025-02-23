
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
    <div className="relative space-y-2">
      <Label className="text-sm font-medium text-gray-700">Next Payment Date</Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="date"
          value={formatDateForInput(date)}
          onChange={handleDateChange}
          className="pl-8 bg-white hover:border-primary/50 transition-colors w-full"
          min={formatDateForInput(new Date())}
          required
        />
      </div>
    </div>
  );
};
