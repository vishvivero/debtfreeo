
import { DebtConsolidationCalculator } from "@/components/tools/DebtConsolidationCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const DebtConsolidationCalculatorPage = () => {
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
            to="/tools/debt-consolidation-savings-calculator" 
            className="text-gray-600"
          >
            Debt Consolidation Calculator
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
                Debt Consolidation Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Explore potential savings through debt consolidation.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <DebtConsolidationCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Understanding Debt Consolidation</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">What is Debt Consolidation?</h3>
              <p>
                Debt consolidation combines multiple debts into a single loan, often with a lower interest rate. This calculator helps you determine if consolidation could save you money and simplify your payments.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Benefits of Consolidation</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Single monthly payment</li>
                <li>Potentially lower interest rate</li>
                <li>Fixed repayment schedule</li>
                <li>Simplified debt management</li>
                <li>Possible credit score improvement</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">What to Consider</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Current interest rates</li>
                <li>Total debt amount</li>
                <li>Monthly payment affordability</li>
                <li>Loan terms and conditions</li>
                <li>Origination fees</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Calculator Features</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Compare multiple debts</li>
                <li>Calculate potential savings</li>
                <li>View consolidated payment options</li>
                <li>Analyze different scenarios</li>
                <li>Track total interest savings</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Best Practices</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>List all current debts accurately</li>
                  <li>Compare multiple consolidation offers</li>
                  <li>Consider both short and long-term impacts</li>
                  <li>Read all terms and conditions</li>
                  <li>Create a plan to avoid future debt</li>
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
                Calculate potential savings and benefits of debt consolidation.
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

export default DebtConsolidationCalculatorPage;
