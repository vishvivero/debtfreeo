
import { EmergencyFundCalculator } from "@/components/tools/EmergencyFundCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const EmergencyFundCalculatorPage = () => {
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
            to="/tools/emergency-fund-savings-calculator" 
            className="text-gray-600"
          >
            Emergency Fund Calculator
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
                Emergency Fund Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Calculate how much you should save for emergencies.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <EmergencyFundCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Planning Your Emergency Fund</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">Why Have an Emergency Fund?</h3>
              <p>
                An emergency fund is your financial safety net for unexpected expenses or income loss. This calculator helps you determine how much you should save based on your personal circumstances.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Components</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Monthly living expenses</li>
                <li>Job stability factors</li>
                <li>Family size considerations</li>
                <li>Insurance deductibles</li>
                <li>Lifestyle requirements</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Recommended Coverage</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>3-6 months: Stable dual income</li>
                <li>6-9 months: Single income household</li>
                <li>9-12 months: Self-employed</li>
                <li>12+ months: Variable income</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Building Your Fund</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Set realistic monthly savings goals</li>
                <li>Automate your savings</li>
                <li>Start small and increase over time</li>
                <li>Keep funds easily accessible</li>
                <li>Monitor and adjust as needed</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Smart Saving Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Use high-yield savings accounts</li>
                  <li>Review and cut unnecessary expenses</li>
                  <li>Consider part-time income opportunities</li>
                  <li>Keep emergency funds separate</li>
                  <li>Replenish after using</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">About</h4>
              <p className="text-gray-600">
                Plan your emergency fund and strengthen your financial security.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/tools" className="hover:text-[#9b87f5] transition-colors">
                    All Calculators
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-[#9b87f5] transition-colors">
                    Financial Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <LegalFooter />
            </div>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
};

export default EmergencyFundCalculatorPage;
