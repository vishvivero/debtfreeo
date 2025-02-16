
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface BlogListProps {
  searchQuery?: string;
}

export const BlogList = ({ searchQuery }: BlogListProps) => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get public URLs for images if they exist
      const processedData = data?.map(post => {
        if (post.image_url && !post.image_url.startsWith('http')) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('blog-images')
            .getPublicUrl(post.image_url);
          return { ...post, image_url: publicUrl };
        }
        return post;
      });

      return processedData || [];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {blogs?.map((blog) => (
        <Link key={blog.id} to={`/blog/post/${blog.slug}`}>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="grid md:grid-cols-12 gap-6">
              {blog.image_url && (
                <div className="md:col-span-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className={blog.image_url ? "md:col-span-8" : "md:col-span-12"}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {blog.category}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{blog.read_time_minutes} min read</span>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
