
import Header from "@/components/Header";
import { useTrackVisit } from "@/hooks/use-track-visit";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useTrackVisit();
  const location = useLocation();
  const isBlogPost = location.pathname.startsWith('/blog/post/');

  useEffect(() => {
    // Use a slightly longer timeout and ensure we're at the root document
    setTimeout(() => {
      // Get the document root element
      const docElement = document.documentElement;
      const bodyElement = document.body;
      
      // Reset both documentElement and body scroll
      docElement.scrollTop = 0;
      bodyElement.scrollTop = 0;
      
      // Fallback to window.scrollTo for broader compatibility
      window.scrollTo({
        top: 0,
        behavior: 'instant' // Use instant instead of smooth for more reliable behavior
      });
    }, 150); // Increased timeout for better reliability
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 flex flex-col w-full">
        <div className="flex-1 flex flex-col w-full relative py-4">
          {location.pathname !== "/" && !isBlogPost && !location.pathname.startsWith('/tools/') && (
            <Link to="/">
              <Button variant="outline" size="sm" className="absolute top-4 left-4 z-10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
