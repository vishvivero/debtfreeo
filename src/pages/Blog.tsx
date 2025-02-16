
import { BlogList } from "@/components/blog/BlogList";
import { motion } from "framer-motion";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Blog = () => {
  // Query for staff picks (showing only published posts marked as staff picks)
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

              {/* Modernized Staff Picks Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:w-96 space-y-6"
              >
                <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-xl">
                        <Star className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Staff Picks
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      {staffPicks.map((post) => (
                        <Link key={post.id} to={`/blog/post/${post.slug}`}>
                          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden">
                            <CardContent className="p-0">
                              {post.image_url && (
                                <div className="relative h-48 overflow-hidden">
                                  <img 
                                    src={post.image_url} 
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <Badge variant="secondary" className="absolute top-4 left-4 bg-white/90 text-primary shadow-lg">
                                    {post.category}
                                  </Badge>
                                </div>
                              )}
                              <div className="p-4 space-y-3">
                                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                  {post.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  <span>{post.read_time_minutes} min read</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
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
