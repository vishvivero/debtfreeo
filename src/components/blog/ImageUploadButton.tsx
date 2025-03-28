
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadButtonProps {
  blogId: string;
  isAdmin: boolean;
  refreshBlog: () => void;
}

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ 
  blogId, 
  isAdmin,
  refreshBlog 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  if (!isAdmin) return null;
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    if (!validImageTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `File type "${file.type}" is not supported. Please select a valid image (JPEG, PNG, GIF, WebP, SVG).`
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB."
      });
      return;
    }
    
    try {
      toast({
        title: "Uploading image...",
        description: "Please wait while we upload your image."
      });
      
      // Create a FormData object for file upload instead of direct binary upload
      const formData = new FormData();
      formData.append('file', file);

      // Log file information for debugging
      console.log("Attempting to upload file:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Ensure we have the correct content type by using arrayBuffer approach
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);
      
      console.log("Uploading to Supabase with filename:", fileName);
      
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type // Explicitly set correct content type
        });
      
      if (error) {
        console.error("Upload error:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      
      if (!data?.path) {
        throw new Error("No path returned from upload");
      }
      
      console.log("Image uploaded successfully, path:", data.path);
      
      // Update the blog post with the new image URL
      const { error: updateError } = await supabase
        .from('blogs')
        .update({ image_url: fileName })
        .eq('id', blogId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Refresh the blog post to show the new image
      refreshBlog();
      
      toast({
        title: "Success",
        description: "Blog image updated successfully."
      });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating blog image:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: `There was an error uploading the image: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };
  
  return (
    <>
      <Button 
        onClick={handleButtonClick}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Update Image
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        data-testid="image-upload-input"
      />
    </>
  );
};
