
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogPostForm } from "@/components/blog/BlogPostForm";

export const NewPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [keyTakeaways, setKeyTakeaways] = useState("");

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            category={category}
            setCategory={setCategory}
            image={image}
            setImage={setImage}
            imagePreview={setImagePreview}
            keyTakeaways={keyTakeaways}
            setKeyTakeaways={setKeyTakeaways}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPost;
