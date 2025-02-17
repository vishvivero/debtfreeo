
import { NetWorthCalculator } from "@/components/tools/NetWorthCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, PiggyBank } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const NetWorthCalculatorPage = () => {
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
            to="/tools/net-worth-calculator" 
            className="text-gray-600"
          >
            Net Worth Calculator
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
                Net Worth Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Track your financial health by calculating your total assets minus liabilities.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <NetWorthCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Understanding Net Worth</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Our net worth calculator helps you track your financial position by comparing 
                your total assets to your total liabilities, giving you a clear picture of your overall wealth.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">What to Include</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Assets</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cash and bank accounts</li>
                    <li>Investment accounts</li>
                    <li>Real estate value</li>
                    <li>Vehicle value</li>
                    <li>Other valuable possessions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Liabilities</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Mortgage balance</li>
                    <li>Car loans</li>
                    <li>Student loans</li>
                    <li>Credit card debt</li>
                    <li>Other outstanding debts</li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Tips for Improving Net Worth</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Pay down high-interest debt first</li>
                  <li>Build emergency savings</li>
                  <li>Invest for long-term growth</li>
                  <li>Track your net worth regularly</li>
                  <li>Focus on both reducing debt and growing assets</li>
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

export default NetWorthCalculatorPage;
