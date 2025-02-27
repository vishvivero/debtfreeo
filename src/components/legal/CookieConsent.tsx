
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    // Only show if no consent has been given yet
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    // Store the consent in localStorage
    localStorage.setItem("cookie-consent", "accepted");
    // Set a cookie that expires in 1 year
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `cookie-consent=accepted; expires=${expiryDate.toUTCString()}; path=/`;
    
    setShowConsent(false);
    toast({
      title: "Preferences saved",
      description: "Your cookie preferences have been saved.",
      duration: 3000,
    });
  };

  const handleDecline = () => {
    // Store the decline in localStorage
    localStorage.setItem("cookie-consent", "declined");
    // Set a cookie that expires in 1 year
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `cookie-consent=declined; expires=${expiryDate.toUTCString()}; path=/`;
    
    setShowConsent(false);
    toast({
      title: "Preferences saved",
      description: "Your choice has been saved. Some features may be limited.",
      duration: 3000,
    });
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg z-[150] dark:bg-gray-900/95"
          style={{
            position: 'fixed',
            width: '100%',
            maxWidth: '100vw',
          }}
        >
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Cookie Consent</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{" "}
                  <Button 
                    variant="link" 
                    className="text-primary p-0 h-auto"
                    onClick={() => window.open("/privacy", "_blank")}
                  >
                    Learn more
                  </Button>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleDecline}>
                  Decline
                </Button>
                <Button onClick={handleAccept}>
                  Accept All
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 md:hidden"
                onClick={handleDecline}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
