
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const NewPost = () => {
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
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  // Function to format the content in markdown
  const formatMarkdownContent = () => {
    if (!isSimpleMode) return content;

    return `# ${title}

**Meta Title:** ${metaTitle || title}

**Meta Description:** ${metaDescription || excerpt}

**Keywords:** ${keywords.join(', ')}

**Excerpt:** ${excerpt}

## Content

${content}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="space-y-6">
          <div className="flex items-center justify-between">
            <CardTitle>Create New Blog Post</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="simple-mode">Simple Mode</Label>
              <Switch
                id="simple-mode"
                checked={isSimpleMode}
                onCheckedChange={setIsSimpleMode}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BlogPostForm
            title={title}
            setTitle={setTitle}
            content={isSimpleMode ? formatMarkdownContent() : content}
            setContent={setContent}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            category={category}
            setCategory={setCategory}
            image={image}
            setImage={setImage}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            keyTakeaways={keyTakeaways}
            setKeyTakeaways={setKeyTakeaways}
            metaTitle={metaTitle}
            setMetaTitle={setMetaTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            keywords={keywords}
            setKeywords={setKeywords}
            isSimpleMode={isSimpleMode}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPost;
