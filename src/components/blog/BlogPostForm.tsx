
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

    try {
      let imageUrl = null;

      // Handle image upload if an image is selected
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('blog-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Create the blog post
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
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        });

      if (postError) throw postError;

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

  return (
    <div className="space-y-8">
      <BlogFormHeader
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      <BlogImageUpload
        setImage={setImage}
        imagePreview={imagePreview}
      />

      <BlogContent
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        content={content}
        setContent={setContent}
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
