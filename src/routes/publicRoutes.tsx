
import { Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
import Blog from "@/pages/Blog";
import BlogPost from "@/components/blog/BlogPost";
import FreeTools from "@/pages/FreeTools";
import FAQ from "@/pages/FAQ";
import PrivacyPolicy from "@/components/legal/PrivacyPolicy";
import TermsOfService from "@/components/legal/TermsOfService";
import DataProcessingAgreement from "@/components/legal/DataProcessingAgreement";
import CookiePolicy from "@/components/legal/CookiePolicy";
import GDPRCompliance from "@/components/legal/GDPRCompliance";
import AmortizationCalculatorPage from "@/pages/tools/AmortizationCalculator";
import InterestCalculatorPage from "@/pages/tools/InterestCalculator";
import LoanComparisonCalculatorPage from "@/pages/tools/LoanComparisonCalculator";
import DebtToIncomeCalculatorPage from "@/pages/tools/DebtToIncomeCalculator";
import CreditCardCalculatorPage from "@/pages/tools/CreditCardCalculator";
import DebtConsolidationCalculatorPage from "@/pages/tools/DebtConsolidationCalculator";
import EmergencyFundCalculatorPage from "@/pages/tools/EmergencyFundCalculator";
import SavingsGoalCalculatorPage from "@/pages/tools/SavingsGoalCalculator";
import BudgetCalculatorPage from "@/pages/tools/BudgetCalculator";
import SharedSignup from "@/pages/SharedSignup";

export const publicRoutes = [
  <Route key="/" path="/" element={<Layout><Index /></Layout>} />,
  <Route key="/about" path="/about" element={<Layout><About /></Layout>} />,
  <Route key="/contact" path="/contact" element={<Layout><Contact /></Layout>} />,
  <Route key="/pricing" path="/pricing" element={<Layout><Pricing /></Layout>} />,
  <Route key="/blog" path="/blog" element={<Layout><Blog /></Layout>} />,
  <Route key="/blog/post" path="/blog/post/:slug" element={<Layout><BlogPost /></Layout>} />,
  <Route key="/signup" path="/signup" element={<SharedSignup />} />,
  <Route key="/tools" path="/tools" element={<Layout><FreeTools /></Layout>} />,
  <Route key="/tools/amortization" path="/tools/amortization-calculator" element={<Layout><AmortizationCalculatorPage /></Layout>} />,
  <Route key="/tools/interest" path="/tools/interest-calculator" element={<Layout><InterestCalculatorPage /></Layout>} />,
  <Route key="/tools/loan-comparison" path="/tools/loan-comparison-calculator" element={<Layout><LoanComparisonCalculatorPage /></Layout>} />,
  <Route key="/tools/debt-to-income" path="/tools/debt-to-income-calculator" element={<Layout><DebtToIncomeCalculatorPage /></Layout>} />,
  <Route key="/tools/credit-card" path="/tools/credit-card-calculator" element={<Layout><CreditCardCalculatorPage /></Layout>} />,
  <Route key="/tools/debt-consolidation" path="/tools/debt-consolidation-calculator" element={<Layout><DebtConsolidationCalculatorPage /></Layout>} />,
  <Route key="/tools/emergency-fund" path="/tools/emergency-fund-calculator" element={<Layout><EmergencyFundCalculatorPage /></Layout>} />,
  <Route key="/tools/savings-goal" path="/tools/savings-goal-calculator" element={<Layout><SavingsGoalCalculatorPage /></Layout>} />,
  <Route key="/tools/budget" path="/tools/budget-calculator" element={<Layout><BudgetCalculatorPage /></Layout>} />,
  <Route key="/faq" path="/faq" element={<Layout><FAQ /></Layout>} />,
  <Route key="/privacy" path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />,
  <Route key="/terms" path="/terms" element={<Layout><TermsOfService /></Layout>} />,
  <Route key="/dpa" path="/dpa" element={<Layout><DataProcessingAgreement /></Layout>} />,
  <Route key="/cookie-policy" path="/cookie-policy" element={<Layout><CookiePolicy /></Layout>} />,
  <Route key="/gdpr" path="/gdpr" element={<Layout><GDPRCompliance /></Layout>} />
];
