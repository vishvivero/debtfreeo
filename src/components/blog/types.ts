
export interface BlogFormProps {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  excerpt: string;
  setExcerpt: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories?: Array<{ id: string; name: string; slug: string }>;
  image: File | null;
  setImage: (file: File | null) => void;
  imagePreview: string | null | ((preview: string) => void);
}
