
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
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
                Credit Card Payoff Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Plan your credit card debt payoff strategy and timeline.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <CreditCardCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Planning Your Credit Card Debt Freedom</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Our credit card payoff calculator helps you understand exactly how long it will take to become debt-free and shows you how different payment strategies can accelerate your journey to financial freedom.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Features</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Calculate your debt-free date</li>
                <li>View total interest savings</li>
                <li>Compare different payment strategies</li>
                <li>See monthly payment breakdowns</li>
                <li>Track payoff milestones</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Payment Strategies</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fixed monthly payments</li>
                <li>Accelerated payment plans</li>
                <li>Minimum payment consequences</li>
                <li>Extra payment impact</li>
                <li>Balance transfer scenarios</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Making the Most of Results</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create a realistic payment plan</li>
                <li>Identify potential savings</li>
                <li>Set achievable payoff goals</li>
                <li>Track your progress</li>
                <li>Adjust strategies as needed</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Smart Payoff Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Always pay more than the minimum when possible</li>
                  <li>Consider balance transfer opportunities</li>
                  <li>Avoid new credit card charges</li>
                  <li>Track your spending to find extra payment money</li>
                  <li>Celebrate each milestone towards debt freedom</li>
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
