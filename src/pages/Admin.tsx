
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { AdminMetrics } from "@/components/admin/AdminMetrics";
import { AdminBlogList } from "@/components/blog/AdminBlogList";
import { CategoryManager } from "@/components/blog/CategoryManager";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { SecurityMonitoring } from "@/components/admin/SecurityMonitoring";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { AnalyticsReporting } from "@/components/admin/AnalyticsReporting";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { PerformanceMetrics } from "@/components/admin/PerformanceMetrics";
import { BannerManagement } from "@/components/admin/BannerManagement";
import EditBlogPost from "@/components/admin/EditBlogPost";
import NewBlogPost from "@/components/admin/NewBlogPost";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const { user, refreshSession } = useAuth();
  const { profile, isLoading: profileLoading, error: profileError } = useProfile();
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkError, setCheckError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      console.log("Admin page - No user found during admin check");
      setIsAdminChecked(true);
      return;
    }
    
    try {
      if (!profile && !profileError) {
        await refreshSession();
      }
      
      if (profileError) {
        console.error("Admin check - Error loading profile:", profileError);
        setCheckError(profileError as Error);
        setIsAdminChecked(true);
        return;
      }
      
      if (profile) {
        console.log("Admin check - Profile loaded:", profile);
        setIsAdmin(!!profile.is_admin);
        setIsAdminChecked(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setCheckError(error as Error);
      setIsAdminChecked(true);
      
      toast({
        title: "Error",
        description: "There was a problem checking admin status. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, profile, profileError, refreshSession, toast]);

  useEffect(() => {
    if (!profileLoading && !isAdminChecked) {
      checkAdminStatus();
    }
  }, [checkAdminStatus, profileLoading, isAdminChecked]);
  
  if (!isAdminChecked || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (checkError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            There was an error loading the admin dashboard: {checkError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    console.log("Admin page - No user, redirecting to /");
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    console.log("Admin page - User is not an admin");
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            You do not have permission to access this area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log("Admin page - Rendering for admin user");
  
  return (
    <MainLayout sidebar={<AdminSidebar />}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <Routes>
            <Route index element={<AdminMetrics />} />
            <Route path="blogs" element={<AdminBlogList />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="new-post" element={<NewBlogPost />} />
            <Route path="edit/:id" element={<EditBlogPost />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="banner" element={<BannerManagement />} />
            <Route path="security" element={<SecurityMonitoring />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="analytics" element={<AnalyticsReporting />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="performance" element={<PerformanceMetrics />} />
          </Routes>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;
