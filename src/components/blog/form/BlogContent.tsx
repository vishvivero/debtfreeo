
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { MarkdownToggle } from "./MarkdownToggle";

interface BlogContentProps {
  excerpt: string;
  setExcerpt: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  keyTakeaways: string;
  setKeyTakeaways: (value: string) => void;
}

export const BlogContent = ({
  excerpt,
  setExcerpt,
  content,
  setContent,
  keyTakeaways,
  setKeyTakeaways,
}: BlogContentProps) => {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            placeholder="Brief summary of the post"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="h-20"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="content">Content</Label>
            <MarkdownToggle 
              isPreview={isPreview} 
              onToggle={() => setIsPreview(!isPreview)} 
            />
          </div>
          
          {isPreview ? (
            <div className="prose max-w-none p-4 border rounded-md bg-white min-h-[256px]">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <Textarea
              id="content"
              placeholder="Write your blog post content here... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-64 font-mono"
            />
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Markdown formatting is supported
          </p>
        </div>
        
        <div>
          <Label htmlFor="keyTakeaways">Key Takeaways</Label>
          <Textarea
            id="keyTakeaways"
            placeholder="Main points readers should remember"
            value={keyTakeaways}
            onChange={(e) => setKeyTakeaways(e.target.value)}
            className="h-32"
          />
        </div>
      </div>
    </Card>
  );
};
