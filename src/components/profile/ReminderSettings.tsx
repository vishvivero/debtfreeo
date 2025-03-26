
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";
import { Profile } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ReminderSettingsProps {
  profile: Profile | null;
}

export const ReminderSettings = ({ profile }: ReminderSettingsProps) => {
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRemindersToggle = async (checked: boolean) => {
    if (!profile) return;

    try {
      setIsUpdating(true);
      await updateProfile.mutateAsync({
        ...profile,
        payment_reminders_enabled: checked,
      });
      
      toast({
        title: checked ? "Reminders enabled" : "Reminders disabled",
        description: checked 
          ? "You'll receive email reminders for your debt payments." 
          : "You won't receive any payment reminders.",
      });
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder settings",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReminderDaysChange = async (days: string) => {
    if (!profile) return;
    
    try {
      setIsUpdating(true);
      await updateProfile.mutateAsync({
        ...profile,
        reminder_days_before: parseInt(days, 10),
      });
      
      toast({
        title: "Reminder schedule updated",
        description: `You'll now receive reminders ${days} days before payment due dates.`,
      });
    } catch (error) {
      console.error('Error updating reminder days:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder schedule",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Reminder Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Receive email reminders for upcoming debt payments
            </p>
          </div>
          <Switch
            checked={profile?.payment_reminders_enabled}
            onCheckedChange={handleRemindersToggle}
            disabled={isUpdating}
          />
        </div>
        
        {profile?.payment_reminders_enabled && (
          <div className="space-y-2">
            <Label>Reminder Schedule</Label>
            <p className="text-sm text-muted-foreground mb-2">
              When should we send reminders before the payment date?
            </p>
            <Select 
              defaultValue={profile?.reminder_days_before?.toString() || "3"}
              onValueChange={handleReminderDaysChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select days before payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day before</SelectItem>
                <SelectItem value="2">2 days before</SelectItem>
                <SelectItem value="3">3 days before</SelectItem>
                <SelectItem value="5">5 days before</SelectItem>
                <SelectItem value="7">7 days before</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm mt-2">
              You'll also receive a reminder on the day of the payment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
