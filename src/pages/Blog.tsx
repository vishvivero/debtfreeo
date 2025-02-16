
import { BlogList } from "@/components/blog/BlogList";
import { motion } from "framer-motion";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { Input } from "@/components/ui/input";
import { Search, Star, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Query for staff picks (showing only published posts)
  const { data: staffPicks = [] } = useQuery({
    queryKey: ["staffPicks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);

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

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="relative bg-gradient-to-b from-gray-50 to-white flex-1">
        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute opacity-[0.08] bg-primary"
                style={{
                  width: '40%',
                  height: '40%',
                  borderRadius: '40%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, 30, 0],
                  y: [0, 20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 space-y-16 relative z-10">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            <div className="text-center space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold leading-tight text-gray-900"
              >
                Financial Freedom <span className="text-primary">Blog</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 max-w-xl mx-auto"
              >
                Expert insights and guides for your debt-free journey
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto mt-8"
              >
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    className="pl-12 h-14 text-lg bg-white shadow-lg border-0 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main content area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg"
              >
                <BlogList searchQuery={searchQuery} />
              </motion.div>

              {/* Minimalist Staff Picks Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:w-80 space-y-6"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <h2 className="text-lg font-medium text-gray-900">
                        Staff Picks
                      </h2>
                    </div>
                    
                    <div className="space-y-5">
                      {staffPicks.map((post) => (
                        <Link 
                          key={post.id} 
                          to={`/blog/post/${post.slug}`}
                          className="block group"
                        >
                          <div className="flex gap-3">
                            {post.image_url && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={post.image_url} 
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 space-y-2">
                              <h3 className="text-base font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>
                                  {format(new Date(post.published_at || post.created_at), 'MMM yyyy')}
                                </span>
                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </div>
      <SharedFooter />
      <CookieConsent />
    </div>
  );
};

export default Blog;
