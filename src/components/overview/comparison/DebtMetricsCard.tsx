
import { motion } from "framer-motion";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { ReactNode } from "react";

interface DebtMetricsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  info: string;
  delay?: number;
}

export const DebtMetricsCard = ({
  title,
  value,
  icon,
  info,
  delay = 0
}: DebtMetricsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-700">
            {icon}
          </div>
          <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="end" className="w-64">
            <p className="text-sm text-gray-600 dark:text-gray-300">{info}</p>
          </HoverCardContent>
        </HoverCard>
      </div>
      <p className="mt-2 text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </motion.div>
  );
};
