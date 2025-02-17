
import { LifeInsuranceCalculator } from "@/components/tools/LifeInsuranceCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Shield } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const LifeInsuranceCalculatorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm mb-8"
        >
          <Link 
            to="/tools" 
            className="text-primary hover:underline"
          >
            Tools
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link 
            to="/tools/term-life-insurance-calculator" 
            className="text-gray-600"
          >
            Life Insurance Calculator
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
                Term Life Insurance Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Calculate how much life insurance coverage you need to protect your loved ones.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <LifeInsuranceCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Understanding Life Insurance</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Our life insurance calculator helps you estimate how much coverage you need based on your 
                income, debts, and family situation to ensure your loved ones are financially protected.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Factors</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Current income and future earnings potential</li>
                <li>Number of dependents</li>
                <li>Outstanding debts and mortgages</li>
                <li>Expected final expenses</li>
                <li>Children's education costs</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Insurance Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Buy when you're young and healthy for better rates</li>
                  <li>Consider both term and permanent life insurance</li>
                  <li>Review coverage after major life events</li>
                  <li>Compare quotes from multiple providers</li>
                  <li>Consider additional riders for extra protection</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <SharedFooter />
      <CookieConsent />
    </div>
  );
};

export default LifeInsuranceCalculatorPage;
