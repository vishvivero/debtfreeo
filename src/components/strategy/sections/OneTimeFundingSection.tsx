
import { useState, useEffect } from "react";
import { DecimalToggle } from "@/components/DecimalToggle";
import { OneTimeFundingSection as OriginalOneTimeFundingSection } from "../OneTimeFundingSection";
import { useProfile } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";

export const OneTimeFundingSection = () => {
  const { profile, updateProfile } = useProfile();
  const [showOneTimeFunding, setShowOneTimeFunding] = useState(profile?.show_lump_sum_payments || false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setShowOneTimeFunding(profile.show_lump_sum_payments || false);
    }
  }, [profile]);

  const handleOneTimeFundingToggle = async (checked: boolean) => {
    console.log('Toggling lump sum payments:', checked);
    setShowOneTimeFunding(checked);
    if (profile) {
      try {
        await updateProfile.mutate({
          show_lump_sum_payments: checked
        });
      } catch (error) {
        console.error('Error updating lump sum payments preference:', error);
        toast({
          title: "Error",
          description: "Failed to save your preference",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Expecting any lump sum payments?</h3>
        <DecimalToggle
          showDecimals={showOneTimeFunding}
          onToggle={handleOneTimeFundingToggle}
          label="Add Lump Sum Payments"
        />
      </div>
      
      {showOneTimeFunding && <OriginalOneTimeFundingSection />}
    </div>
  );
};
