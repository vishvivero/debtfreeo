
import { Link, useNavigate } from "react-router-dom";

export const LegalFooter = () => {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    // First navigate to the new route
    navigate(path);
    
    // Then scroll to top with a small delay to ensure the new page is loaded
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Fallback for browsers that don't support smooth scrolling
      if (!('scrollBehavior' in document.documentElement.style)) {
        window.scrollTo(0, 0);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col space-y-2 text-sm text-gray-600">
      <Link to="/privacy" onClick={handleLinkClick("/privacy")} className="hover:text-primary">
        Privacy Policy
      </Link>
      <Link to="/terms" onClick={handleLinkClick("/terms")} className="hover:text-primary">
        Terms of Service
      </Link>
      <Link to="/dpa" onClick={handleLinkClick("/dpa")} className="hover:text-primary">
        Data Processing Agreement
      </Link>
      <Link to="/cookie-policy" onClick={handleLinkClick("/cookie-policy")} className="hover:text-primary">
        Cookie Policy
      </Link>
      <Link to="/gdpr" onClick={handleLinkClick("/gdpr")} className="hover:text-primary">
        GDPR Compliance
      </Link>
      <Link to="/contact" onClick={handleLinkClick("/contact")} className="hover:text-primary">
        Contact
      </Link>
    </div>
  );
};
