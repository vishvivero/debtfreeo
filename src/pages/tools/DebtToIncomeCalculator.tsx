
import { DebtToIncomeCalculator } from "@/components/tools/DebtToIncomeCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const DebtToIncomeCalculatorPage = () => {
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
            to="/tools/debt-to-income-ratio-calculator" 
            className="text-gray-600"
          >
            Debt-to-Income Calculator
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
                Debt-to-Income Calculator
              </h1>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 text-lg">
                  Calculate your debt-to-income ratio to understand your financial health and borrowing capacity.
                </p>
                <h2 className="text-2xl font-semibold text-gray-800 mt-6">Understanding Your Debt-to-Income Ratio</h2>
                <p className="text-gray-600">
                  Your debt-to-income (DTI) ratio is a key financial metric that lenders use to evaluate your borrowing capacity. This calculator helps you understand where you stand and what it means for your financial future.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">What This Calculator Helps You Understand:</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Your current debt-to-income ratio</li>
                  <li>How lenders view your financial situation</li>
                  <li>Your capacity to take on additional debt</li>
                  <li>Areas where you might need to reduce debt</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">Why Your DTI Ratio Matters</h3>
                <p className="text-gray-600">
                  Understanding your DTI ratio helps you:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Evaluate your current financial health</li>
                  <li>Prepare for mortgage or loan applications</li>
                  <li>Identify when to focus on debt reduction</li>
                  <li>Make informed decisions about taking on new debt</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <DebtToIncomeCalculator />
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
                Understand your debt-to-income ratio and make informed financial decisions.
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

export default DebtToIncomeCalculatorPage;
