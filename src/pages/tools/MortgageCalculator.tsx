
import { MortgageCalculator } from "@/components/tools/MortgageCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const MortgageCalculatorPage = () => {
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
            to="/tools/mortgage-payment-calculator" 
            className="text-gray-600"
          >
            Mortgage Calculator
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
                Mortgage Payment Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Calculate your monthly mortgage payments and see the total cost of your home loan.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <MortgageCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Understanding Your Mortgage</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Our mortgage calculator helps you estimate your monthly mortgage payments and understand 
                the total cost of your home loan, including principal and interest over the entire loan term.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Components</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Principal loan amount</li>
                <li>Down payment requirements</li>
                <li>Interest rate impact</li>
                <li>Loan term options</li>
                <li>Monthly payment breakdown</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Important Considerations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Down payment size affects monthly payments</li>
                <li>Interest rates vary by lender and credit score</li>
                <li>Longer terms mean lower payments but more interest</li>
                <li>Additional costs like taxes and insurance</li>
                <li>Impact of extra payments</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Mortgage Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Save for a larger down payment to reduce monthly costs</li>
                  <li>Compare offers from multiple lenders</li>
                  <li>Consider making extra payments to reduce total interest</li>
                  <li>Keep your credit score high for better rates</li>
                  <li>Factor in all homeownership costs</li>
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

export default MortgageCalculatorPage;
