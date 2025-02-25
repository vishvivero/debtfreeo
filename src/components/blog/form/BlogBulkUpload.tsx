
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogBulkUploadProps {
  categories: { id: string; name: string; slug: string }[];
  userId: string;
}

export const BlogBulkUpload = ({ categories, userId }: BlogBulkUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const parseMarkdownContent = (content: string) => {
    console.log("Parsing markdown content for bulk upload");
    
    const data: any = {
      title: "",
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      excerpt: "",
      content: "",
      keyTakeaways: "",
      category: "uncategorized"
    };

    // Extract title (first h1)
    const titleMatch = content.match(/^#\s*([^\n]+)/);
    if (titleMatch) {
      data.title = titleMatch[1].trim();
    }

    // Extract meta information
    const metaTitleMatch = content.match(/\*\*Meta Title:\*\*\s*([^\n]+)/);
    if (metaTitleMatch) {
      data.metaTitle = metaTitleMatch[1].trim();
    }

    const metaDescriptionMatch = content.match(/\*\*Meta Description:\*\*\s*([^\n]+)/);
    if (metaDescriptionMatch) {
      data.metaDescription = metaDescriptionMatch[1].trim();
    }

    const keywordsMatch = content.match(/\*\*Keywords:\*\*\s*([^\n]+)/);
    if (keywordsMatch) {
      data.keywords = keywordsMatch[1].split(',').map((k: string) => k.trim());
    }

    // Extract excerpt
    const excerptMatch = content.match(/\*\*Excerpt:\*\*\s*\n\n([^#]+)/);
    if (excerptMatch) {
      data.excerpt = excerptMatch[1].trim();
    }

    // Extract key takeaways
    const keyTakeawaysMatch = content.match(/## Key Takeaways\n\n([\s\S]+?)(?=\n##|$)/);
    if (keyTakeawaysMatch) {
      data.keyTakeaways = keyTakeawaysMatch[1].trim();
    }

    // Extract main content
    const mainContentMatch = content.match(/^(?:.*\n)*?##\s*[^\n]+\n\n([\s\S]+?)(?=\n##\s*Key Takeaways|$)/);
    if (mainContentMatch) {
      data.content = mainContentMatch[1].trim();
    }

    // Find category if mentioned
    const categoryMatch = content.match(/\*\*Category:\*\*\s*([^\n]+)/);
    if (categoryMatch) {
      const categoryName = categoryMatch[1].trim();
      const foundCategory = categories.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase() ||
        c.slug.toLowerCase() === categoryName.toLowerCase()
      );
      if (foundCategory) {
        data.category = foundCategory.slug;
      }
    }

    return data;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const successfulUploads: string[] = [];
    const failedUploads: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();
        
        try {
          const parsedData = parseMarkdownContent(content);
          const timestamp = new Date().getTime();
          const slug = `${parsedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
          
          const readTimeMinutes = calculateReadTime(parsedData.content);

          const { error } = await supabase
            .from('blogs')
            .insert({
              title: parsedData.title,
              content: parsedData.content,
              excerpt: parsedData.excerpt || parsedData.title,
              category: parsedData.category,
              meta_title: parsedData.metaTitle || parsedData.title,
              meta_description: parsedData.metaDescription || parsedData.excerpt,
              keywords: parsedData.keywords,
              key_takeaways: parsedData.keyTakeaways,
              read_time_minutes: readTimeMinutes,
              author_id: userId,
              slug,
              is_published: false
            });

          if (error) {
            console.error("Error uploading blog:", error);
            failedUploads.push(file.name);
          } else {
            successfulUploads.push(file.name);
          }
        } catch (err) {
          console.error("Error processing file:", file.name, err);
          failedUploads.push(file.name);
        }
      }

      if (successfulUploads.length > 0) {
        toast({
          title: "Blogs uploaded successfully",
          description: `Successfully uploaded ${successfulUploads.length} blog(s)${
            failedUploads.length > 0 
              ? `. Failed to upload: ${failedUploads.join(', ')}`
              : ''
          }`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload any blogs. Please check the format and try again.",
        });
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "An error occurred during the upload process.",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="bulk-upload">Bulk Upload Markdown Files</Label>
          <p className="text-sm text-muted-foreground">
            Upload multiple .md files to create blog posts. Each file should follow the template format.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="relative"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="ml-2">Select Files</span>
            <input
              id="bulk-upload"
              type="file"
              accept=".md"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Files should follow this format:</p>
          <pre className="mt-2 p-2 bg-muted rounded-md text-xs">
{`# Title

**Meta Title:** Your SEO title
**Meta Description:** Your SEO description
**Keywords:** keyword1, keyword2, keyword3
**Category:** Category Name

**Excerpt:**

Brief summary of your post

## Content

Your blog post content here...

## Key Takeaways

* Key point 1
* Key point 2
* Key point 3`}
          </pre>
        </div>
      </div>
    </Card>
  );
};
