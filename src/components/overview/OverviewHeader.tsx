import { CurrencySelector } from "@/components/profile/CurrencySelector";
import { useProfile } from "@/hooks/use-profile";
import { useToast } from "@/components/ui/use-toast";

export const OverviewHeader = () => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const handleCurrencyChange = async (currency: string) => {
    if (!profile) return;
    
    try {
      await updateProfile.mutateAsync({
        preferred_currency: currency
      });
      
      toast({
        title: "Currency Updated",
        description: "Your preferred currency has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating currency:', error);
      toast({
        title: "Error",
        description: "Failed to update currency preference",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
          Your Debt Overview
        </h1>
        <p className="text-gray-600">
          Track Your Progress Toward Financial Freedom
        </p>
      </div>
      <CurrencySelector
        value={profile?.preferred_currency || '£'}
        onValueChange={handleCurrencyChange}
      />
    </div>
  );
};