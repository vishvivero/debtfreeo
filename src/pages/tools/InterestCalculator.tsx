
import { InterestCalculator } from "@/components/tools/InterestCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const InterestCalculatorPage = () => {
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
            to="/tools/loan-interest-payment-calculator" 
            className="text-gray-600"
          >
            Interest Calculator
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
                Interest Calculator
              </h1>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 text-lg">
                  Calculate interest payments and understand the true cost of borrowing with our comprehensive interest calculator.
                </p>
                <h2 className="text-2xl font-semibold text-gray-800 mt-6">What Our Interest Calculator Does</h2>
                <p className="text-gray-600">
                  Our interest calculator helps you understand exactly how much interest you'll pay on your loans or investments. Whether you're considering a new loan or want to analyze your existing debt, this calculator provides clear insights into your interest costs.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">Key Features:</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Calculate total interest paid over the loan term</li>
                  <li>Compare different interest rates and their impact</li>
                  <li>Understand monthly interest charges</li>
                  <li>See the effect of interest rate changes on your payments</li>
                  <li>Analyze both simple and compound interest scenarios</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">How It Helps You</h3>
                <p className="text-gray-600">
                  Understanding interest calculations is crucial for making informed financial decisions. This calculator helps you:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Make better borrowing decisions by understanding the true cost of loans</li>
                  <li>Plan your budget more effectively by knowing your interest expenses</li>
                  <li>Compare different loan offers and their total costs</li>
                  <li>Understand how interest rates affect your monthly payments</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <InterestCalculator />
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
                Understand interest calculations and their impact on your loans.
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

export default InterestCalculatorPage;
