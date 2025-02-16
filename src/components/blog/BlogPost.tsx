
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ChevronRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export const BlogPost = () => {
  const { slug } = useParams();
  const { user } = useAuth();

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      console.log("Starting blog post fetch for slug:", slug);
      
      if (!slug) {
        console.error("No slug provided");
        throw new Error("No slug provided");
      }

      // First check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user?.id)
        .maybeSingle();

      console.log("User profile check:", { isAdmin: profile?.is_admin });

      // Fetch blog post with author details
      const { data: blogData, error: blogError } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq("slug", slug)
        .maybeSingle();
      
      if (blogError) {
        console.error("Error fetching blog post:", blogError);
        throw blogError;
      }

      if (!blogData) {
        console.log("Blog post not found:", slug);
        throw new Error("Blog post not found");
      }

      // Check if the post is published or if the user is an admin
      if (!blogData.is_published && !profile?.is_admin) {
        console.log("Blog post not published and user is not admin");
        throw new Error("Blog post not available");
      }

      // Update document title and meta tags
      document.title = blogData.meta_title || blogData.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', blogData.meta_description || blogData.excerpt);
      }
      
      // Update keywords meta tag
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', (blogData.keywords || []).join(', '));

      console.log("Blog post fetched successfully:", blogData);
      return blogData;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Error loading blog post"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {/* New breadcrumb header */}
      <div className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/blog" className="text-primary hover:text-primary/80 transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link to={`/blog?category=${blog.category}`} className="text-primary hover:text-primary/80 transition-colors">
              {blog.category}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 truncate">{blog.title}</span>
          </nav>
        </div>
      </div>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden p-6 my-8"
      >
        <header className="mb-8 border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {blog.category}
            </Badge>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{blog.read_time_minutes} min read</span>
            </div>
            <span>
              {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          {blog.image_url && (
            <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
              <img 
                src={blog.image_url} 
                alt={blog.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors prose-strong:text-gray-900 prose-em:text-gray-800 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-primary prose-blockquote:text-gray-700 prose-img:rounded-lg prose-hr:border-gray-200">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => (
                <Badge 
                  key={tag} 
                  variant="outline"
                  className="bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </motion.article>
    </>
  );
};
