import { BudgetCalculator } from "@/components/tools/BudgetCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const BudgetCalculatorPage = () => {
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
            to="/tools/personal-budget-planner-calculator" 
            className="text-gray-600"
          >
            Budget Calculator
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
                Budget Planning Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Create a personalized budget plan based on your income and expenses.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <BudgetCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Creating Your Personal Budget</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">Why Budget Planning Matters</h3>
              <p>
                A well-planned budget is the foundation of financial success. This calculator helps you create a realistic budget that balances your income with your expenses while working toward your financial goals.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Budget Categories</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Housing and utilities</li>
                <li>Transportation costs</li>
                <li>Food and groceries</li>
                <li>Healthcare expenses</li>
                <li>Savings and investments</li>
                <li>Entertainment and recreation</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Calculator Features</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Income analysis</li>
                <li>Expense categorization</li>
                <li>Savings recommendations</li>
                <li>Debt payment planning</li>
                <li>Custom category creation</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">The 50/30/20 Rule</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>50% for essential needs</li>
                <li>30% for wants and lifestyle</li>
                <li>20% for savings and debt repayment</li>
                <li>Adjust percentages based on goals</li>
                <li>Track spending in each category</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Budgeting Best Practices</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Track all expenses consistently</li>
                  <li>Review and adjust monthly</li>
                  <li>Plan for irregular expenses</li>
                  <li>Build in emergency savings</li>
                  <li>Set realistic spending limits</li>
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

export default BudgetCalculatorPage;
