import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Facebook, 
  X, 
  Linkedin, 
  Link2, 
  Share2, 
  Instagram, 
  Youtube, 
  X as CloseIcon, 
  DollarSign, 
  ArrowRight,
  Check,
  Edit,
  Save
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BlogImageUpload } from "./form/BlogImageUpload";
import { Textarea } from "@/components/ui/textarea";

const BlogPost = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedExcerpt, setEditedExcerpt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        
        setIsAdmin(!!profile?.is_admin);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const trackVisit = async () => {
      if (!slug) return;

      let visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        visitorId = uuidv4();
        localStorage.setItem('visitor_id', visitorId);
      }

      const { data: blog } = await supabase
        .from('blogs')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!blog) return;

      await supabase.from('blog_visits').insert({
        blog_id: blog.id,
        visitor_id: visitorId,
        user_id: user?.id,
        is_authenticated: !!user
      });
    };

    trackVisit();
  }, [slug, user]);

  const { data: blog, isLoading, error, refetch } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      if (!slug) {
        console.error("No slug provided");
        throw new Error("No slug provided");
      }

      let isAdmin = false;
      if (user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        
        isAdmin = !!profile?.is_admin;
      }

      console.log("User admin status:", { isAdmin });

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

      if (!blogData.is_published && !isAdmin) {
        console.log("Blog post not published and user is not admin");
        throw new Error("Blog post not available");
      }

      document.title = blogData.meta_title || blogData.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', blogData.meta_description || blogData.excerpt);
      }
      
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

  useEffect(() => {
    if (blog) {
      setEditedTitle(blog.title);
      setEditedContent(blog.content);
      setEditedExcerpt(blog.excerpt);
      if (blog.image_url) {
        setImagePreview(blog.image_url);
      }
    }
  }, [blog]);

  const handleSaveChanges = async () => {
    if (!blog?.id) return;
    
    try {
      let imageUrl = blog.image_url;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(bucket => bucket.name === 'blog-images')) {
          await supabase.storage.createBucket('blog-images', {
            public: true,
            fileSizeLimit: 5242880,
          });
        }
        
        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }
        
        imageUrl = fileName;
      }

      const { error: updateError } = await supabase
        .from('blogs')
        .update({
          title: editedTitle,
          content: editedContent,
          excerpt: editedExcerpt,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', blog.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      
      await refetch();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update blog post. Please try again.",
      });
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter.",
      });

      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive"
      });
    }
  };

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

  if (blog) {
    return (
      <>
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

        <div className="w-full bg-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            {isAdmin && !isEditing && (
              <div className="mb-6 flex justify-end">
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Blog Post
                </Button>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-bold">Edit Blog Post</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input 
                    value={editedTitle} 
                    onChange={(e) => setEditedTitle(e.target.value)} 
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <Textarea 
                    value={editedExcerpt} 
                    onChange={(e) => setEditedExcerpt(e.target.value)} 
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                  <BlogImageUpload
                    setImage={setImage}
                    imagePreview={imagePreview || blog.image_url}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
                  <Textarea 
                    value={editedContent} 
                    onChange={(e) => setEditedContent(e.target.value)} 
                    className="w-full font-mono"
                    rows={15}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    {blog.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{blog.read_time_minutes} MIN READ</span>
                    </div>
                    <span className="mx-2">•</span>
                    <time dateTime={blog.published_at || blog.created_at}>
                      {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium text-lg">
                        V
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Vishnu Raj
                      </p>
                      <p className="text-sm text-gray-600">
                        Written on {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                {blog.image_url && (
                  <div className="lg:col-span-6">
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={blog.image_url} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white p-6 my-8"
          >
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors prose-strong:text-gray-900 prose-em:text-gray-800 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-primary prose-blockquote:text-gray-700 prose-img:rounded-lg prose-hr:border-gray-200">
              <ReactMarkdown>{blog.content}</ReactMarkdown>
            </div>
          </motion.article>
        )}

        {!isEditing && (
          <>
            <div className="max-w-4xl mx-auto px-6 py-12 bg-white">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">About the Author</h3>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium text-xl">V</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Vishnu Raj</h4>
                    <p className="text-gray-600">
                      Financial expert and debt freedom advocate with over a decade of experience helping people achieve their financial goals. 
                      Passionate about making financial education accessible to everyone.
                    </p>
                    <div className="flex items-center gap-3">
                      <Link to="#" className="text-primary hover:text-primary/80">
                        <Youtube className="h-5 w-5" />
                      </Link>
                      <Link to="#" className="text-primary hover:text-primary/80">
                        <Instagram className="h-5 w-5" />
                      </Link>
                      <Link to="#" className="text-primary hover:text-primary/80">
                        <X className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-primary text-white py-16">
              <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <h2 className="text-3xl font-bold">
                      Subscribe to Our Newsletter
                    </h2>
                    <p className="text-primary-50">
                      Get the latest financial tips, debt management strategies, and exclusive content delivered directly to your inbox.
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <form onSubmit={handleSubscribe} className="flex gap-2">
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        required
                      />
                      <Button type="submit" variant="secondary" className="whitespace-nowrap">
                        Subscribe
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return null;
};

export default BlogPost;
