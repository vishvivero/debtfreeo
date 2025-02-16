
import { AmortizationCalculator } from "@/components/tools/AmortizationCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AmortizationCalculatorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
                Loan Amortization Schedule Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Calculate your loan payments and view a detailed amortization schedule.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <AmortizationCalculator />
            </div>

            {/* Detailed SEO Content Section */}
            <motion.section 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-16 prose prose-gray max-w-none"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Understanding Loan Amortization Schedules
              </h2>
              
              <div className="mt-6 space-y-6 text-gray-600">
                <p>
                  A loan amortization schedule is a complete table of periodic loan payments, showing the amount of principal and interest that comprise each payment until the loan is paid off at the end of its term. Our amortization calculator helps you understand exactly how your loan payments are applied to principal and interest over time.
                </p>

                <h3 className="text-xl font-semibold text-gray-900">How This Calculator Helps You</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>View a month-by-month breakdown of your loan payments</li>
                  <li>Understand how much of each payment goes to principal vs. interest</li>
                  <li>See your loan balance at any point during the repayment period</li>
                  <li>Calculate the total interest you'll pay over the life of the loan</li>
                  <li>Plan your debt repayment strategy more effectively</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900">Common Uses</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Mortgage loan analysis and planning</li>
                  <li>Personal loan repayment scheduling</li>
                  <li>Auto loan comparison and understanding</li>
                  <li>Student loan repayment planning</li>
                  <li>Business loan analysis</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900">Related Financial Tools</h3>
                <div className="space-y-4">
                  <p>
                    To make better financial decisions, consider using our other calculators:
                  </p>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        to="/tools/loan-interest-payment-calculator" 
                        className="text-primary hover:underline"
                      >
                        Interest Payment Calculator
                      </Link>
                      {" "}- Compare different interest rates and their impact
                    </li>
                    <li>
                      <Link 
                        to="/tools/compare-loan-rates-and-terms-calculator" 
                        className="text-primary hover:underline"
                      >
                        Loan Comparison Calculator
                      </Link>
                      {" "}- Compare different loan options side by side
                    </li>
                    <li>
                      <Link 
                        to="/tools/debt-consolidation-savings-calculator" 
                        className="text-primary hover:underline"
                      >
                        Debt Consolidation Calculator
                      </Link>
                      {" "}- See if consolidating your loans could save you money
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900">Tips for Using This Calculator</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Enter the exact loan amount you're considering</li>
                  <li>Use the annual interest rate (APR) from your loan offer</li>
                  <li>Input the total loan term in years</li>
                  <li>Consider additional payments to see their impact on your loan</li>
                  <li>Compare different scenarios by adjusting the inputs</li>
                </ul>

                <div className="bg-blue-50 p-6 rounded-lg mt-8">
                  <h3 className="text-xl font-semibold text-blue-900">Why Use Our Calculator?</h3>
                  <ul className="mt-4 space-y-2 text-blue-800">
                    <li>✓ Free to use with no registration required</li>
                    <li>✓ Instant calculations and updated results</li>
                    <li>✓ Mobile-friendly and easy to use</li>
                    <li>✓ Detailed, printable amortization schedules</li>
                    <li>✓ Accurate calculations based on industry standards</li>
                  </ul>
                </div>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>

      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">About</h4>
              <p className="text-gray-600">
                Calculate loan amortization schedules and understand your payments.
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

export default AmortizationCalculatorPage;
