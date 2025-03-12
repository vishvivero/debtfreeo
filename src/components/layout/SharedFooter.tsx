
import { Link, useNavigate } from "react-router-dom";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { useSystemSettings } from "@/hooks/use-system-settings";

export const SharedFooter = () => {
  const navigate = useNavigate();
  const { settings } = useSystemSettings();

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
    <footer className="bg-gray-50 py-12 border-t border-gray-100 w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" onClick={handleLinkClick("/")} className="text-xl font-bold text-gray-900 hover:text-primary transition-colors">
              Debtfreeo
            </Link>
            <p className="text-gray-600">
              Your journey to financial freedom starts here.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/tools" onClick={handleLinkClick("/tools")} className="hover:text-primary transition-colors">
                  Free Tools
                </Link>
              </li>
              <li>
                <Link to="/blog" onClick={handleLinkClick("/blog")} className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={handleLinkClick("/faq")} className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              {settings.showPricing && (
                <li>
                  <Link to="/pricing" onClick={handleLinkClick("/pricing")} className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/about" onClick={handleLinkClick("/about")} className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick("/contact")} className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <LegalFooter />
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>&copy; 2025 Debtfreeo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
