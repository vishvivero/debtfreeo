
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { useQuery } from "@tanstack/react-query";

const NewBlogPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [keyTakeaways, setKeyTakeaways] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      return data;
    }
  });

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BlogPostForm
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      excerpt={excerpt}
      setExcerpt={setExcerpt}
      category={category}
      setCategory={setCategory}
      categories={categories}
      image={image}
      setImage={setImage}
      imagePreview={setImagePreview}
      keyTakeaways={keyTakeaways}
      setKeyTakeaways={setKeyTakeaways}
      metaTitle={metaTitle}
      setMetaTitle={setMetaTitle}
      metaDescription={metaDescription}
      setMetaDescription={setMetaDescription}
      keywords={keywords}
      setKeywords={setKeywords}
    />
  );
};

export default NewBlogPost;
