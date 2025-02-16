
import { InvestmentCalculator } from "@/components/tools/InvestmentCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, TrendingUp } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const InvestmentCalculatorPage = () => {
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
            to="/tools/investment-growth-calculator" 
            className="text-gray-600"
          >
            Investment Calculator
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
                Investment Growth Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Calculate potential investment growth over time with compound interest.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <InvestmentCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Understanding Investment Growth</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Our investment calculator helps you visualize the potential growth of your investments over time, 
                taking into account initial investment, regular contributions, and compound interest.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Features</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Calculate total investment value over time</li>
                <li>See breakdown of contributions vs. earnings</li>
                <li>Adjust for different rates of return</li>
                <li>Plan regular monthly contributions</li>
                <li>Visualize the power of compound interest</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Investment Considerations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Starting amount (initial investment)</li>
                <li>Regular contribution amount</li>
                <li>Expected rate of return</li>
                <li>Investment timeframe</li>
                <li>Impact of compound interest</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Investment Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Start investing early to maximize compound interest</li>
                  <li>Consider your risk tolerance when selecting investments</li>
                  <li>Diversify your investment portfolio</li>
                  <li>Review and rebalance your investments regularly</li>
                  <li>Account for inflation in your long-term planning</li>
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

export default InvestmentCalculatorPage;
