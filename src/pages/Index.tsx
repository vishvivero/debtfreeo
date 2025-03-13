
import Header from "@/components/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { SharedFooter } from "@/components/layout/SharedFooter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Target, 
  Clock, 
  TrendingUp,
  PartyPopper,
  Loader2
} from "lucide-react";

const Index = () => {
  const { data: bannerSettings, isLoading } = useQuery({
    queryKey: ["bannerSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col w-full">
      {bannerSettings?.is_visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-r from-emerald-400 to-blue-400 text-white py-3 px-4 text-center"
        >
          <motion.div
            className="flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <PartyPopper className="w-5 h-5 animate-bounce" />
            <a 
              href={bannerSettings.link_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {bannerSettings.message}
            </a>
            <PartyPopper className="w-5 h-5 animate-bounce" />
          </motion.div>
        </motion.div>
      )}
      
      <Header />
      <main className="flex-grow w-full">
        <HeroSection />
        <FeaturesSection />

        {/* Why Choose Debtfreeo Section */}
        <section className="py-24 bg-white border-t border-gray-100 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Debtfreeo?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Take control of your financial future with a platform designed to simplify your debt repayment journey.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "Personalized Strategies",
                  description: "Choose from repayment methods like Avalanche, Snowball, or Balance Ratio to suit your financial needs and goals."
                },
                {
                  icon: BarChart3,
                  title: "Clear Payment Plans",
                  description: "Easily track your monthly payments, total interest saved, and payoff dates in a single, intuitive dashboard."
                },
                {
                  icon: PieChart,
                  title: "Comprehensive Insights",
                  description: "Get a detailed breakdown of your debts, including interest rates, total payments, and timelines for repayment."
                },
                {
                  icon: LineChart,
                  title: "Visual Progress Tracking",
                  description: "Stay motivated with dynamic charts that show how your debts will decrease over time."
                },
                {
                  icon: Clock,
                  title: "Flexible Input Options",
                  description: "Add and manage multiple debts seamlessly, with customizable payment details for better planning."
                },
                {
                  icon: TrendingUp,
                  title: "Built for Simplicity",
                  description: "An easy-to-use interface that focuses on clarity and efficiency, making debt management stress-free."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SharedFooter />
      <CookieConsent />
    </div>
  );
};

export default Index;
