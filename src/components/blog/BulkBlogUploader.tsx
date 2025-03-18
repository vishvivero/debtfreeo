
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const BulkBlogUploader = () => {
  const [bulkContent, setBulkContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadTemplate = `---
title: Blog Post Title
excerpt: A brief summary of your post
category: blog-category
meta_title: SEO Meta Title (optional)
meta_description: SEO Meta Description (optional)
keywords: keyword1, keyword2, keyword3
key_takeaways: Key points to remember (optional)
---

Content goes here in markdown format...
`;

  const handleBulkUpload = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to upload posts",
      });
      return;
    }

    if (!bulkContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter content to upload",
      });
      return;
    }

    setIsUploading(true);

    try {
      const posts = parseBulkContent(bulkContent);
      
      if (posts.length === 0) {
        throw new Error("No valid posts found in the provided content");
      }

      let successCount = 0;
      let errorCount = 0;

      for (const post of posts) {
        try {
          const timestamp = new Date().getTime();
          const slug = `${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
          
          const { error } = await supabase
            .from('blogs')
            .insert({
              title: post.title,
              content: post.content,
              excerpt: post.excerpt || post.title,
              category: post.category || 'uncategorized',
              author_id: user.id,
              is_published: false, // Always create as drafts for review
              slug,
              meta_title: post.meta_title || post.title,
              meta_description: post.meta_description || post.excerpt || '',
              keywords: post.keywords ? post.keywords.split(',').map(k => k.trim()) : [],
              key_takeaways: post.key_takeaways || '',
            });

          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error('Error creating post:', err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} posts. ${errorCount > 0 ? `Failed to upload ${errorCount} posts.` : ''}`,
        });
        setBulkContent(""); // Clear the textarea on success
      } else {
        throw new Error("Failed to upload any posts");
      }
    } catch (error) {
      console.error('Error in bulk upload:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const parseBulkContent = (content: string) => {
    const posts = [];
    // Split content by triple dash separator
    const postSections = content.split(/---\s*\n/);
    
    // Process sections in pairs (metadata and content)
    for (let i = 1; i < postSections.length; i += 2) {
      if (i + 1 < postSections.length) {
        const metadata = postSections[i];
        const postContent = postSections[i + 1].trim();
        
        // Parse metadata
        const post: any = { content: postContent };
        
        metadata.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length) {
            const value = valueParts.join(':').trim();
            if (value) {
              post[key.trim()] = value;
            }
          }
        });
        
        // Only add if we have at least a title
        if (post.title) {
          posts.push(post);
        }
      }
    }
    
    return posts;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Blog Posts</CardTitle>
        <CardDescription>
          Upload multiple blog posts at once using markdown format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Required Format:</h3>
          <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded border">
            {uploadTemplate}
          </pre>
          <p className="text-sm text-muted-foreground mt-2">
            Separate multiple posts with triple dashes (---).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bulkContent">Paste Your Markdown Content</Label>
          <Textarea
            id="bulkContent"
            value={bulkContent}
            onChange={(e) => setBulkContent(e.target.value)}
            placeholder="Paste your markdown formatted blog posts here..."
            className="h-[300px] font-mono"
          />
        </div>

        <Button 
          onClick={handleBulkUpload} 
          disabled={isUploading} 
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Blog Posts
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
