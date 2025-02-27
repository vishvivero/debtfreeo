
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MarkdownPreview } from "@/components/blog/MarkdownPreview";
import { useState, useEffect } from "react";

interface BlogContentProps {
  excerpt: string;
  setExcerpt: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  keyTakeaways: string;
  setKeyTakeaways: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  metaTitle: string;
  setMetaTitle: (value: string) => void;
  metaDescription: string;
  setMetaDescription: (value: string) => void;
  keywords: string[];
  setKeywords: (value: string[]) => void;
}

export const BlogContent = ({
  excerpt,
  setExcerpt,
  content,
  setContent,
  keyTakeaways,
  setKeyTakeaways,
  title,
  setTitle,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  keywords,
  setKeywords,
}: BlogContentProps) => {
  const [useMarkdownFormat, setUseMarkdownFormat] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");

  const templateMarkdown = `**Title:** ${title || ""}

**Meta Title:** ${metaTitle || ""}

**Meta Description:** ${metaDescription || ""}

**Keywords:** ${keywords?.join(', ') || ""}

**Excerpt:** ${excerpt || ""}

**Content:** 
${content || ""}

**Key Takeaways:** ${keyTakeaways || ""}`;

  useEffect(() => {
    if (useMarkdownFormat) {
      setMarkdownContent(templateMarkdown);
    }
  }, [useMarkdownFormat, title, metaTitle, metaDescription, keywords, excerpt, content, keyTakeaways]);

  const parseMarkdownContent = (mdContent: string) => {
    const sections: { [key: string]: string } = {};
    const regex = /\*\*(.*?):\*\*\s*([\s\S]*?)(?=\n\*\*|$)/g;
    let match;

    while ((match = regex.exec(mdContent)) !== null) {
      const [, key, value] = match;
      sections[key.trim()] = value.trim();
    }

    // Update all fields with parsed content
    setTitle(sections["Title"] || "");
    setMetaTitle(sections["Meta Title"] || "");
    setMetaDescription(sections["Meta Description"] || "");
    setKeywords(sections["Keywords"] ? sections["Keywords"].split(',').map(k => k.trim()) : []);
    setExcerpt(sections["Excerpt"] || "");
    
    // Special handling for Content to preserve formatting
    const contentMatch = mdContent.match(/\*\*Content:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
    if (contentMatch && contentMatch[1]) {
      setContent(contentMatch[1].trim());
    }
    
    setKeyTakeaways(sections["Key Takeaways"] || "");
  };

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    parseMarkdownContent(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="markdown-mode"
          checked={useMarkdownFormat}
          onCheckedChange={setUseMarkdownFormat}
        />
        <Label htmlFor="markdown-mode">Use Markdown Format</Label>
      </div>

      {useMarkdownFormat ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="markdownContent">Markdown Content</Label>
            <Textarea
              id="markdownContent"
              value={markdownContent}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              className="h-[600px] font-mono"
              placeholder="Enter your content in Markdown format..."
            />
          </div>
          <MarkdownPreview content={markdownContent} />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="A brief summary of your post"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="h-24"
            />
          </div>

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
      )}
    </div>
  );
};
