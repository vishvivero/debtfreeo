import { BlogList } from "@/components/blog/BlogList";
import { motion } from "framer-motion";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Blog = () => {
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
      return data || [];
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
                  />
                  <Button 
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
                  >
                    <Search className="h-5 w-5 text-primary" />
                  </Button>
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
                <BlogList />
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
                          <div className="space-y-2">
                            <Badge 
                              variant="secondary" 
                              className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              {post.category}
                            </Badge>
                            <h3 className="text-base font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
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
