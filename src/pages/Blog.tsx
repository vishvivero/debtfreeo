
import { BlogList } from "@/components/blog/BlogList";
import { motion } from "framer-motion";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { Input } from "@/components/ui/input";
import { Search, Star, ArrowRight, TrendingUp, BookOpen, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";
import { getStorageUrl } from "@/integrations/supabase/storageUtils";

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
      return data || [];
    },
  });

  // Query for blog statistics
  const { data: blogStats } = useQuery({
    queryKey: ["blogStats"],
    queryFn: async () => {
      const { count: totalPosts } = await supabase
        .from("blogs")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      const { count: totalReaders } = await supabase
        .from("blog_visits")
        .select("*", { count: "exact", head: true });

      return {
        posts: totalPosts || 0,
        readers: totalReaders || 0,
      };
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
                                  src={getStorageUrl('blog-images', post.image_url)} 
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder.svg';
                                  }}
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

                {/* Blog Statistics */}
                <div className="bg-[#F2FCE2] backdrop-blur-sm rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-medium text-[#4CAF50] mb-4">
                    Blog Statistics
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#4CAF50]" />
                        <span className="text-sm text-gray-600">Total Posts</span>
                      </div>
                      <p className="text-2xl font-bold text-[#4CAF50]">
                        {blogStats?.posts || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#4CAF50]" />
                        <span className="text-sm text-gray-600">Total Readers</span>
                      </div>
                      <p className="text-2xl font-bold text-[#4CAF50]">
                        {blogStats?.readers || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Quick Links
                  </h2>
                  <div className="space-y-3">
                    <Link 
                      to="/tools/DebtToIncomeCalculator"
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-primary">Debt-to-Income Calculator</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>
                    <Link 
                      to="/tools/BudgetCalculator"
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-primary">Budget Calculator</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>
                    <Link 
                      to="/tools/DebtConsolidationCalculator"
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-primary">Debt Consolidation Calculator</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="bg-[#E5DEFF] backdrop-blur-sm rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-[#7E69AB]" />
                    <h2 className="text-lg font-medium text-[#7E69AB]">
                      Trending Topics
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/blog?category=Debt Management"
                      className="px-3 py-1 rounded-full bg-white/50 hover:bg-white/80 text-sm text-[#7E69AB] transition-colors"
                    >
                      Debt Management
                    </Link>
                    <Link 
                      to="/blog?category=Budgeting"
                      className="px-3 py-1 rounded-full bg-white/50 hover:bg-white/80 text-sm text-[#7E69AB] transition-colors"
                    >
                      Budgeting
                    </Link>
                    <Link 
                      to="/blog?category=Saving"
                      className="px-3 py-1 rounded-full bg-white/50 hover:bg-white/80 text-sm text-[#7E69AB] transition-colors"
                    >
                      Saving Tips
                    </Link>
                    <Link 
                      to="/blog?category=Financial Planning"
                      className="px-3 py-1 rounded-full bg-white/50 hover:bg-white/80 text-sm text-[#7E69AB] transition-colors"
                    >
                      Financial Planning
                    </Link>
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
