import { Calculator, LineChart, PiggyBank, Percent, CreditCard, Wallet, DollarSign, Target, BarChart3, Home, GraduationCap, Scale, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SharedFooter } from "@/components/layout/SharedFooter";

const FreeTools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleToolClick = (url: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(url);
  };

  const tools = [
    {
      title: "Amortisation Calculator",
      description: "Calculate your loan amortisation schedule with detailed monthly breakdowns.",
      icon: Calculator,
      url: "/tools/loan-amortization-schedule-calculator",
      category: "loans",
    },
    {
      title: "Interest Calculator",
      description: "Calculate interest payments and total costs for different types of loans.",
      icon: LineChart,
      url: "/tools/loan-interest-payment-calculator",
      category: "interest",
    },
    {
      title: "Loan Comparison Tool",
      description: "Compare different loan options to find the best rates and terms for you.",
      icon: PiggyBank,
      url: "/tools/compare-loan-rates-and-terms-calculator",
      category: "loans",
    },
    {
      title: "Debt-to-Income Calculator",
      description: "Calculate your debt-to-income ratio and understand your financial health.",
      icon: Percent,
      url: "/tools/debt-to-income-ratio-calculator",
      category: "debt",
      comingSoon: false,
    },
    {
      title: "Credit Card Payoff Calculator",
      description: "Plan your credit card debt payoff strategy and timeline.",
      icon: CreditCard,
      url: "/tools/credit-card-debt-payoff-calculator",
      category: "credit",
      comingSoon: false,
    },
    {
      title: "Debt Consolidation Calculator",
      description: "Compare debt consolidation options and potential savings.",
      icon: Wallet,
      url: "/tools/debt-consolidation-savings-calculator",
      category: "debt",
      comingSoon: false,
    },
    {
      title: "Emergency Fund Calculator",
      description: "Calculate how much you should save for emergencies.",
      icon: DollarSign,
      url: "/tools/emergency-fund-savings-calculator",
      category: "savings",
      comingSoon: false,
    },
    {
      title: "Savings Goal Calculator",
      description: "Plan and track your progress towards savings goals.",
      icon: Target,
      url: "/tools/savings-goal-planner-calculator",
      category: "savings",
      comingSoon: false,
    },
    {
      title: "Budget Planning Calculator",
      description: "Create a personalized budget plan based on your income and expenses.",
      icon: BarChart3,
      url: "/tools/personal-budget-planner-calculator",
      category: "budget",
      comingSoon: false,
    },
    {
      title: "Mortgage Calculator",
      description: "Calculate your monthly mortgage payments and total loan costs.",
      icon: Home,
      url: "/tools/mortgage-payment-calculator",
      category: "mortgage",
      comingSoon: false,
    },
    {
      title: "Student Loan Calculator",
      description: "Plan your student loan repayment and understand the total cost of your education.",
      icon: GraduationCap,
      url: "/tools/student-loan-calculator",
      category: "education",
      comingSoon: false,
    },
    {
      title: "Net Worth Calculator",
      description: "Calculate your total assets minus liabilities to track your financial health.",
      icon: Scale,
      url: "/tools/net-worth-calculator",
      category: "wealth",
      comingSoon: false,
    },
    {
      title: "Term Life Insurance Calculator",
      description: "Calculate your life insurance needs based on your financial situation.",
      icon: Shield,
      url: "/tools/term-life-insurance-calculator",
      category: "insurance",
      comingSoon: false,
    },
    {
      title: "Down Payment Calculator",
      description: "Plan your savings for a home down payment.",
      icon: Home,
      url: "/tools/down-payment-savings-calculator",
      category: "mortgage",
      comingSoon: false,
    },
    {
      title: "College Savings Calculator",
      description: "Plan for your children's education expenses.",
      icon: GraduationCap,
      url: "/tools/college-savings-calculator",
      category: "education",
      comingSoon: false,
    }
  ];

  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 w-full bg-gray-50">
        <div className="w-full container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Free Financial Tools</h1>
              <p className="text-lg text-gray-600 mb-8">
                Explore our collection of free tools to help you make better financial decisions.
              </p>
              <div className="max-w-md mx-auto">
                <Input
                  type="search"
                  placeholder="Search tools by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full mb-8"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    {tool.comingSoon ? (
                      <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                        Coming Soon
                      </span>
                    ) : (
                      <Button onClick={() => handleToolClick(tool.url)}>
                        Try Now
                      </Button>
                    )}
                    <span className="text-sm text-gray-500 capitalize">{tool.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <SharedFooter />
      <CookieConsent />
    </div>
  );
};

export default FreeTools;
