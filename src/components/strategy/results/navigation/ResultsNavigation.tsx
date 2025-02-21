
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResultsNavigationProps {
  currentView: 'initial' | 'timeline' | 'insights';
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
}

export const ResultsNavigation = ({
  currentView,
  onBack,
  onNext,
  onClose,
}: ResultsNavigationProps) => {
  return (
    <div className="mt-6 flex justify-between gap-4">
      {currentView !== 'initial' && (
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      )}
      
      {currentView === 'initial' ? (
        <Button 
          variant="outline" 
          onClick={onClose}
          className="w-full"
        >
          Close
        </Button>
      ) : currentView === 'insights' ? (
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Close
        </Button>
      ) : null}

      {currentView !== 'insights' && (
        <Button 
          className="flex items-center gap-2 bg-[#00D382] hover:bg-[#00D382]/90 text-white" 
          onClick={onNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
