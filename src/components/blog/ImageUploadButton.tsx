
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadImageToStorage } from '@/integrations/supabase/storageUtils';

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
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, etc.)."
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
      
      // Upload the image to Supabase Storage
      const fileName = await uploadImageToStorage('blog-images', file);
      
      if (!fileName) {
        throw new Error("Failed to upload image");
      }
      
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
        description: "There was an error uploading the image. Please try again."
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
        accept="image/*"
        className="hidden"
        data-testid="image-upload-input"
      />
    </>
  );
};
