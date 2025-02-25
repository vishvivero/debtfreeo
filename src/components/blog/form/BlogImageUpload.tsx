
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface BlogImageUploadProps {
  setImage: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const BlogImageUpload = ({ setImage, imagePreview, setImagePreview }: BlogImageUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    console.log('Validating file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('File too large:', file.size);
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Image must be less than 5MB (current size: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      });
      return false;
    }

    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      console.log('Unsupported format:', file.type);
      toast({
        variant: "destructive",
        title: "Unsupported format",
        description: `File type ${file.type} is not supported. Please upload a JPEG, PNG, WebP, or GIF file`
      });
      return false;
    }

    console.log('File validation successful');
    return true;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name);
    setIsLoading(true);
    setUploadProgress(0);

    try {
      if (!validateFile(file)) {
        setImage(null);
        setImagePreview(null);
        setUploadProgress(0);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setImagePreview(preview);
      };
      reader.readAsDataURL(file);

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

      setImage(file);
      setUploadProgress(100);
      
      // Clear the progress interval
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(0);
      }, 500);

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

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image">Featured Image</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
        </p>
        <div className="mt-1 flex items-center space-x-4">
          <Input
            id="image"
            type="file"
            accept={SUPPORTED_FORMATS.join(',')}
            onChange={handleImageChange}
            className="flex-1"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="text-sm text-muted-foreground">
              Processing...
            </div>
          )}
        </div>
        {uploadProgress > 0 && (
          <div className="mt-2">
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}
      </div>
      
      {imagePreview && (
        <div className="relative w-full max-w-[200px]">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
};
