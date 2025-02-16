import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ChevronRight, Facebook, X, Mail, Linkedin, Copy, Youtube, Instagram, Share2, Heart } from "lucide-react";
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
  const {
    slug
  } = useParams();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const trackVisit = async () => {
      if (!slug) return;
      let visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) {
        visitorId = uuidv4();
        localStorage.setItem('visitor_id', visitorId);
      }
      const {
        data: blog
      } = await supabase.from('blogs').select('id').eq('slug', slug).single();
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
  const {
    data: blog,
    isLoading,
    error
  } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      console.log("Starting blog post fetch for slug:", slug);
      if (!slug) {
        console.error("No slug provided");
        throw new Error("No slug provided");
      }
      const {
        data: profile
      } = await supabase.from("profiles").select("is_admin").eq("id", user?.id).maybeSingle();
      console.log("User profile check:", {
        isAdmin: profile?.is_admin
      });
      const {
        data: blogData,
        error: blogError
      } = await supabase.from("blogs").select(`
          *,
          profiles (
            email
          )
        `).eq("slug", slug).maybeSingle();
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
    enabled: !!slug
  });
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || '';
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      indiehackers: `https://www.indiehackers.com/new-post?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    };
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
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
      const {
        error
      } = await supabase.functions.invoke('subscribe-newsletter', {
        body: {
          email
        }
      });
      if (error) throw error;
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter."
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
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "The article link has been copied to your clipboard."
    });
  };
  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">
        <Card className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </Card>
      </div>;
  }
  if (error || !blog) {
    return <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Error loading blog post"}
          </AlertDescription>
        </Alert>
      </div>;
  }
  return <>
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
                    {blog.profiles?.email?.[0].toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {blog.profiles?.email?.split('@')[0] || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Written on {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {blog.image_url && <div className="lg:col-span-6">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                  <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
                </div>
              </div>}
          </div>
        </div>
      </div>

      <motion.article initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="max-w-4xl mx-auto bg-white p-6 my-8">
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors prose-strong:text-gray-900 prose-em:text-gray-800 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-primary prose-blockquote:text-gray-700 prose-img:rounded-lg prose-hr:border-gray-200">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>

        <div className="mt-8 pt-6 border-t">
          
        </div>

        {blog.tags && blog.tags.length > 0 && <div className="mt-8 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => <Badge key={tag} variant="outline" className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  {tag}
                </Badge>)}
            </div>
          </div>}
      </motion.article>

      <div className="max-w-4xl mx-auto p-6 my-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
              >
                <Heart className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Did you find this article helpful?
              </h3>
              <p className="text-gray-600 max-w-lg mx-auto">
                Share this article with your friends and help them on their journey to financial freedom
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('facebook')}
                className="rounded-full hover:bg-blue-50 hover:border-blue-200 border-2 border-gray-200 transition-all duration-300 transform hover:scale-110"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('linkedin')}
                className="rounded-full hover:bg-blue-50 hover:border-blue-200 border-2 border-gray-200 transition-all duration-300 transform hover:scale-110"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('twitter')}
                className="rounded-full hover:bg-gray-50 hover:border-gray-300 border-2 border-gray-200 transition-all duration-300 transform hover:scale-110"
                aria-label="Share on X"
              >
                <X className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('reddit')}
                className="rounded-full hover:bg-orange-50 hover:border-orange-200 border-2 border-gray-200 transition-all duration-300 transform hover:scale-110"
                aria-label="Share on Reddit"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare('indiehackers')}
                className="rounded-full hover:bg-violet-50 hover:border-violet-200 border-2 border-gray-200 transition-all duration-300 transform hover:scale-110"
                aria-label="Share on IndieHackers"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent(window.location.href)}`}
                className="rounded-full hover:bg-gray-50 hover:border-gray-300 border-2 border-gray-200 transition-all duration-300 transform hover:scale-110"
                aria-label="Share via Email"
              >
                <Mail className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Input 
                value={window.location.href} 
                readOnly 
                className="bg-gray-50/50 border-2 border-gray-200 max-w-md text-sm" 
              />
              <Button 
                onClick={handleCopyLink} 
                variant="outline" 
                className="flex gap-2 items-center border-2 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
              <div className="w-full md:w-1/2 relative">
                <img 
                  src="/lovable-uploads/ea38c424-d2a8-4e46-8673-4c5953d279a6.png" 
                  alt="Your Path to Debt Freedom" 
                  className="w-full h-auto rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Start Your Journey
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Your Path to <span className="text-primary">Debt Freedom</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Get a personalized debt payoff strategy that helps you become debt-free faster. Save money on interest and track your progress along the way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-6 text-lg">
                    Start Your Free Plan
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>No Credit Card</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-primary text-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg">
                  V
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-medium text-primary uppercase tracking-wider">ABOUT THE AUTHOR</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  Vishnu Raj
                </h3>
                <p className="text-gray-600 mt-3 leading-relaxed">
                  Helping people take control of their debts, achieve financial freedom, and build a stress-free future with smart repayment strategies and personal growth.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <Link to="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </Link>
                  <Link to="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                  </Link>
                  <Link to="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </Link>
                  <Link to="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Youtube className="h-5 w-5" />
                  </Link>
                </div>
                <div className="mt-4">
                  <Link 
                    to={`/blog?author=${blog.profiles?.email}`} 
                    className="text-primary hover:text-primary/80 flex items-center gap-1 justify-center md:justify-start font-medium"
                  >
                    More Articles From Vishnu Raj <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="w-full bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl overflow-hidden">
          <div className="px-8 py-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 space-y-4">
                <h2 className="text-3xl font-bold">
                  Subscribe to Our Newsletter
                </h2>
                <p className="text-white/90">
                  Get the latest financial tips, debt management strategies, and exclusive content delivered directly to your inbox.
                </p>
              </div>
              <div className="w-full md:w-auto">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    name="email" 
                    placeholder="Enter your email" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60" 
                    required 
                  />
                  <Button type="submit" variant="secondary" className="whitespace-nowrap font-medium">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold text-white">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-white-50">
                Get the latest financial tips, debt management strategies, and exclusive content delivered directly to your inbox.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input type="email" name="email" placeholder="Enter your email" className="bg-white/10 border-white/20 text-white placeholder:text-white/60" required />
                <Button type="submit" variant="secondary" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>;
};
