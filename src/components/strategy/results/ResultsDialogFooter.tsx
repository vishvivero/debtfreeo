import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ResultsDialogFooterProps {
  currentView: 'initial' | 'timeline' | 'insights';
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
  onViewFullResults?: () => void;
}

export const ResultsDialogFooter = ({
  currentView,
  onBack,
  onNext,
  onClose,
  onViewFullResults
}: ResultsDialogFooterProps) => {
  if (currentView === 'insights') {
    return (
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onViewFullResults && (
            <Button onClick={onViewFullResults}>
              View Full Results
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'timeline') {
    return (
      <div className="mt-6 flex justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button className="flex items-center gap-2 bg-[#00D382] hover:bg-[#00D382]/90 text-white" onClick={onNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Initial view
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex justify-center pt-4"
    >
      <Button className="w-full gap-2 bg-[#00D382] hover:bg-[#00D382]/90 text-white" onClick={onNext}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};
