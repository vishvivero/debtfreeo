
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
            <div className="space-y-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
                Debt Consolidation Calculator
              </h1>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 text-lg">
                  Evaluate whether debt consolidation could help you save money and simplify your payments.
                </p>
                <h2 className="text-2xl font-semibold text-gray-800 mt-6">Is Debt Consolidation Right for You?</h2>
                <p className="text-gray-600">
                  Our debt consolidation calculator helps you determine if consolidating your debts could lead to savings and simpler debt management. Compare your current situation with potential consolidation options.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">What This Calculator Shows You:</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Potential monthly payment savings</li>
                  <li>Total interest savings over the loan term</li>
                  <li>New single monthly payment amount</li>
                  <li>Time to become debt-free</li>
                  <li>Comparison of current vs. consolidated payments</li>
                </ul>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">Benefits of Debt Consolidation</h3>
                <p className="text-gray-600">
                  Use this calculator to understand if consolidation could help you:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Lower your monthly payments</li>
                  <li>Reduce total interest costs</li>
                  <li>Simplify debt management</li>
                  <li>Pay off debt faster</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <DebtConsolidationCalculator />
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
                Evaluate debt consolidation options and calculate potential savings.
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
