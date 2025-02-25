
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  // Combined admin check and blog fetch in a single query
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminBlogs", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for admin blogs fetch");
        throw new Error("User ID is required");
      }

      // First check admin status
      console.log("Checking admin status for user:", user.id);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error checking admin status:", profileError);
        throw profileError;
      }

      if (!profile?.is_admin) {
        console.log("User is not admin, access denied");
        throw new Error("Unauthorized");
      }

      // If admin, fetch blogs
      console.log("User is admin, fetching blogs");
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
      return {
        blogs: processedBlogs,
        isAdmin: true
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false
  });

  // Handle loading state
  if (isLoading) {
    return <AdminLoadingSpinner />;
  }

  // Handle unauthorized access
  if (error || !data?.isAdmin) {
    console.log("Unauthorized access or error:", error);
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

  const blogs = data?.blogs || [];
  const publishedPosts = blogs.filter(blog => blog.is_published === true);
  const draftPosts = blogs.filter(blog => blog.is_published === false);

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
            All Posts ({blogs.length})
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
