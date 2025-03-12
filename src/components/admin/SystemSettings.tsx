
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface SystemSettings {
  maintenanceMode: boolean;
  siteTitle: string;
  defaultCurrency: string;
  showPricing: boolean;  // New setting
}

interface SettingsResponse {
  id: string;
  key: string;
  value: SystemSettings;
  created_at: string;
  updated_at: string;
}

export const SystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [siteTitle, setSiteTitle] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("£");
  const [showPricing, setShowPricing] = useState(true);  // New state

  const { data: settings, isLoading } = useQuery<SettingsResponse>({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      console.log("Fetching system settings...");
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("key", "site_settings")
        .single();

      if (error) {
        console.error("Error fetching system settings:", error);
        throw error;
      }

      const settingsValue = data.value as Record<string, unknown>;
      const typedValue: SystemSettings = {
        maintenanceMode: Boolean(settingsValue.maintenanceMode),
        siteTitle: String(settingsValue.siteTitle || ""),
        defaultCurrency: String(settingsValue.defaultCurrency || "£"),
        showPricing: settingsValue.showPricing === undefined ? true : Boolean(settingsValue.showPricing),
      };

      const typedData: SettingsResponse = {
        ...data,
        value: typedValue,
      };

      console.log("Fetched system settings:", typedData);
      return typedData;
    },
  });

  useEffect(() => {
    if (settings?.value) {
      setMaintenanceMode(settings.value.maintenanceMode);
      setSiteTitle(settings.value.siteTitle);
      setDefaultCurrency(settings.value.defaultCurrency);
      setShowPricing(settings.value.showPricing);
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      console.log("Updating system settings:", newSettings);
      const settingsJson: Record<string, Json> = {
        maintenanceMode: newSettings.maintenanceMode,
        siteTitle: newSettings.siteTitle,
        defaultCurrency: newSettings.defaultCurrency,
        showPricing: newSettings.showPricing,
      };

      const { error } = await supabase
        .from("system_settings")
        .upsert({
          key: "site_settings",
          value: settingsJson,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast({
        title: "Success",
        description: "System settings updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating system settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update system settings",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance">Maintenance Mode</Label>
            <Switch
              id="maintenance"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showPricing">Show Pricing Page</Label>
            <Switch
              id="showPricing"
              checked={showPricing}
              onCheckedChange={setShowPricing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input
              id="siteTitle"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Enter site title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Input
              id="currency"
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              placeholder="Enter default currency symbol"
            />
          </div>
        </div>

        <Button
          onClick={() => updateSettings.mutate({
            maintenanceMode,
            siteTitle,
            defaultCurrency,
            showPricing,
          })}
          disabled={updateSettings.isPending}
          className="w-full"
        >
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};
