import { MainLayout } from "@/components/layout/MainLayout";
import { useProfile } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AccountInfoCard } from "@/components/profile/AccountInfoCard";
import { DisplayPreferences } from "@/components/profile/DisplayPreferences";
import { DangerZoneCard } from "@/components/profile/DangerZoneCard";

export default function Profile() {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(true);

  const handleCurrencyChange = async (currency: string) => {
    try {
      setIsUpdating(true);
      await updateProfile.mutateAsync({
        preferred_currency: currency
      });
      if (showNotifications) {
        toast({
          title: "Currency Updated",
          description: "Your preferred currency has been updated successfully."
        });
      }
    } catch (error) {
      console.error("Error updating currency:", error);
      if (showNotifications) {
        toast({
          title: "Error",
          description: "Failed to update currency preference",
          variant: "destructive"
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleChange = async (key: string, value: boolean) => {
    console.log(`Toggle ${key} changed to:`, value);
    if (key === 'notifications') {
      setShowNotifications(value);
    }
    if (showNotifications) {
      toast({
        title: "Preference Updated",
        description: `${key} preference has been updated.`
      });
    }
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account settings and preferences
        </p>

        <div className="grid gap-6">
          <AccountInfoCard />
          
          <DisplayPreferences
            preferredCurrency={profile?.preferred_currency || "GBP"}
            onCurrencyChange={handleCurrencyChange}
            onToggleChange={handleToggleChange}
            isUpdating={isUpdating}
          />

          <DangerZoneCard showNotifications={showNotifications} />
        </div>
      </div>
    </MainLayout>
  );
}