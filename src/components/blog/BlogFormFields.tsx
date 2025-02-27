import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogFormProps } from "./types";

export const BlogFormFields = ({
  title,
  setTitle,
  content,
  setContent,
  excerpt,
  setExcerpt,
  category,
  setCategory,
  categories,
  image,
  setImage,
  imagePreview,
}: BlogFormProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        // Update the imagePreview state in the parent component
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
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold"
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          placeholder="A brief summary of your post"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="h-24"
        />
      </div>

      <div>
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea
          id="content"
          placeholder="Write your post content in Markdown format..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-64 font-mono"
        />
      </div>
    </div>
  );
};