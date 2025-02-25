import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { MarkdownToggle } from "./MarkdownToggle";
import { Switch } from "@/components/ui/switch";

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
  const [allowComments, setAllowComments] = useState(true);
  const [isFeaturePost, setIsFeaturePost] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comments">Allow Comments</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable comments on this post
              </p>
            </div>
            <Switch
              id="comments"
              checked={allowComments}
              onCheckedChange={setAllowComments}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="featured">Featured Post</Label>
              <p className="text-sm text-muted-foreground">
                Show this post in featured section
              </p>
            </div>
            <Switch
              id="featured"
              checked={isFeaturePost}
              onCheckedChange={setIsFeaturePost}
            />
          </div>
        </div>

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
