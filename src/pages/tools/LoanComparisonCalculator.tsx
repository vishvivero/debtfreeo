
import { LoanComparisonCalculator } from "@/components/tools/LoanComparisonCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const LoanComparisonCalculatorPage = () => {
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
            to="/tools/compare-loan-rates-and-terms-calculator" 
            className="text-gray-600"
          >
            Loan Comparison Calculator
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
                Loan Comparison Calculator
              </h1>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 text-lg">
                  Compare different loan options side by side to find the best rates and terms for your financial needs.
                </p>
                <h2 className="text-2xl font-semibold text-gray-800 mt-6">How Our Loan Comparison Calculator Works</h2>
                <p className="text-gray-600">
                  Our loan comparison calculator helps you evaluate multiple loan offers simultaneously, making it easier to choose the best option for your financial situation. Compare interest rates, terms, and total costs to make an informed decision.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">Key Features:</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Compare up to three different loans side by side</li>
                  <li>Calculate total interest paid for each loan option</li>
                  <li>View monthly payment differences</li>
                  <li>Analyze total cost of borrowing</li>
                  <li>See loan amortization schedules</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">Benefits of Comparing Loans</h3>
                <p className="text-gray-600">
                  Making an informed decision about your loan can save you thousands of pounds over the loan term. This calculator helps you:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Find the most cost-effective loan option</li>
                  <li>Understand the impact of different interest rates</li>
                  <li>Compare monthly payment obligations</li>
                  <li>Evaluate loans with different terms</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <LoanComparisonCalculator />
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
                Compare loan options and make informed financial decisions.
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

export default LoanComparisonCalculatorPage;
