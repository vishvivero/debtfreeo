import { FolderIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DebtCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const debtCategories = [
  "Credit Card",
  "Personal Loan",
  "Student Loan",
  "Mortgage",
  "Auto Loan",
  "Medical Debt",
  "Business Loan",
  "Other"
];

export const DebtCategorySelect = ({ value, onChange }: DebtCategorySelectProps) => {
  return (
    <div className="relative">
      <Label className="text-sm font-medium text-gray-700">Debt Category</Label>
      <div className="mt-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full bg-white">
            <div className="flex items-center">
              <FolderIcon className="h-5 w-5 text-gray-400 mr-2" />
              <SelectValue placeholder="Select a category" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border rounded-md z-50">
            {debtCategories.map((cat) => (
              <SelectItem key={cat} value={cat} className="hover:bg-gray-100">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};