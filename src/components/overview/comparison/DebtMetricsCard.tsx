
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden backdrop-blur-sm ${className}`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <motion.h3 
                className="font-semibold text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + 0.1 }}
              >
                {title}
              </motion.h3>
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
            <motion.p 
              className="text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <motion.p 
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.3 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
          <motion.div 
            className={`p-3 rounded-full bg-gray-50`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: delay + 0.2 }}
          >
            {icon}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
