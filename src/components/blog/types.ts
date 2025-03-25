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
  keyTakeaways: string;
  setKeyTakeaways: (value: string) => void;
  metaTitle?: string;
  setMetaTitle?: (value: string) => void;
  metaDescription?: string;
  setMetaDescription?: (value: string) => void;
  keywords?: string[];
  setKeywords?: (value: string[]) => void;
}

export interface BlogAutomationSchedule {
  id?: string;
  user_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  hour: number;
  day_of_week?: number | null;
  day_of_month?: number | null;
  category: string;
  is_active: boolean;
  created_at?: string;
  last_run_at?: string | null;
}
