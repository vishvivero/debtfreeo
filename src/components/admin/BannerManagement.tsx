
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";

export const BannerManagement = () => {
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const { data: bannerSettings, isLoading } = useQuery({
    queryKey: ["bannerSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Use useEffect to handle the data changes
  useEffect(() => {
    if (bannerSettings) {
      setIsVisible(bannerSettings.is_visible);
      setMessage(bannerSettings.message);
      setLinkUrl(bannerSettings.link_url || "");
      setLinkText(bannerSettings.link_text || "");
    }
  }, [bannerSettings]);

  const updateBanner = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("banner_settings")
        .update({
          is_visible: isVisible,
          message,
          link_url: linkUrl,
          link_text: linkText,
        })
        .eq("id", bannerSettings?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bannerSettings"] });
      toast({
        title: "Success",
        description: "Banner settings have been updated",
      });
    },
    onError: (error) => {
      console.error("Error updating banner:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update banner settings",
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
        <CardTitle>Banner Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="banner-visibility">Show Banner</Label>
          <Switch
            id="banner-visibility"
            checked={isVisible}
            onCheckedChange={setIsVisible}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner-message">Banner Message</Label>
          <Input
            id="banner-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter banner message"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner-link">Link URL</Label>
          <Input
            id="banner-link"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter link URL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner-link-text">Link Text</Label>
          <Input
            id="banner-link-text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Enter link text"
          />
        </div>

        <Button
          onClick={() => updateBanner.mutate()}
          disabled={updateBanner.isPending}
          className="w-full"
        >
          {updateBanner.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Banner Settings
        </Button>
      </CardContent>
    </Card>
  );
};
