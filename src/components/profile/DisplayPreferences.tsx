import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";
import { Profile } from "@/lib/types";

interface DisplayPreferencesProps {
  profile: Profile | null;
  onLumpSumToggle?: (enabled: boolean) => void;
}

export const DisplayPreferences = ({ profile, onLumpSumToggle }: DisplayPreferencesProps) => {
  const { updateProfile } = useProfile();

  const handleExtraPaymentsToggle = async (checked: boolean) => {
    if (!profile) return;

    console.log('Toggling extra payments:', checked);
    try {
      await updateProfile.mutateAsync({
        ...profile,
        show_extra_payments: checked,
      });
    } catch (error) {
      console.error('Error updating extra payments preference:', error);
    }
  };

  const handleLumpSumToggle = async (checked: boolean) => {
    if (!profile) return;

    console.log('Toggling lump sum payments:', checked);
    try {
      // First update the profile preference
      await updateProfile.mutateAsync({
        ...profile,
        show_lump_sum_payments: checked,
      });
      
      // Then call the callback to handle one-time funding deletion if toggle is turned off
      if (!checked) {
        console.log('Lump sum payments disabled, calling deletion callback');
        onLumpSumToggle?.(checked);
      }
    } catch (error) {
      console.error('Error updating lump sum payments preference:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Extra Payments</Label>
            <p className="text-sm text-muted-foreground">
              Display extra payment options in debt management
            </p>
          </div>
          <Switch
            checked={profile?.show_extra_payments}
            onCheckedChange={handleExtraPaymentsToggle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Add Lump Sum Payments</Label>
            <p className="text-sm text-muted-foreground">
              Enable one-time funding options for faster debt payoff
            </p>
          </div>
          <Switch
            checked={profile?.show_lump_sum_payments}
            onCheckedChange={handleLumpSumToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};