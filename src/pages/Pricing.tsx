
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { PricingPlan } from "@/components/pricing/PricingPlan";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [planType, setPlanType] = useState("personal");

  const handleAuthSuccess = () => {
    toast({
      title: "Welcome!",
      description: "Successfully signed in. Let's start planning your debt-free journey!",
    });
    navigate("/planner");
  };

  const getFeaturesForPlan = () => {
    if (planType === "personal") {
      return {
        basic: basicFeatures,
        pro: proFeatures
      };
    } else {
      return {
        basic: familyBasicFeatures,
        pro: familyProFeatures
      };
    }
  };

  const getPricing = () => {
    if (planType === "personal") {
      return {
        basic: { price: "Free", interval: "/forever" },
        pro: { price: "£4.99", interval: "/month" }
      };
    } else {
      return {
        basic: { price: "£6.99", interval: "/month" },
        pro: { price: "£9.99", interval: "/month" }
      };
    }
  };

  const getDescription = () => {
    if (planType === "personal") {
      return {
        basic: "Perfect for getting started",
        pro: "For serious debt management"
      };
    } else {
      return {
        basic: "Perfect for couples (2 members)",
        pro: "Ideal for families (4 members)"
      };
    }
  };

  const pricing = getPricing();
  const descriptions = getDescription();
  const features = getFeaturesForPlan();

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
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Start your journey to financial freedom with our straightforward pricing plans
            </p>
            <ToggleGroup 
              type="single" 
              value={planType}
              onValueChange={(value) => value && setPlanType(value)}
              className="inline-flex bg-muted p-1 rounded-lg"
            >
              <ToggleGroupItem 
                value="personal" 
                className="px-4 py-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow"
              >
                Personal
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="family"
                className="px-4 py-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow"
              >
                Family
              </ToggleGroupItem>
            </ToggleGroup>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <PricingPlan
              title={planType === "personal" ? "Basic" : "2 Members"}
              description={descriptions.basic}
              badge={planType === "personal" ? "Current" : "Popular"}
              price={pricing.basic.price}
              interval={pricing.basic.interval}
              features={features.basic}
              buttonText={planType === "personal" ? "Get Started" : "Start Family Plan"}
              buttonVariant="outline"
              onAuthSuccess={handleAuthSuccess}
              isAuthenticated={!!user}
            />

            <PricingPlan
              title={planType === "personal" ? "Pro" : "4 Members"}
              description={descriptions.pro}
              badge="Free during Beta"
              price={pricing.pro.price}
              interval={pricing.pro.interval}
              features={features.pro}
              buttonText={planType === "personal" ? "Try Pro for Free" : "Start Family Pro"}
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

const familyBasicFeatures = [
  { text: "Everything in Basic Personal plan" },
  { text: "2 member accounts" },
  { text: "Shared household debt tracking" },
  { text: "Family payment planning" },
  { text: "Basic family reports" },
];

const familyProFeatures = [
  { text: "Everything in Pro Personal plan" },
  { text: "4 member accounts" },
  { text: "Advanced family debt strategies" },
  { text: "Family payment automation" },
  { text: "Comprehensive family reports" },
  { text: "Priority family support" },
];

export default Pricing;
