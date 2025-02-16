
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { PricingPlan } from "@/components/pricing/PricingPlan";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAuthSuccess = () => {
    toast({
      title: "Welcome!",
      description: "Successfully signed in. Let's start planning your debt-free journey!",
    });
    navigate("/planner");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 w-full bg-gradient-to-br from-purple-50 to-blue-50 py-16 flex items-center">
        <div className="w-full container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your journey to financial freedom with our straightforward pricing plans
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <PricingPlan
              title="Basic"
              description="Perfect for getting started"
              badge="Current"
              price="Free"
              interval="/forever"
              features={basicFeatures}
              buttonText="Get Started"
              buttonVariant="outline"
              onAuthSuccess={handleAuthSuccess}
              isAuthenticated={!!user}
            />

            <PricingPlan
              title="Pro"
              description="For serious debt management"
              badge="Free during Beta"
              price="£4.99"
              interval="/month"
              features={proFeatures}
              buttonText="Try Pro for Free"
              badgeVariant="secondary"
              onAuthSuccess={handleAuthSuccess}
              isAuthenticated={!!user}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-16 max-w-2xl mx-auto"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              100% Free During Beta
            </h3>
            <p className="text-gray-600">
              Early adopters get access to all Pro features for free during our beta period. 
              Join now to lock in these benefits and help shape the future of Debtfreeo.
            </p>
          </motion.div>
        </div>
      </div>
      <SharedFooter />
      <CookieConsent />
    </div>
  );
};

const basicFeatures = [
  { text: "Basic debt tracking (cannot save debts)" },
  { text: "Simple payment calculator" },
  { text: "Standard charts and graphs" },
];

const proFeatures = [
  { text: "Everything in Basic" },
  { text: "Save debts in your profile" },
  { text: "Save monthly payment preferences" },
  { text: "Save currency preferences" },
  { text: "Advanced debt strategies" },
  { text: "Priority email support" },
];

export default Pricing;
