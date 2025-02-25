import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { AdminMetrics } from "@/components/admin/AdminMetrics";
import { AdminBlogList } from "@/components/blog/AdminBlogList";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { CategoryManager } from "@/components/blog/CategoryManager";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { SecurityMonitoring } from "@/components/admin/SecurityMonitoring";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { AnalyticsReporting } from "@/components/admin/AnalyticsReporting";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { PerformanceMetrics } from "@/components/admin/PerformanceMetrics";
import { BannerManagement } from "@/components/admin/BannerManagement";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const EditBlogPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [keyTakeaways, setKeyTakeaways] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching blog:", error);
        throw error;
      }
      return data;
    },
    enabled: !!id
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      return data;
    }
  });

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      setExcerpt(blog.excerpt);
      setCategory(blog.category);
      setKeyTakeaways(blog.key_takeaways || "");
      setMetaTitle(blog.meta_title || "");
      setMetaDescription(blog.meta_description || "");
      setKeywords(blog.keywords || []);
      if (blog.image_url) {
        setImagePreview(blog.image_url);
      }
    }
  }, [blog]);

  if (blogLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BlogPostForm
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      excerpt={excerpt}
      setExcerpt={setExcerpt}
      category={category}
      setCategory={setCategory}
      categories={categories}
      image={image}
      setImage={setImage}
      imagePreview={imagePreview}
      setImagePreview={setImagePreview}
      keyTakeaways={keyTakeaways}
      setKeyTakeaways={setKeyTakeaways}
      metaTitle={metaTitle}
      setMetaTitle={setMetaTitle}
      metaDescription={metaDescription}
      setMetaDescription={setMetaDescription}
      keywords={keywords}
      setKeywords={setKeywords}
      postId={id}
      isSimpleMode={isSimpleMode}
    />
  );
};

const NewBlogPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [keyTakeaways, setKeyTakeaways] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      return data;
    }
  });

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="space-y-6">
          <div className="flex items-center justify-between">
            <CardTitle>Create New Blog Post</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="simple-mode">Simple Mode</Label>
              <Switch
                id="simple-mode"
                checked={isSimpleMode}
                onCheckedChange={setIsSimpleMode}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BlogPostForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            category={category}
            setCategory={setCategory}
            categories={categories}
            image={image}
            setImage={setImage}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            keyTakeaways={keyTakeaways}
            setKeyTakeaways={setKeyTakeaways}
            metaTitle={metaTitle}
            setMetaTitle={setMetaTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            keywords={keywords}
            setKeywords={setKeywords}
            isSimpleMode={isSimpleMode}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  console.log("Admin page - Auth state:", { user: user?.id, authLoading });

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["adminProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available for profile check");
        throw new Error("No user ID available");
      }

      console.log("Checking admin status for user:", user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      if (!data?.is_admin) {
        console.log("User is not an admin:", user.id);
        throw new Error("Not an admin");
      }

      console.log("Admin profile confirmed:", data);
      return data;
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 1000 * 60 * 5,
    retry: false,
    meta: {
      errorMessage: "Failed to verify admin status"
    }
  });

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    console.log("No authenticated user, redirecting to home");
    return <Navigate to="/" replace />;
  }

  if (profileError || !profile?.is_admin) {
    console.log("Access denied:", { error: profileError, isAdmin: profile?.is_admin });
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            You do not have permission to access this area.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <MainLayout sidebar={<AdminSidebar />}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <Routes>
            <Route index element={<AdminMetrics />} />
            <Route path="blogs" element={<AdminBlogList />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="new-post" element={<NewBlogPost />} />
            <Route path="edit/:id" element={<EditBlogPost />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="banner" element={<BannerManagement />} />
            <Route path="security" element={<SecurityMonitoring />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="analytics" element={<AnalyticsReporting />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="performance" element={<PerformanceMetrics />} />
          </Routes>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;
