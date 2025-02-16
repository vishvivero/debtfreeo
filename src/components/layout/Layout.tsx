
import Header from "@/components/Header";
import { useTrackVisit } from "@/hooks/use-track-visit";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useTrackVisit();
  const location = useLocation();
  const isBlogPost = location.pathname.startsWith('/blog/post/');
  
  // Global scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 flex flex-col w-full pt-16">
        <div className="flex-1 flex flex-col w-full relative">
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
