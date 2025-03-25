import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles, Image as ImageIcon, Wand2, Lightbulb, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BlogImageUpload } from "./form/BlogImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { BlogAutomationScheduler } from "./BlogAutomationScheduler";

export const AIBlogGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [blogIdeas, setBlogIdeas] = useState<Array<{title: string, description: string}>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch existing blogs to avoid duplicates
  const { data: existingBlogs } = useQuery({
    queryKey: ["existing-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("title")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching existing blogs:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  const handleGenerateIdeas = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to generate blog ideas",
      });
      return;
    }

    setIsGeneratingIdeas(true);
    setBlogIdeas([]);

    try {
      const existingBlogTitles = existingBlogs?.map(blog => blog.title) || [];
      
      const { data, error } = await supabase.functions.invoke("generate-blog-ideas", {
        body: { 
          existingBlogTitles,
          category
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setBlogIdeas(data.ideas);
      toast({
        title: "Success",
        description: "Blog ideas generated successfully",
      });
    } catch (error) {
      console.error("Error generating blog ideas:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate blog ideas",
      });
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSelectIdea = (idea: { title: string, description: string }) => {
    const idealPrompt = `Write a blog post about "${idea.title}". The blog should cover: ${idea.description}`;
    setPrompt(idealPrompt);
    
    toast({
      title: "Idea Selected",
      description: "Blog idea added to prompt. You can now generate the content.",
    });
  };

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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an image prompt",
      });
      return;
    }

    setIsGeneratingImage(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-image", {
        body: { prompt: imagePrompt },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      
      const file = new File([blob], `generated-image-${Date.now()}.png`, { type: 'image/png' });
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      toast({
        title: "Success",
        description: "Image generated successfully",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSaveBlog = async (isPublished: boolean = false) => {
    if (!generatedContent || !user) return;
    
    setIsSaving(true);

    try {
      const metadataMatch = generatedContent.match(/---\n([\s\S]*?)\n---\n([\s\S]*)/);
      
      if (!metadataMatch) {
        throw new Error("Could not parse blog metadata");
      }
      
      const metadataStr = metadataMatch[1];
      const content = metadataMatch[2].trim();
      
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
          is_published: isPublished,
          slug,
          meta_title: metadata.meta_title || metadata.title,
          meta_description: metadata.meta_description || metadata.excerpt,
          keywords: metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : [],
          key_takeaways: metadata.key_takeaways || '',
          image_url: imageUrl,
          published_at: isPublished ? new Date().toISOString() : null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: isPublished ? "Blog post published successfully" : "Blog post saved to drafts",
      });
      
      setPrompt("");
      setGeneratedContent("");
      setImage(null);
      setImagePreview(null);
      setBlogIdeas([]);
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog post",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Blog Post with AI</CardTitle>
        <CardDescription>
          Use AI to generate blog content based on your ideas or set up automated publishing
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

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual">Manual Generation</TabsTrigger>
            <TabsTrigger value="automated">Automated Publishing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">Your Blog Idea</Label>
                <Button 
                  onClick={handleGenerateIdeas} 
                  disabled={isGeneratingIdeas}
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                >
                  {isGeneratingIdeas ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Get Blog Ideas
                    </>
                  )}
                </Button>
              </div>

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

            {blogIdeas.length > 0 && (
              <div className="space-y-2 border rounded-md p-4 bg-muted/20">
                <h3 className="text-sm font-medium">Suggested Blog Ideas</h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {blogIdeas.map((idea, index) => (
                    <div key={index} className="bg-card p-3 rounded-md border shadow-sm">
                      <h4 className="font-medium text-sm">{idea.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{idea.description}</p>
                      <Button 
                        onClick={() => handleSelectIdea(idea)} 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs"
                      >
                        Use This Idea
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Featured Image</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                  <TabsTrigger value="generate">Generate with AI</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="pt-4">
                  <BlogImageUpload 
                    setImage={setImage} 
                    imagePreview={setImagePreview}
                  />
                </TabsContent>
                <TabsContent value="generate" className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imagePrompt">Image Description</Label>
                    <div className="flex space-x-2">
                      <Textarea
                        id="imagePrompt"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe the image you want to generate..."
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !imagePrompt.trim()}
                        className="self-end"
                      >
                        {isGeneratingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Example: "A person happily reviewing their finances with a calculator"
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Featured image preview" 
                    className="w-full max-h-48 object-cover rounded-md" 
                  />
                  {activeTab === "generate" && (
                    <p className="text-xs text-muted-foreground mt-1">Generated image will be saved with your blog post</p>
                  )}
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
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleSaveBlog(false)} 
                    variant="secondary" 
                    className="flex-1"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save to Drafts
                  </Button>
                  
                  <Button 
                    onClick={() => handleSaveBlog(true)}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Publish
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="automated" className="space-y-4">
            <div className="bg-muted/20 p-4 rounded-md border mb-4">
              <h3 className="font-medium mb-2">Automated Blog Publishing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set up schedules to automatically generate and publish blog posts at specific times.
                The system will create unique content based on your selected category and ensure it doesn't
                duplicate existing blog posts.
              </p>
              
              <BlogAutomationScheduler category={category} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
