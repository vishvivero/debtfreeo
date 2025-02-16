
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BlogContentProps {
  content: string;
  setContent: (value: string) => void;
  keyTakeaways: string;
  setKeyTakeaways: (value: string) => void;
}

export const BlogContent = ({
  content,
  setContent,
  keyTakeaways,
  setKeyTakeaways,
}: BlogContentProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea
          id="content"
          placeholder="Write your post content in Markdown format..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-64 font-mono"
        />
      </div>

      <div>
        <Label htmlFor="keyTakeaways">Key Takeaways</Label>
        <Textarea
          id="keyTakeaways"
          placeholder="List the key points readers should remember..."
          value={keyTakeaways}
          onChange={(e) => setKeyTakeaways(e.target.value)}
          className="h-32"
        />
      </div>
    </div>
  );
};
