
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

export const BlogPost = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select(`
            *,
            profiles (
              email
            )
          `)
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, toast]);

  useEffect(() => {
    const trackVisit = async () => {
      if (!post) return;

      try {
        const { error } = await supabase
          .from('blog_visits')
          .insert([
            {
              blog_id: post.id,
              user_id: user?.id,
              is_authenticated: !!user,
              visitor_id: localStorage.getItem('visitor_id') || crypto.randomUUID(),
            }
          ]);

        if (error) throw error;
      } catch (error) {
        console.error('Error tracking blog visit:', error);
      }
    };

    trackVisit();
  }, [post, user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Blog post not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose lg:prose-xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center text-gray-600 mb-8">
          <span>
            {format(new Date(post.published_at), 'MMMM d, yyyy')}
          </span>
          <span className="mx-2">•</span>
          <span>{post.read_time_minutes} min read</span>
        </div>

        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-lg mb-8"
          />
        )}

        <ReactMarkdown>{post.content}</ReactMarkdown>

        {!user && (
          <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">
                Want to save this article for later?
              </h3>
              <p className="text-muted-foreground">
                Create an account to bookmark articles, track your reading progress, and join our community of financial enthusiasts.
              </p>
              <Button asChild>
                <Link to="/blog/signup">Sign up for free</Link>
              </Button>
            </div>
          </Card>
        )}
      </article>
    </div>
  );
};
