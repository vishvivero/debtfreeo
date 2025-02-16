
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
              <h2 className="text-2xl font-semibold text-gray-800">Building Your Emergency Fund</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">Why Have an Emergency Fund?</h3>
              <p>
                An emergency fund is your financial safety net, providing protection against unexpected expenses and income loss. This calculator helps you determine how much you should save based on your specific situation.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Factors to Consider</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Monthly living expenses</li>
                <li>Job stability</li>
                <li>Number of income sources</li>
                <li>Family size and responsibilities</li>
                <li>Health and insurance coverage</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Recommended Fund Sizes</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>3 months: Stable job, dual income</li>
                <li>6 months: Single income, stable job</li>
                <li>9+ months: Self-employed, variable income</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Building Your Fund</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Start with small, regular contributions</li>
                <li>Automate your savings</li>
                <li>Use windfalls and tax returns</li>
                <li>Keep the fund easily accessible</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Smart Saving Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Keep emergency funds in a separate account</li>
                  <li>Use a high-yield savings account</li>
                  <li>Review and adjust your fund size annually</li>
                  <li>Replenish the fund after using it</li>
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
                Plan your emergency fund based on your personal circumstances.
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
