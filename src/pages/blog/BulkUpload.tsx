
import { useAuth } from "@/lib/auth";
import { BlogBulkUpload } from "@/components/blog/form/BlogBulkUpload";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const BulkUpload = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Upload Blogs</h1>
        <p className="text-muted-foreground">
          Upload multiple blog posts at once using markdown files. Each file will be processed and saved as a draft.
        </p>
      </div>

      <div className="space-y-6">
        <BlogBulkUpload 
          categories={categories} 
          userId={user?.id || ''}
        />

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tips for Bulk Upload</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
            <li>Each markdown file should follow the template format exactly</li>
            <li>All uploaded posts will be saved as drafts initially</li>
            <li>Files should be in .md format and UTF-8 encoded</li>
            <li>Make sure to specify categories that exist in your system</li>
            <li>Keep your markdown files organized with clear, descriptive names</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
