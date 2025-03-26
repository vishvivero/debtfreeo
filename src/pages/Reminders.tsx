
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { Loader2, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReminderSettings } from "@/components/profile/ReminderSettings";

export default function Reminders() {
  const { profile, isLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("settings");

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Payment Reminders</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Customize when and how you receive reminders for upcoming debt payments
        </p>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="settings">Reminder Settings</TabsTrigger>
            <TabsTrigger value="history">Reminder History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-6">
            <ReminderSettings profile={profile} />

            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Currently, reminders are sent via email only. More notification channels will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Reminder History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A history of reminders sent to you will be displayed here. This feature is coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
