
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Calendar, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BlogAutomationSchedule } from "./types";

interface BlogAutomationSchedulerProps {
  category: string;
}

export const BlogAutomationScheduler = ({ category }: BlogAutomationSchedulerProps) => {
  const [schedules, setSchedules] = useState<BlogAutomationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hour, setHour] = useState(9); // Default to 9 AM
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Default to Monday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1); // Default to 1st day of month
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSchedules = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_automation_schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setSchedules(data as BlogAutomationSchedule[]);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load automation schedules",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [user]);

  const handleCreateSchedule = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create automation schedules",
      });
      return;
    }

    if (!category) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a category first",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("create-blog-automation-schedule", {
        body: { 
          frequency,
          hour,
          day_of_week: frequency === 'weekly' ? dayOfWeek : null,
          day_of_month: frequency === 'monthly' ? dayOfMonth : null,
          category,
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog automation schedule created successfully",
      });
      
      setIsCreating(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create automation schedule",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleScheduleStatus = async (schedule: BlogAutomationSchedule) => {
    try {
      const { error } = await supabase
        .from("blog_automation_schedules")
        .update({ is_active: !schedule.is_active })
        .eq("id", schedule.id);
      
      if (error) throw error;
      
      setSchedules(schedules.map(s => 
        s.id === schedule.id ? { ...s, is_active: !s.is_active } : s
      ));
      
      toast({
        title: "Success",
        description: `Schedule ${schedule.is_active ? 'paused' : 'activated'} successfully`,
      });
    } catch (error) {
      console.error("Error toggling schedule status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update schedule status",
      });
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("blog_automation_schedules")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setSchedules(schedules.filter(s => s.id !== id));
      
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete schedule",
      });
    }
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
  };

  const formatDayOfWeek = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const getScheduleDescription = (schedule: BlogAutomationSchedule) => {
    if (schedule.frequency === 'daily') {
      return `Every day at ${formatTime(schedule.hour)}`;
    } else if (schedule.frequency === 'weekly' && schedule.day_of_week !== null && schedule.day_of_week !== undefined) {
      return `Every ${formatDayOfWeek(schedule.day_of_week)} at ${formatTime(schedule.hour)}`;
    } else if (schedule.frequency === 'monthly' && schedule.day_of_month !== null && schedule.day_of_month !== undefined) {
      return `Every month on day ${schedule.day_of_month} at ${formatTime(schedule.hour)}`;
    }
    return '';
  };

  const renderHourSelect = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor="hour">Time</Label>
        <Select value={hour.toString()} onValueChange={(val) => setHour(parseInt(val))}>
          <SelectTrigger id="hour" className="w-full">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 24 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {formatTime(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const renderDaySelect = () => {
    if (frequency === 'weekly') {
      return (
        <div className="space-y-2">
          <Label htmlFor="day-of-week">Day of week</Label>
          <Select value={dayOfWeek.toString()} onValueChange={(val) => setDayOfWeek(parseInt(val))}>
            <SelectTrigger id="day-of-week" className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 7 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {formatDayOfWeek(i)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    } else if (frequency === 'monthly') {
      return (
        <div className="space-y-2">
          <Label htmlFor="day-of-month">Day of month</Label>
          <Select value={dayOfMonth.toString()} onValueChange={(val) => setDayOfMonth(parseInt(val))}>
            <SelectTrigger id="day-of-month" className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 28 }, (_, i) => (
                <SelectItem key={i+1} value={(i+1).toString()}>
                  {i+1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {!isCreating && (
        <div className="flex justify-between">
          <h3 className="text-lg font-medium">Scheduled Publishing</h3>
          <Button 
            onClick={() => setIsCreating(true)} 
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Schedule
          </Button>
        </div>
      )}

      {isCreating ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium mb-2">Create New Publishing Schedule</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(val) => setFrequency(val as 'daily' | 'weekly' | 'monthly')}>
                  <SelectTrigger id="frequency" className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {renderDaySelect()}
              {renderHourSelect()}
              
              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSchedule} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Schedule"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length === 0 ? (
            <Alert variant="default">
              <AlertDescription>
                No publishing schedules set up. Create one to automatically generate and publish blog posts.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {schedule.category}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{getScheduleDescription(schedule)}</span>
                        </div>
                        {schedule.last_run_at && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>Last ran: {new Date(schedule.last_run_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={schedule.is_active}
                          onCheckedChange={() => toggleScheduleStatus(schedule)}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteSchedule(schedule.id!)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
