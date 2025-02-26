
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DebtMetricsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  info?: string;
  icon: React.ReactNode;
  className?: string;
  delay?: number;
}

export const DebtMetricsCard = ({
  title,
  value,
  subtitle,
  info,
  icon,
  className = "",
  delay = 0,
}: DebtMetricsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={`p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {info && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-full bg-gray-50">{icon}</div>
        </div>
      </Card>
    </motion.div>
  );
};
