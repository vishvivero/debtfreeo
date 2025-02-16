
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
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
                Interest Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Calculate interest payments and total costs for different types of loans.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <InterestCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Understanding Interest Calculations</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How Interest Works</h3>
              <p>
                Interest is the cost of borrowing money, expressed as a percentage of the loan amount. Our calculator helps you understand both simple and compound interest, showing you exactly how much you'll pay over time.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Why Calculate Interest?</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Understand the true cost of borrowing</li>
                <li>Compare different loan options effectively</li>
                <li>Plan your budget more accurately</li>
                <li>Make informed decisions about loans and investments</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Features of Our Calculator</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Calculate both simple and compound interest</li>
                <li>See interest accrual over different time periods</li>
                <li>Compare different interest rates</li>
                <li>Understand the impact of payment frequency</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Common Uses</h3>
              <p>Our interest calculator is particularly useful for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal loans</li>
                <li>Mortgage calculations</li>
                <li>Investment returns</li>
                <li>Student loan planning</li>
                <li>Business loan analysis</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Making Better Financial Decisions</h3>
              <p>
                Understanding interest calculations is crucial for making informed financial decisions. Use this calculator to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Compare different loan offers</li>
                <li>Plan your repayment strategy</li>
                <li>Understand the impact of interest rates on your finances</li>
                <li>Make informed decisions about refinancing</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Pro Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Always compare APR (Annual Percentage Rate) rather than just interest rates</li>
                  <li>Consider how different payment frequencies affect total interest paid</li>
                  <li>Remember that shorter loan terms usually mean less total interest paid</li>
                  <li>Factor in any additional fees when calculating the true cost of borrowing</li>
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
