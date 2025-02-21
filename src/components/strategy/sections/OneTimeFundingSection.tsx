
import { DecimalToggle } from "@/components/DecimalToggle";
import { OneTimeFundingSection as BaseOneTimeFundingSection } from "../OneTimeFundingSection";

interface OneTimeFundingSectionProps {
  showOneTimeFunding: boolean;
  onToggleOneTimeFunding: (checked: boolean) => void;
}

export const OneTimeFundingSection = ({
  showOneTimeFunding,
  onToggleOneTimeFunding,
}: OneTimeFundingSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Expecting any lump sum payments?</h3>
        <DecimalToggle
          showDecimals={showOneTimeFunding}
          onToggle={onToggleOneTimeFunding}
          label="Add Lump Sum Payments"
        />
      </div>
      
      {showOneTimeFunding && <BaseOneTimeFundingSection />}
    </div>
  );
};
