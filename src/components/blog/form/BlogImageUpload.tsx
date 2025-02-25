
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface BlogImageUploadProps {
  setImage: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  existingImageUrl?: string | null;
}

export const BlogImageUpload = ({ 
  setImage, 
  imagePreview, 
  setImagePreview,
  existingImageUrl 
}: BlogImageUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    console.log("BlogImageUpload: Existing image URL changed:", existingImageUrl);
    if (existingImageUrl && !imagePreview) {
      console.log("Setting image preview from existing URL");
      setImagePreview(existingImageUrl);
    }
  }, [existingImageUrl, setImagePreview, imagePreview]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const SUPPORTED_FORMATS = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  const validateFile = (file: File): boolean => {
    console.log('Validating file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      maxSize: MAX_FILE_SIZE,
      supported: SUPPORTED_FORMATS.includes(file.type)
    });

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Image must be less than 5MB (current size: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      });
      return false;
    }

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Unsupported format",
        description: "Please upload a JPEG, PNG, WebP, or GIF file"
      });
      return false;
    }

    return true;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to create preview'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    setIsLoading(true);
    setUploadProgress(0);

    try {
      if (!validateFile(file)) {
        console.log('File validation failed');
        setImage(null);
        setImagePreview(null);
        return;
      }

      // Create preview
      try {
        const preview = await createPreview(file);
        console.log('Preview created successfully');
        setImagePreview(preview);
      } catch (error) {
        console.error('Error creating preview:', error);
        toast({
          variant: "destructive",
          title: "Preview Error",
          description: "Failed to create image preview"
        });
        return;
      }

      // Set the file for later upload
      console.log('Setting file for upload');
      setImage(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // Complete the progress
      setTimeout(() => {
        setUploadProgress(100);
        clearInterval(progressInterval);
        
        setTimeout(() => {
          setUploadProgress(0);
        }, 500);

        toast({
          title: "Image ready",
          description: "Image will be uploaded when you save the post",
        });
      }, 1000);

    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process image. Please try again."
      });
      setImage(null);
      setImagePreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    console.log('Removing image');
    setImage(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <Label className="text-lg font-semibold">Featured Image</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a featured image for your blog post (JPEG, PNG, WebP, GIF - max 5MB)
        </p>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="file"
              accept={SUPPORTED_FORMATS.join(',')}
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              disabled={isLoading}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              {isLoading ? 'Processing...' : 'Upload Image'}
            </Button>
          </div>
        </div>
      </div>
      
      {uploadProgress > 0 && (
        <div className="w-full">
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-sm text-muted-foreground mt-1">
            Processing... {uploadProgress}%
          </p>
        </div>
      )}
      
      {imagePreview && (
        <div className="relative">
          <div className="relative w-full max-w-[300px] rounded-lg overflow-hidden border border-gray-200">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto object-cover"
              onError={(e) => {
                console.error('Image preview failed to load');
                const target = e.target as HTMLImageElement;
                target.src = 'placeholder.svg';
              }}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
