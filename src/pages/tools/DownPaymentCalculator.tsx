
import { DownPaymentCalculator } from "@/components/tools/DownPaymentCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const DownPaymentCalculatorPage = () => {
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
            to="/tools/down-payment-savings-calculator" 
            className="text-gray-600"
          >
            Down Payment Calculator
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
                Down Payment Savings Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Plan your savings strategy to reach your home down payment goal.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <DownPaymentCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Planning Your Down Payment</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Our down payment calculator helps you determine how much you need to save and how long 
                it will take to reach your down payment goal based on your current savings plan.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Considerations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Different loan types require different down payments</li>
                <li>Impact of PMI on monthly payments</li>
                <li>Savings strategies and timelines</li>
                <li>Additional homebuying costs</li>
                <li>Investment options for your savings</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Down Payment Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Save at least 20% to avoid PMI</li>
                  <li>Consider down payment assistance programs</li>
                  <li>Keep savings in a high-yield account</li>
                  <li>Factor in closing costs</li>
                  <li>Maintain an emergency fund separate from down payment savings</li>
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

export default DownPaymentCalculatorPage;
