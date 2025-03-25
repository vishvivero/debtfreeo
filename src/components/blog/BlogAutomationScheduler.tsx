
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Calendar, Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BlogAutomationSchedule {
  id: string;
  user_id: string;
  frequency: "daily" | "weekly" | "monthly";
  hour: number;
  day_of_week: number | null;
  day_of_month: number | null;
  category: string;
  created_at: string;
  is_active: boolean;
  last_run_at: string | null;
}

export const BlogAutomationScheduler = ({ category }: { category: string }) => {
  const [schedules, setSchedules] = useState<BlogAutomationSchedule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    frequency: "daily" as "daily" | "weekly" | "monthly",
    hour: 9,
    day_of_week: 1,
    day_of_month: 1,
    category: category
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  useEffect(() => {
    setNewSchedule(prev => ({ ...prev, category }));
  }, [category]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_automation_schedules")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching automation schedules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load automation schedules"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSchedule = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-blog-automation-schedule", {
        body: {
          ...newSchedule,
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog automation schedule created successfully"
      });

      setIsDialogOpen(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error creating automation schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create automation schedule"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("blog_automation_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule deleted successfully"
      });

      setSchedules(schedules.filter(schedule => schedule.id !== id));
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete schedule"
      });
    }
  };

  const toggleScheduleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("blog_automation_schedules")
        .update({ is_active: !currentActive })
        .eq("id", id);

      if (error) throw error;

      setSchedules(schedules.map(schedule => 
        schedule.id === id ? { ...schedule, is_active: !currentActive } : schedule
      ));

      toast({
        title: "Success",
        description: `Schedule ${!currentActive ? "activated" : "deactivated"} successfully`
      });
    } catch (error) {
      console.error("Error toggling schedule status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update schedule status"
      });
    }
  };

  const renderScheduleDescription = (schedule: BlogAutomationSchedule) => {
    const time = `${schedule.hour}:00`;
    
    if (schedule.frequency === "daily") {
      return `Every day at ${time}`;
    } else if (schedule.frequency === "weekly") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day = schedule.day_of_week !== null ? days[schedule.day_of_week] : "day";
      return `Every ${day} at ${time}`;
    } else if (schedule.frequency === "monthly") {
      const day = schedule.day_of_month || 1;
      const suffix = ["st", "nd", "rd"][day - 1] || "th";
      return `Every ${day}${suffix} day of the month at ${time}`;
    }
    
    return "Invalid schedule";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Automated Publishing</h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Publishing Schedule</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={newSchedule.frequency} 
                  onValueChange={(value: "daily" | "weekly" | "monthly") => 
                    setNewSchedule({...newSchedule, frequency: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newSchedule.frequency === "weekly" && (
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Day of Week</Label>
                  <Select 
                    value={newSchedule.day_of_week.toString()} 
                    onValueChange={(value) => 
                      setNewSchedule({...newSchedule, day_of_week: parseInt(value)})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {newSchedule.frequency === "monthly" && (
                <div className="space-y-2">
                  <Label htmlFor="day_of_month">Day of Month</Label>
                  <Select 
                    value={newSchedule.day_of_month.toString()} 
                    onValueChange={(value) => 
                      setNewSchedule({...newSchedule, day_of_month: parseInt(value)})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(31)].map((_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()}>
                          {i+1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="hour">Hour (24-hour format)</Label>
                <Select 
                  value={newSchedule.hour.toString()} 
                  onValueChange={(value) => 
                    setNewSchedule({...newSchedule, hour: parseInt(value)})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(24)].map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newSchedule.category} 
                  onValueChange={(value) => 
                    setNewSchedule({...newSchedule, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debt-management">Debt Management</SelectItem>
                    <SelectItem value="financial-advice">Financial Advice</SelectItem>
                    <SelectItem value="saving-tips">Saving Tips</SelectItem>
                    <SelectItem value="credit-scores">Credit Scores</SelectItem>
                    <SelectItem value="budgeting">Budgeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={createSchedule} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : "Create Schedule"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : schedules.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No automation schedules set up yet. Add a schedule to automatically publish blog posts.
        </p>
      ) : (
        <div className="space-y-3">
          {schedules.map(schedule => (
            <Card key={schedule.id} className={!schedule.is_active ? "opacity-70" : undefined}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{renderScheduleDescription(schedule)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Category: {schedule.category.replace(/-/g, ' ')}
                      {schedule.last_run_at && (
                        <> • Last run: {new Date(schedule.last_run_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={schedule.is_active} 
                      onCheckedChange={() => toggleScheduleActive(schedule.id, schedule.is_active)} 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteSchedule(schedule.id)}
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
    </div>
  );
};
