import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export const BlogList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // First query: Get user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log("Fetching profile for user:", user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      console.log("Profile data:", data);
      return data;
    },
    enabled: !!user?.id,
  });

  // Second query: Get categories
  const { data: categories = [] } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: async () => {
      console.log("Fetching blog categories");
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      
      console.log("Categories fetched:", data);
      return data || [];
    },
  });

  // Third query: Get blogs with filters
  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ["blogs", searchTerm, selectedCategory, profile?.is_admin],
    queryFn: async () => {
      console.log("Fetching blogs with filters:", {
        searchTerm,
        selectedCategory,
        isAdmin: profile?.is_admin
      });

      let query = supabase
        .from("blogs")
        .select(`
          *,
          profiles (
            email
          )
        `);

      // Apply filters
      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      // If not admin, only show published posts
      if (!profile?.is_admin) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching blogs:", error);
        throw error;
      }

      console.log("Blogs fetched:", data?.length, "posts");
      return data || [];
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 px-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-4">
        <AlertDescription>
          Error loading blog posts: {error instanceof Error ? error.message : "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 px-4"
    >
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {blogs?.length === 0 ? (
          <Alert>
            <AlertDescription>
              No blog posts found. Try adjusting your search or category filters.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {blogs?.map((blog) => (
              <Link 
                key={blog.id} 
                to={`/blog/post/${blog.slug}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    {blog.image_url && (
                      <div className="aspect-[16/9] mb-4 overflow-hidden rounded-lg">
                        <img 
                          src={blog.image_url} 
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {blog.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{blog.read_time_minutes} min read</span>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 line-clamp-2">{blog.title}</h2>
                        <p className="text-gray-600 line-clamp-3 text-sm sm:text-base">{blog.excerpt}</p>
                      </div>
                      <div className="mt-auto pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-500">
                        <span>By {blog.profiles?.email}</span>
                        <span>
                          {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};