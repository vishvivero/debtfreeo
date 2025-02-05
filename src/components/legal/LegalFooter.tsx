
import { Link } from "react-router-dom";

export const LegalFooter = () => {
  const handleLinkClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col space-y-2 text-sm text-gray-600">
      <Link to="/privacy" onClick={handleLinkClick} className="hover:text-primary">
        Privacy Policy
      </Link>
      <Link to="/terms" onClick={handleLinkClick} className="hover:text-primary">
        Terms of Service
      </Link>
      <Link to="/dpa" onClick={handleLinkClick} className="hover:text-primary">
        Data Processing Agreement
      </Link>
      <Link to="/cookie-policy" onClick={handleLinkClick} className="hover:text-primary">
        Cookie Policy
      </Link>
      <Link to="/gdpr" onClick={handleLinkClick} className="hover:text-primary">
        GDPR Compliance
      </Link>
      <Link to="/contact" onClick={handleLinkClick} className="hover:text-primary">
        Contact
      </Link>
    </div>
  );
};
