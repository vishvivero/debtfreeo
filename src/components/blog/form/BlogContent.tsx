
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

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
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Write your blog post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-64"
          />
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
