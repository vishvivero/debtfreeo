
import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";

export const LaunchBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-emerald-400 to-blue-400 text-white py-2"
    >
      <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-sm sm:text-base">
        <PartyPopper className="h-5 w-5 animate-bounce" />
        <p>
          DebtFreeo is now live on{" "}
          <a
            href="https://launched.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-white/90 transition-colors"
          >
            launched.lovable.app
          </a>
          ! Please check it out, vote, and show your support!
        </p>
        <PartyPopper className="h-5 w-5 animate-bounce" />
      </div>
    </motion.div>
  );
};
