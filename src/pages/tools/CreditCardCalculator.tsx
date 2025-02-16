
import { CreditCardCalculator } from "@/components/tools/CreditCardCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const CreditCardCalculatorPage = () => {
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
            to="/tools/credit-card-debt-payoff-calculator" 
            className="text-gray-600"
          >
            Credit Card Payoff Calculator
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
                Credit Card Payoff Calculator
              </h1>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 text-lg">
                  Plan your credit card debt payoff strategy and see exactly when you'll be debt-free.
                </p>
                <h2 className="text-2xl font-semibold text-gray-800 mt-6">Take Control of Your Credit Card Debt</h2>
                <p className="text-gray-600">
                  Our credit card payoff calculator helps you create a clear path to becoming debt-free. Understand how different payment strategies affect your payoff timeline and total interest paid.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">Calculator Features:</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Calculate your debt-free date</li>
                  <li>See total interest savings with increased payments</li>
                  <li>Compare different payment strategies</li>
                  <li>Understand the impact of interest rates</li>
                  <li>Create a realistic payoff plan</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">Benefits of Having a Payoff Plan</h3>
                <p className="text-gray-600">
                  Using this calculator helps you:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Set realistic debt payoff goals</li>
                  <li>Minimize interest charges</li>
                  <li>Stay motivated with a clear timeline</li>
                  <li>Make informed decisions about your payments</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <CreditCardCalculator />
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
                Calculate your credit card payoff timeline and total interest costs.
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

export default CreditCardCalculatorPage;
