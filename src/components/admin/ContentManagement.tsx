
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminBlogList } from "@/components/blog/AdminBlogList";
import { CategoryManager } from "../blog/CategoryManager";
import { FileText, Tags } from "lucide-react";

export const ContentManagement = () => {
  const { data: contentStats } = useQuery({
    queryKey: ["contentStats"],
    queryFn: async () => {
      console.log("Fetching content stats...");
      
      const { data: blogs, error: blogsError } = await supabase
        .from("blogs")
        .select("count");
      
      const { data: categories, error: categoriesError } = await supabase
        .from("blog_categories")
        .select("count");

      if (blogsError || categoriesError) {
        console.error("Error fetching content stats:", { blogsError, categoriesError });
        throw blogsError || categoriesError;
      }

      console.log("Fetched content stats:", { blogs, categories });
      return {
        totalBlogs: blogs?.[0]?.count || 0,
        totalCategories: categories?.[0]?.count || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentStats?.totalBlogs || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentStats?.totalCategories || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts">Blog Posts</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="posts">
              <AdminBlogList />
            </TabsContent>
            <TabsContent value="categories">
              <CategoryManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
