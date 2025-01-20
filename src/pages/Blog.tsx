import { BlogList } from "@/components/blog/BlogList";
import { motion } from "framer-motion";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";

const Blog = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 w-full bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="w-full container mx-auto px-4 py-16 space-y-16">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold">
                <span className="text-gray-900">Blog</span>
              </h1>
              <p className="text-xl text-gray-600">
                Insights and guides for your debt-free journey
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <BlogList />
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