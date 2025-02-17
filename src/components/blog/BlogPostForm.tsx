
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BlogFormHeader } from "./form/BlogFormHeader";
import { BlogImageUpload } from "./form/BlogImageUpload";
import { BlogContent } from "./form/BlogContent";
import { BlogFormProps } from "./types";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const BlogPostForm = ({
  title,
  setTitle,
  content,
  setContent,
  excerpt,
  setExcerpt,
  category,
  setCategory,
  categories,
  image,
  setImage,
  imagePreview,
  keyTakeaways,
  setKeyTakeaways,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  keywords,
  setKeywords,
}: BlogFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (isDraft: boolean = true) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a post",
      });
      return;
    }

    if (!title || !content || !excerpt) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Starting blog post submission...");

    try {
      let imageUrl = null;

      // Handle image upload if an image is selected
      if (image) {
        console.log("Processing image upload...");
        const fileExt = image.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        console.log("Uploading image to storage:", fileName);
        const { error: uploadError, data } = await supabase.storage
          .from('blog-images')
          .upload(fileName, image);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw uploadError;
        }

        console.log("Image upload successful:", data);
        
        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

        imageUrl = fileName; // Store only the filename in the database
        console.log("Image URL saved:", imageUrl);
      }

      // Generate a unique slug by appending a timestamp
      const timestamp = new Date().getTime();
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
      
      const keywordsArray = keywords?.length ? keywords : title.toLowerCase().split(' ');

      console.log("Creating blog post entry...");
      const { error: postError } = await supabase
        .from('blogs')
        .insert({
          title,
          content,
          excerpt,
          category: category || 'uncategorized',
          author_id: user.id,
          is_published: !isDraft,
          image_url: imageUrl,
          slug,
          meta_title: metaTitle || title,
          meta_description: metaDescription || excerpt,
          keywords: keywordsArray,
          key_takeaways: keyTakeaways || '',
        });

      if (postError) {
        console.error("Blog post creation error:", postError);
        throw postError;
      }

      console.log("Blog post created successfully");
      toast({
        title: "Success",
        description: isDraft ? "Draft saved successfully" : "Post published successfully",
      });

      navigate('/admin/blogs');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setKeywords) {
      const keywordsString = e.target.value;
      setKeywords(keywordsString.split(',').map(k => k.trim()));
    }
  };

  return (
    <div className="space-y-8">
      <BlogFormHeader
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
            <Input
              id="metaTitle"
              placeholder="Meta title for search engines"
              value={metaTitle}
              onChange={(e) => setMetaTitle && setMetaTitle(e.target.value)}
              className="max-w-2xl"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank to use the post title
            </p>
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Input
              id="metaDescription"
              placeholder="Brief description for search engines"
              value={metaDescription}
              onChange={(e) => setMetaDescription && setMetaDescription(e.target.value)}
              className="max-w-2xl"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank to use the post excerpt
            </p>
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              placeholder="e.g., debt management, financial planning, savings"
              value={keywords?.join(', ')}
              onChange={handleKeywordsChange}
              className="max-w-2xl"
            />
          </div>
        </div>
      </div>

      <BlogImageUpload
        setImage={setImage}
        imagePreview={imagePreview}
      />

      <BlogContent
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        content={content}
        setContent={setContent}
        keyTakeaways={keyTakeaways}
        setKeyTakeaways={setKeyTakeaways}
        title={title}
        setTitle={setTitle}
        metaTitle={metaTitle}
        setMetaTitle={setMetaTitle}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        keywords={keywords}
        setKeywords={setKeywords}
      />

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Publish
        </Button>
      </div>
    </div>
  );
};
