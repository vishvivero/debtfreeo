
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { useQuery } from "@tanstack/react-query";

const EditBlogPost = () => {
  const { id } = useParams();
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

  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching blog:", error);
        throw error;
      }
      return data;
    },
    enabled: !!id
  });

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

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      setExcerpt(blog.excerpt);
      setCategory(blog.category);
      setKeyTakeaways(blog.key_takeaways || "");
      setMetaTitle(blog.meta_title || "");
      setMetaDescription(blog.meta_description || "");
      setKeywords(blog.keywords || []);
      if (blog.image_url) {
        setImagePreview(blog.image_url);
      }
    }
  }, [blog]);

  if (blogLoading || categoriesLoading) {
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

export default EditBlogPost;
