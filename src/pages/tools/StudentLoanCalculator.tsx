
import { StudentLoanCalculator } from "@/components/tools/StudentLoanCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, GraduationCap } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const StudentLoanCalculatorPage = () => {
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
            to="/tools/student-loan-calculator" 
            className="text-gray-600"
          >
            Student Loan Calculator
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
                Student Loan Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Plan your student loan repayment and understand the total cost of your education financing.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <StudentLoanCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Understanding Student Loans</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">How This Calculator Helps</h3>
              <p>
                Our student loan calculator helps you estimate monthly payments and understand 
                the total cost of your education loans, including interest over the entire loan term.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Key Components</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Principal loan amount</li>
                <li>Interest rate variations</li>
                <li>Loan term options</li>
                <li>Monthly payment estimates</li>
                <li>Total cost analysis</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Important Considerations</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Federal vs. private loan options</li>
                <li>Impact of interest rates</li>
                <li>Repayment plan choices</li>
                <li>Grace period details</li>
                <li>Loan forgiveness possibilities</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Student Loan Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Consider federal loans before private loans</li>
                  <li>Understand income-driven repayment options</li>
                  <li>Look into loan forgiveness programs</li>
                  <li>Make payments during grace period if possible</li>
                  <li>Research employer tuition assistance programs</li>
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

export default StudentLoanCalculatorPage;
