
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
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
                Loan Comparison Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Compare different loan options to find the best rates and terms for you.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <LoanComparisonCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Making Informed Loan Decisions</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">Why Compare Loans?</h3>
              <p>
                Different lenders offer varying terms, rates, and conditions. Our loan comparison calculator helps you analyze multiple loan options side by side to find the best deal for your financial situation.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">What to Compare</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interest rates and APR</li>
                <li>Monthly payments</li>
                <li>Total cost over the loan term</li>
                <li>Loan terms and conditions</li>
                <li>Additional fees and charges</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Features of Our Comparison Tool</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Side-by-side comparison of multiple loans</li>
                <li>Detailed breakdown of costs</li>
                <li>Monthly payment calculations</li>
                <li>Total interest paid analysis</li>
                <li>Amortization schedule comparison</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Types of Loans to Compare</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mortgages</li>
                <li>Personal loans</li>
                <li>Auto loans</li>
                <li>Business loans</li>
                <li>Student loans</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Comparison Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Always compare APR rather than just interest rates</li>
                  <li>Consider the total cost over the entire loan term</li>
                  <li>Look for hidden fees and charges</li>
                  <li>Check early repayment options and penalties</li>
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
                Compare different loan options and make informed decisions.
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
