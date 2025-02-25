
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface BlogImageUploadProps {
  setImage: (file: File | null) => void;
  imagePreview: string | null | ((preview: string) => void);
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const BlogImageUpload = ({ setImage, imagePreview }: BlogImageUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image must be less than 5MB"
      });
      return false;
    }

    // Check file type
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      if (!validateFile(file)) {
        setImage(null);
        return;
      }

      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        if (typeof imagePreview === 'function') {
          imagePreview(preview);
        }
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process image. Please try again."
      });
      setImage(null);
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
      </div>
      
      {typeof imagePreview === 'string' && imagePreview && (
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
