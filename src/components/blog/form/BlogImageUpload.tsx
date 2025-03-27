
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface BlogImageUploadProps {
  setImage: (file: File) => void;
  imagePreview: string | null | ((preview: string) => void);
}

export const BlogImageUpload = ({ setImage, imagePreview }: BlogImageUploadProps) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initialize local preview state from props
  useEffect(() => {
    if (typeof imagePreview === 'string') {
      if (imagePreview && !imagePreview.startsWith('http') && !imagePreview.startsWith('data:')) {
        // It's likely a filename stored in Supabase Storage
        const getImageUrl = async () => {
          try {
            console.log('Getting public URL for file:', imagePreview);
            const { data } = await supabase.storage
              .from('blog-images')
              .getPublicUrl(imagePreview);
            
            if (data?.publicUrl) {
              console.log('Retrieved public URL:', data.publicUrl);
              setLocalPreview(data.publicUrl);
            } else {
              console.error('No public URL returned for image');
              // Use a fallback to try direct access
              const directUrl = `${supabase.supabaseUrl}/storage/v1/object/public/blog-images/${imagePreview}`;
              console.log('Trying direct URL:', directUrl);
              setLocalPreview(directUrl);
            }
          } catch (error) {
            console.error('Error in getImageUrl function:', error);
            // Try a direct URL as fallback
            const directUrl = `${supabase.supabaseUrl}/storage/v1/object/public/blog-images/${imagePreview}`;
            console.log('Error occurred, trying direct URL:', directUrl);
            setLocalPreview(directUrl);
          }
        };
        
        getImageUrl();
      } else {
        // It's already a full URL or a data URL
        setLocalPreview(imagePreview);
      }
    }
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Validate that it's actually an image file
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, GIF, etc.).",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }
      
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setLocalPreview(preview);
        if (typeof imagePreview === 'function') {
          imagePreview(preview);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image">Featured Image</Label>
        <div className="mt-1 flex items-center space-x-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1"
          />
          {localPreview && (
            <img
              src={localPreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded"
              onError={(e) => {
                console.error('Image preview loading error:', e);
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          )}
        </div>
      </div>
      <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          For best results, use an image with dimensions of 1200×630 pixels (ratio 1.9:1).
          This size is optimized for both web and mobile viewing, as well as social media sharing.
        </AlertDescription>
      </Alert>
    </div>
  );
};
