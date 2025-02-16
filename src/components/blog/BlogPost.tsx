
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ChevronRight, Facebook, X, Linkedin, Link2, Share2, Instagram, Youtube } from "lucide-react";
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

          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium text-xl">
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

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Share on social:</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                    className="h-10 w-10 rounded-full border hover:bg-[#1877f2]/10 hover:border-[#1877f2]/30"
                  >
                    <Facebook className="h-4 w-4 text-[#1877f2]" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                    className="h-10 w-10 rounded-full border hover:bg-black/10 hover:border-black/30"
                  >
                    <X className="h-4 w-4 text-black" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('linkedin')}
                    className="h-10 w-10 rounded-full border hover:bg-[#0a66c2]/10 hover:border-[#0a66c2]/30"
                  >
                    <Linkedin className="h-4 w-4 text-[#0a66c2]" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('reddit')}
                    className="h-10 w-10 rounded-full border hover:bg-[#FF4500]/10 hover:border-[#FF4500]/30"
                  >
                    <Share2 className="h-4 w-4 text-[#FF4500]" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="h-10 w-10 rounded-full border hover:bg-gray-100 hover:border-gray-300"
                  >
                    <Link2 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        <div className="max-w-4xl mx-auto px-4 my-12 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-500 font-medium">★</span>
              </div>
              <span className="text-emerald-600 font-medium">Start Your Journey</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">
                Your Path to <span className="text-emerald-500">Debt Freedom</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Get a personalized debt payoff strategy that helps you become debt-free faster. Save money on interest and track your progress along the way.
              </p>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <div className="bg-emerald-50 rounded-xl p-6 space-y-2">
                  <div className="text-emerald-600 font-medium mb-4">Interest Saved</div>
                  <div className="text-4xl font-bold text-emerald-700">$1,981.69</div>
                  <div className="text-emerald-600">Total savings on interest</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-6 space-y-2">
                  <div className="text-blue-600 font-medium mb-4">Time Saved</div>
                  <div className="text-4xl font-bold text-blue-600">18 months</div>
                  <div className="text-blue-600">Faster debt freedom</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 space-y-2">
                  <div className="text-purple-600 font-medium mb-4">Debt-free Date</div>
                  <div className="text-4xl font-bold text-purple-600">August 2028</div>
                  <div className="text-purple-600">Target completion date</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Original Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Debt:</span>
                      <span className="font-medium">$48,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Payment:</span>
                      <span className="font-medium">$1,375.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Interest:</span>
                      <span className="font-medium">$10,394.28</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Months to Pay Off:</span>
                      <span className="font-medium">60</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-emerald-700">Accelerated Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Debt:</span>
                      <span className="font-medium text-emerald-700">$48,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Payment:</span>
                      <span className="font-medium text-emerald-700">$1,375.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Interest:</span>
                      <span className="font-medium text-emerald-700">$8,412.59</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Months to Pay Off:</span>
                      <span className="font-medium text-emerald-700">42</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                  <Link to="/strategy">
                    Start Your Free Plan
                  </Link>
                </Button>
                <div className="flex items-center gap-6 text-gray-600">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                    Free Forever
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                    No Credit Card
                  </span>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Disclaimer: The calculations provided are estimates only. Always review and make payments based on your creditor's requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-lg bg-[#82D1AC] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-2xl">V</span>
            </div>
            <div className="space-y-6 flex-1">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">ABOUT THE AUTHOR</h3>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vishnu Raj</h2>
                <p className="text-gray-600">
                  Helping people take control of their debts, achieve financial freedom, and build a stress-free future with smart repayment strategies and personal growth.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Twitter"
                  >
                    <X className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
                <Link 
                  to="/blog" 
                  className="inline-flex items-center text-primary hover:text-primary/90 font-medium"
                >
                  More Articles From Vishnu Raj
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
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
