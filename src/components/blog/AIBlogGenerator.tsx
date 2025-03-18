
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BlogImageUpload } from "./form/BlogImageUpload";

export const AIBlogGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerateBlog = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to generate blog posts",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt to generate content",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: { prompt, category },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedContent(data.blog);
      toast({
        title: "Success",
        description: "Blog content generated successfully",
      });
    } catch (error) {
      console.error("Error generating blog:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate blog content",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDrafts = async () => {
    if (!generatedContent || !user) return;

    try {
      // Parse the markdown content to extract metadata
      const metadataMatch = generatedContent.match(/---\n([\s\S]*?)\n---\n([\s\S]*)/);
      
      if (!metadataMatch) {
        throw new Error("Could not parse blog metadata");
      }
      
      const metadataStr = metadataMatch[1];
      const content = metadataMatch[2].trim();
      
      // Parse metadata
      const metadata: Record<string, string> = {};
      metadataStr.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          metadata[key.trim()] = valueParts.join(':').trim();
        }
      });
      
      const timestamp = new Date().getTime();
      const slug = `${(metadata.title || 'blog-post').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;

      let imageUrl = null;

      // Handle image upload if an image is selected
      if (image) {
        console.log("Processing image upload...");
        const fileExt = image.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        console.log("Uploading image to storage:", fileName);
        const { error: uploadError, data } = await supabase.storage
          .from('blog-images')
          .upload(fileName, image);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          throw uploadError;
        }

        console.log("Image upload successful:", data);
        imageUrl = fileName;
      }
      
      const { error } = await supabase
        .from('blogs')
        .insert({
          title: metadata.title || 'Untitled',
          content,
          excerpt: metadata.excerpt || metadata.title,
          category: metadata.category || category || 'uncategorized',
          author_id: user.id,
          is_published: false, // Save as draft
          slug,
          meta_title: metadata.meta_title || metadata.title,
          meta_description: metadata.meta_description || metadata.excerpt,
          keywords: metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : [],
          key_takeaways: metadata.key_takeaways || '',
          image_url: imageUrl,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post saved to drafts",
      });
      
      // Clear the form
      setPrompt("");
      setGeneratedContent("");
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog post",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Blog Post with AI</CardTitle>
        <CardDescription>
          Use AI to generate blog content based on your ideas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Blog Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debt-management">Debt Management</SelectItem>
              <SelectItem value="financial-advice">Financial Advice</SelectItem>
              <SelectItem value="saving-tips">Saving Tips</SelectItem>
              <SelectItem value="credit-scores">Credit Scores</SelectItem>
              <SelectItem value="budgeting">Budgeting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Your Blog Idea</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the blog post you want to create..."
            className="h-24"
          />
          <p className="text-sm text-muted-foreground">
            Example: "Write a blog post about strategies for paying off student loans quickly"
          </p>
        </div>

        <div className="space-y-2">
          <Label>Featured Image (Optional)</Label>
          <BlogImageUpload 
            setImage={setImage} 
            imagePreview={setImagePreview}
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Featured image preview" 
                className="w-full max-h-48 object-cover rounded-md" 
              />
            </div>
          )}
        </div>

        <Button 
          onClick={handleGenerateBlog} 
          disabled={isGenerating || !prompt.trim()} 
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Blog Content
            </>
          )}
        </Button>

        {generatedContent && (
          <div className="space-y-4 mt-6">
            <div className="border rounded-md p-4 bg-muted/20">
              <h3 className="text-lg font-medium mb-2">Generated Content</h3>
              <div className="max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
              </div>
            </div>
            
            <Button 
              onClick={handleSaveToDrafts} 
              variant="secondary" 
              className="w-full"
            >
              Save to Drafts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
