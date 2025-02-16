
import { SavingsGoalCalculator } from "@/components/tools/SavingsGoalCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const SavingsGoalCalculatorPage = () => {
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
            to="/tools/savings-goal-planner-calculator" 
            className="text-gray-600"
          >
            Savings Goal Calculator
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
                Savings Goal Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Plan and track your progress towards savings goals.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <SavingsGoalCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Achieving Your Savings Goals</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Whether you're saving for a home down payment, a dream vacation, or retirement, this calculator helps you create a clear path to reach your financial goals by determining how much you need to save monthly.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Features</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Calculate monthly savings requirements</li>
                <li>Account for interest earnings</li>
                <li>Adjust for inflation</li>
                <li>Track progress milestones</li>
                <li>Compare different scenarios</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Planning Components</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Target savings amount</li>
                <li>Time horizon</li>
                <li>Current savings</li>
                <li>Expected return rate</li>
                <li>Regular contribution schedule</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Goal Setting Strategies</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Break down large goals into milestones</li>
                <li>Account for life changes</li>
                <li>Consider multiple savings vehicles</li>
                <li>Plan for unexpected delays</li>
                <li>Review and adjust regularly</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Success Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Automate your savings</li>
                  <li>Use high-yield savings accounts</li>
                  <li>Track your progress monthly</li>
                  <li>Celebrate reaching milestones</li>
                  <li>Adjust goals as circumstances change</li>
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
                Plan your savings goals and track your progress effectively.
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

export default SavingsGoalCalculatorPage;
