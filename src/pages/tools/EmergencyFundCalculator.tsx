
import { EmergencyFundCalculator } from "@/components/tools/EmergencyFundCalculator";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const EmergencyFundCalculatorPage = () => {
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
            to="/tools/emergency-fund-savings-calculator" 
            className="text-gray-600"
          >
            Emergency Fund Calculator
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
                Emergency Fund Calculator
              </h1>
              <p className="text-gray-600 text-lg">
                Calculate how much you should save for emergencies.
              </p>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
              <EmergencyFundCalculator />
            </div>

            <div className="mt-12 prose prose-gray max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800">Building Your Emergency Fund</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6">Why Emergency Funds Matter</h3>
              <p>
                An emergency fund is your financial safety net, providing peace of mind and security during unexpected situations.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Recommended Fund Size</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>3-6 months of essential expenses</li>
                <li>Additional savings for variable income</li>
                <li>Coverage for insurance deductibles</li>
                <li>Allowance for unexpected repairs</li>
                <li>Buffer for medical emergencies</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">Building Your Fund</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Start with a realistic monthly savings goal</li>
                <li>Automate your savings</li>
                <li>Keep funds easily accessible</li>
                <li>Consider high-yield savings accounts</li>
                <li>Review and adjust regularly</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6">When to Use Your Fund</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Job loss or income reduction</li>
                <li>Medical emergencies</li>
                <li>Essential home repairs</li>
                <li>Vehicle repairs</li>
                <li>Unexpected travel needs</li>
              </ul>

              <div className="bg-primary/5 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-semibold text-gray-800">Fund Maintenance Tips</h3>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Regularly review your expenses</li>
                  <li>Update savings goals as needed</li>
                  <li>Replenish after withdrawals</li>
                  <li>Keep separate from other savings</li>
                  <li>Monitor account interest rates</li>
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

export default EmergencyFundCalculatorPage;
