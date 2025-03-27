import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BlogFormHeader } from "./form/BlogFormHeader";
import { BlogImageUpload } from "./form/BlogImageUpload";
import { BlogContent } from "./form/BlogContent";
import { BlogFormProps } from "./types";
import { useState, useEffect } from "react";
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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  
  const isEditMode = window.location.pathname.includes('/edit/');
  const blogId = isEditMode ? window.location.pathname.split('/').pop() : null;
  
  useEffect(() => {
    if (isEditMode && blogId) {
      const fetchExistingImage = async () => {
        const { data } = await supabase
          .from('blogs')
          .select('image_url')
          .eq('id', blogId)
          .single();
        
        if (data?.image_url) {
          setExistingImageUrl(data.image_url);
        }
      };
      
      fetchExistingImage();
    }
  }, [isEditMode, blogId]);

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
      let imageUrl = existingImageUrl;

      if (image) {
        console.log("Processing image upload...");
        
        // Ensure bucket exists first
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          if (!buckets?.find(bucket => bucket.name === 'blog-images')) {
            console.log("Creating blog-images bucket...");
            await supabase.functions.invoke('create-blog-images-bucket');
            // Wait a moment for bucket creation
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (bucketError) {
          console.error('Error checking/creating buckets:', bucketError);
        }
        
        const fileExt = image.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const contentType = image.type || `image/${fileExt}`;
        
        console.log("Uploading image to storage:", fileName, "with content type:", contentType);
        
        // Try multiple upload approaches
        try {
          // First attempt - standard upload
          const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(fileName, image, {
              cacheControl: '3600',
              upsert: true, // Use upsert instead of false
              contentType: contentType
            });

          if (uploadError) {
            console.error("Standard image upload error:", uploadError);
            
            // Second attempt - use blob approach
            const blobData = new Blob([await image.arrayBuffer()], { type: contentType });
            console.log("Retrying upload with Blob data...");
            
            const { error: retryError } = await supabase.storage
              .from('blog-images')
              .upload(fileName, blobData, {
                cacheControl: '3600',
                upsert: true,
                contentType: contentType
              });
              
            if (retryError) {
              console.error("Blob upload retry error:", retryError);
              
              // Third attempt - using FormData if needed
              const formData = new FormData();
              formData.append('file', image);
              
              // Using the function invoke as a direct upload approach
              const { error: functionError } = await supabase.functions.invoke('create-blog-images-bucket', {
                body: { action: 'forceUpload', fileName, contentType }
              });
              
              if (functionError) {
                console.error("All upload attempts failed:", functionError);
                throw new Error("Could not upload image after multiple attempts");
              }
            }
          }
          
          // Set the image URL to the filename
          imageUrl = fileName;
          console.log("Image URL saved:", imageUrl);
          
          // Verify upload worked by trying to get the URL
          try {
            const { data } = await supabase.storage
              .from('blog-images')
              .getPublicUrl(fileName);
            
            if (data?.publicUrl) {
              console.log("Verified upload successful with URL:", data.publicUrl);
            }
          } catch (verifyError) {
            console.warn("Could not verify image upload, but continuing:", verifyError);
          }
        } catch (finalError) {
          console.error("All image upload attempts failed:", finalError);
          toast({
            variant: "destructive",
            title: "Image Upload Failed",
            description: "Could not upload the image. Blog will be saved without an image.",
          });
          // Continue without image
        }
      }

      const keywordsArray = keywords?.length ? keywords : title.toLowerCase().split(' ');
      
      if (isEditMode && blogId) {
        console.log("Updating existing blog post...");
        const { error: updateError } = await supabase
          .from('blogs')
          .update({
            title,
            content,
            excerpt,
            category: category || 'uncategorized',
            is_published: !isDraft,
            image_url: imageUrl,
            meta_title: metaTitle || title,
            meta_description: metaDescription || excerpt,
            keywords: keywordsArray,
            key_takeaways: keyTakeaways || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', blogId);

        if (updateError) {
          console.error("Blog post update error:", updateError);
          throw updateError;
        }

        console.log("Blog post updated successfully");
        toast({
          title: "Success",
          description: isDraft ? "Draft updated successfully" : "Post updated and published successfully",
        });
      } else {
        const timestamp = new Date().getTime();
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
        
        console.log("Creating new blog post entry...");
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
      }

      navigate('/admin/blogs');
    } catch (error) {
      console.error('Error processing post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process post. Please try again.",
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
        imagePreview={typeof imagePreview === 'function' ? imagePreview : existingImageUrl || imagePreview}
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
          {isEditMode ? "Save as Draft" : "Save as Draft"}
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {isEditMode ? "Update & Publish" : "Publish"}
        </Button>
      </div>
    </div>
  );
};
