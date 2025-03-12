
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      imagePreview={setImagePreview}
      keyTakeaways={keyTakeaways}
      setKeyTakeaways={setKeyTakeaways}
      metaTitle={metaTitle}
      setMetaTitle={setMetaTitle}
      metaDescription={metaDescription}
      setMetaDescription={setMetaDescription}
      keywords={keywords}
      setKeywords={setKeywords}
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
      imagePreview={setImagePreview}
      keyTakeaways={keyTakeaways}
      setKeyTakeaways={setKeyTakeaways}
      metaTitle={metaTitle}
      setMetaTitle={setMetaTitle}
      metaDescription={metaDescription}
      setMetaDescription={setMetaDescription}
      keywords={keywords}
      setKeywords={setKeywords}
    />
  );
};

const Admin = () => {
  const { user, refreshSession } = useAuth();
  const { profile, isLoading: profileLoading, error: profileError } = useProfile();
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkError, setCheckError] = useState<Error | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      console.log("Admin page - No user found during admin check");
      setIsAdminChecked(true);
      return;
    }
    
    try {
      if (!profile && !profileError && !profileLoading) {
        await refreshSession();
      }
      
      if (profileError) {
        console.error("Admin check - Error loading profile:", profileError);
        setCheckError(profileError as Error);
        setIsAdminChecked(true);
        return;
      }
      
      if (profile) {
        console.log("Admin check - Profile loaded:", profile);
        setIsAdmin(!!profile.is_admin);
        setIsAdminChecked(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setCheckError(error as Error);
      setIsAdminChecked(true);
      
      toast({
        title: "Error",
        description: "There was a problem checking admin status. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, profile, profileError, profileLoading, refreshSession, toast]);

  useEffect(() => {
    if (!isAdminChecked && !profileLoading && user?.id) {
      const timer = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Direct admin check error:", error);
            setCheckError(new Error(error.message));
          } else if (data) {
            console.log("Direct admin check result:", data);
            setIsAdmin(!!data.is_admin);
            
            queryClient.setQueryData(["profile", user.id], data);
          }
          
          setIsAdminChecked(true);
        } catch (err) {
          console.error("Critical error in direct admin check:", err);
          setIsAdminChecked(true);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAdminChecked, profileLoading, queryClient]);

  useEffect(() => {
    if (isAdminChecked && !isAdmin && !profileLoading) {
      const redirectTimer = setTimeout(() => {
        if (window.location.pathname.startsWith('/admin')) {
          toast({
            title: "Access Denied",
            description: "You do not have permission to access the admin area.",
            variant: "destructive",
          });
          navigate("/overview", { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAdminChecked, isAdmin, navigate, toast, profileLoading]);

  if (!isAdminChecked || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (checkError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            There was an error loading the admin dashboard: {checkError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    console.log("Admin page - No user, redirecting to /");
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    console.log("Admin page - User is not an admin");
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

  console.log("Admin page - Rendering for admin user");
  
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
