
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BlogImageUploadProps {
  setImage: (file: File) => void;
  imagePreview: string | null | ((preview: string) => void);
}

export const BlogImageUpload = ({ setImage, imagePreview }: BlogImageUploadProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
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
          {typeof imagePreview === 'string' && imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded"
            />
          )}
        </div>
      </div>
      <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          For best results, use an image with dimensions of 1200×630 pixels (ratio 1.9:1).
          This size is optimized for both web and mobile viewing, as well as social media sharing.
        </AlertDescription>
      </Alert>
    </div>
  );
};
