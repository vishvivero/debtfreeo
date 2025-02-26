
import { motion } from "framer-motion";

interface ProgressBarProps {
  percentage: number;
  color: string;
  label: string;
  value: string;
}

export const ProgressBar = ({ percentage, color, label, value }: ProgressBarProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${color}`}>{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  );
};
