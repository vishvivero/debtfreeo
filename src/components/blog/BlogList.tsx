
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export const BlogList = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Query for categories
  const { data: categories = [] } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Query for published blogs with filters
  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ["blogs", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("blogs")
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq('is_published', true);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 flex gap-6">
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
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
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-white/95 backdrop-blur-sm rounded-full border-0 shadow-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-white border-0 shadow-md">
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
            No blog posts found. Try adjusting your category filter.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {blogs?.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/blog/post/${blog.slug}`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-white/90">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {blog.image_url && (
                        <div className="md:w-48 h-48 overflow-hidden rounded-lg flex-shrink-0">
                          <img 
                            src={blog.image_url} 
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {blog.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{blog.read_time_minutes} min read</span>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {blog.title}
                          </h2>
                          <p className="text-gray-600 line-clamp-2">{blog.excerpt}</p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2 text-primary">
                            <span className="text-sm font-medium">Read more</span>
                            <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
