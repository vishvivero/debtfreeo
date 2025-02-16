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
  Check 
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export const BlogPost = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

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

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      console.log("Starting blog post fetch for slug:", slug);
      
      if (!slug) {
        console.error("No slug provided");
        throw new Error("No slug provided");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user?.id)
        .maybeSingle();

      console.log("User profile check:", { isAdmin: profile?.is_admin });

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

      if (!blogData.is_published && !profile?.is_admin) {
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
          </div>
        </div>

        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white p-6 my-8"
        >
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors prose-strong:text-gray-900 prose-em:text-gray-800 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-primary prose-blockquote:text-gray-700 prose-img:rounded-lg prose-hr:border-gray-200">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <p className="text-gray-600">Share this article:</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Copy link"
                >
                  <Link2 className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6">
            <Card className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2FCE2] rounded-bl-[100px] -z-0" />
              <div className="absolute top-4 right-4">
                <div className="h-8 w-8 rounded-full bg-[#F2FCE2] flex items-center justify-center">
                  <span className="text-[#4CAF50] text-lg">★</span>
                </div>
              </div>

              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#4CAF50] mb-2">
                    Ready to Start Your Debt-Free Journey?
                  </h3>
                  <p className="text-gray-600">
                    Join thousands who are using DebtFreeo to achieve financial freedom
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#F2FCE2] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-5 w-5 text-[#4CAF50]" />
                      <span className="text-[#4CAF50] font-medium">Save Money</span>
                    </div>
                    <div className="text-xl font-bold text-[#4CAF50]">$2,000+</div>
                    <div className="text-sm text-[#4CAF50]">Average interest saved</div>
                  </div>
                  <div className="bg-[#EEF2FF] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-5 w-5 text-[#4F46E5]" />
                      <span className="text-[#4F46E5] font-medium">Save Time</span>
                    </div>
                    <div className="text-xl font-bold text-[#4F46E5]">2.5 years</div>
                    <div className="text-sm text-[#4F46E5]">Average time saved</div>
                  </div>
                  <div className="bg-[#F3E8FF] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="h-5 w-5 text-[#9333EA]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.34998 9.64999V11.35C4.34998 15.57 7.77998 19 12 19C16.22 19 19.65 15.57 19.65 11.35V9.64999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 19V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[#9333EA] font-medium">Smart AI</span>
                    </div>
                    <div className="text-xl font-bold text-[#9333EA]">24/7</div>
                    <div className="text-sm text-[#9333EA]">Personalized guidance</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">What You'll Get</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-[#4CAF50]" />
                        Personalized strategy
                      </p>
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-[#4CAF50]" />
                        Payment calculator
                      </p>
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-[#4CAF50]" />
                        Progress tracking
                      </p>
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-[#4CAF50]" />
                        Smart reminders
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-[#4CAF50]">Start For Free Today</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]"></span>
                        No credit card
                      </p>
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]"></span>
                        Free forever plan
                      </p>
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]"></span>
                        5-minute setup
                      </p>
                      <p className="text-gray-600 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]"></span>
                        Cancel anytime
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild className="w-full h-10 bg-[#4CAF50] hover:bg-[#45a049]">
                    <Link to="/signup">
                      Create Your Free Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Join over 10,000+ people on their path to financial freedom
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.article>

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
    );
  }

  return null;
};
