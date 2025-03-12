
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SystemSettings {
  maintenanceMode: boolean;
  siteTitle: string;
  defaultCurrency: string;
  showPricing: boolean;
}

export const useSystemSettings = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("key", "site_settings")
        .single();

      if (error) {
        console.error("Error fetching system settings:", error);
        return {
          maintenanceMode: false,
          siteTitle: "Debtfreeo",
          defaultCurrency: "£",
          showPricing: true,
        };
      }

      const settingsValue = data?.value as Record<string, unknown>;
      return {
        maintenanceMode: Boolean(settingsValue?.maintenanceMode),
        siteTitle: String(settingsValue?.siteTitle || "Debtfreeo"),
        defaultCurrency: String(settingsValue?.defaultCurrency || "£"),
        showPricing: settingsValue?.showPricing === undefined ? true : Boolean(settingsValue?.showPricing),
      };
    },
  });

  return {
    settings: settings || {
      maintenanceMode: false,
      siteTitle: "Debtfreeo",
      defaultCurrency: "£",
      showPricing: true,
    },
    isLoading,
  };
};
