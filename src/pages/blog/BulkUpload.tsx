
import { useAuth } from "@/lib/auth";
import { BlogBulkUpload } from "@/components/blog/form/BlogBulkUpload";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export const BulkUpload = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_categories')
          .select('id, name, slug')
          .order('name');

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const content = isLoading ? (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ) : (
    <>
      <div className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/blog" className="text-primary hover:text-primary/80 transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link to="/admin/blogs" className="text-primary hover:text-primary/80 transition-colors">
              Admin
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Bulk Upload</span>
          </nav>
        </div>
      </div>

      <div className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">Bulk Upload Blogs</h1>
              <p className="text-lg text-gray-600">
                Upload multiple blog posts at once using markdown files. Each file will be processed and saved as a draft.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="p-8 border border-gray-200 shadow-sm">
                <BlogBulkUpload 
                  categories={categories} 
                  userId={user?.id || ''}
                />
              </Card>

              <Card className="p-8 border border-gray-200 bg-[#F2FCE2]/50">
                <h2 className="text-xl font-semibold mb-6 text-[#4CAF50]">Tips for Successful Bulk Upload</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">File Requirements</h3>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                      <li>Files must be in .md (Markdown) format</li>
                      <li>Use UTF-8 encoding for all files</li>
                      <li>Follow the template format exactly</li>
                      <li>Keep filenames descriptive and clear</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Best Practices</h3>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                      <li>Verify categories exist before uploading</li>
                      <li>Review content for formatting issues</li>
                      <li>All posts will be saved as drafts</li>
                      <li>Check metadata fields for accuracy</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border border-gray-200 bg-[#E5DEFF]/50">
                <h2 className="text-xl font-semibold mb-4 text-[#7E69AB]">Need Help?</h2>
                <p className="text-gray-600 mb-4">
                  If you're having trouble with bulk uploads or need assistance with formatting, check out our documentation or contact support.
                </p>
                <div className="flex gap-4">
                  <Link 
                    to="/help/bulk-upload"
                    className="text-[#7E69AB] hover:text-[#7E69AB]/80 text-sm font-medium"
                  >
                    View Documentation
                  </Link>
                  <Link 
                    to="/contact"
                    className="text-[#7E69AB] hover:text-[#7E69AB]/80 text-sm font-medium"
                  >
                    Contact Support
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <MainLayout sidebar={<AdminSidebar />}>
      {content}
    </MainLayout>
  );
};
