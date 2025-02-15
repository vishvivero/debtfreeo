
import { BlogList } from "@/components/blog/BlogList";
import { motion } from "framer-motion";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Blog = () => {
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
            className="max-w-5xl mx-auto space-y-8"
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg"
            >
              <BlogList />
            </motion.div>
          </motion.section>
        </div>
      </div>
      <SharedFooter />
      <CookieConsent />
    </div>
  );
};

export default Blog;
