
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { AdminLoadingSpinner } from "./AdminLoadingSpinner";
import { AdminBlogTable } from "./AdminBlogTable";
import { AdminBlogHeader } from "./AdminBlogHeader";
import { ChartBar, List, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AdminBlogList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // First check if user is admin
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["adminProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID for admin check");
        return null;
      }

      console.log("Checking admin status for blogs page");
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        throw error;
      }

      console.log("Admin status result:", data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false
  });

  // Only fetch blogs if user is confirmed admin
  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ["adminBlogs", user?.id],
    queryFn: async () => {
      if (!profile?.is_admin) {
        console.log("User is not admin, cannot fetch blogs");
        throw new Error("Unauthorized");
      }

      console.log("Fetching admin blogs");
      
      // Fetch blogs with visit counts
      const { data: blogData, error: blogsError } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles(email),
          visit_count:blog_visits(count)
        `)
        .order("created_at", { ascending: false });

      if (blogsError) {
        console.error("Error fetching blogs:", blogsError);
        throw blogsError;
      }
      
      // Process the visit counts
      const processedBlogs = blogData?.map(blog => ({
        ...blog,
        visit_count: blog.visit_count?.[0]?.count || 0
      }));

      console.log("Successfully fetched blogs:", processedBlogs?.length);
      return processedBlogs;
    },
    enabled: !!user?.id && !!profile?.is_admin,
    retry: false
  });

  // Handle loading states
  if (profileLoading || blogsLoading) {
    return <AdminLoadingSpinner />;
  }

  // Handle unauthorized access
  if (!user || !profile?.is_admin) {
    console.log("Unauthorized access attempt to admin blogs");
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

  const publishedPosts = blogs?.filter(blog => blog.is_published === true) || [];
  const draftPosts = blogs?.filter(blog => blog.is_published === false) || [];

  console.log("Filtered posts:", {
    published: publishedPosts.length,
    drafts: draftPosts.length
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AdminBlogHeader />
        <Button 
          onClick={() => navigate("/admin/new-post")}
          className="flex items-center gap-2"
        >
          <PenTool className="w-4 h-4" />
          New Post
        </Button>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            All Posts ({blogs?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="published" className="flex items-center gap-2">
            <ChartBar className="w-4 h-4" />
            Published ({publishedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Drafts ({draftPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AdminBlogTable posts={blogs} />
        </TabsContent>

        <TabsContent value="published">
          <AdminBlogTable posts={publishedPosts} />
        </TabsContent>

        <TabsContent value="drafts">
          <AdminBlogTable posts={draftPosts} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
