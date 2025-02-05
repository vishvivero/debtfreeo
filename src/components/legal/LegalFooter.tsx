
import { Link, useNavigate } from "react-router-dom";

export const LegalFooter = () => {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // First navigate to the new route
    navigate(path);
    
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
