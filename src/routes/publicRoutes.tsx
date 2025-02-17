
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
import InvestmentCalculatorPage from "@/pages/tools/InvestmentCalculator";
import MortgageCalculatorPage from "@/pages/tools/MortgageCalculator";
import StudentLoanCalculatorPage from "@/pages/tools/StudentLoanCalculator";
import NetWorthCalculatorPage from "@/pages/tools/NetWorthCalculator";
import LifeInsuranceCalculatorPage from "@/pages/tools/LifeInsuranceCalculator";
import DownPaymentCalculatorPage from "@/pages/tools/DownPaymentCalculator";
import CollegeSavingsCalculatorPage from "@/pages/tools/CollegeSavingsCalculator";
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
  <Route key="/tools/loan-amortization-schedule-calculator" path="/tools/loan-amortization-schedule-calculator" element={<Layout><AmortizationCalculatorPage /></Layout>} />,
  <Route key="/tools/loan-interest-payment-calculator" path="/tools/loan-interest-payment-calculator" element={<Layout><InterestCalculatorPage /></Layout>} />,
  <Route key="/tools/compare-loan-rates-and-terms-calculator" path="/tools/compare-loan-rates-and-terms-calculator" element={<Layout><LoanComparisonCalculatorPage /></Layout>} />,
  <Route key="/tools/debt-to-income-ratio-calculator" path="/tools/debt-to-income-ratio-calculator" element={<Layout><DebtToIncomeCalculatorPage /></Layout>} />,
  <Route key="/tools/credit-card-debt-payoff-calculator" path="/tools/credit-card-debt-payoff-calculator" element={<Layout><CreditCardCalculatorPage /></Layout>} />,
  <Route key="/tools/debt-consolidation-savings-calculator" path="/tools/debt-consolidation-savings-calculator" element={<Layout><DebtConsolidationCalculatorPage /></Layout>} />,
  <Route key="/tools/emergency-fund-savings-calculator" path="/tools/emergency-fund-savings-calculator" element={<Layout><EmergencyFundCalculatorPage /></Layout>} />,
  <Route key="/tools/savings-goal-planner-calculator" path="/tools/savings-goal-planner-calculator" element={<Layout><SavingsGoalCalculatorPage /></Layout>} />,
  <Route key="/tools/personal-budget-planner-calculator" path="/tools/personal-budget-planner-calculator" element={<Layout><BudgetCalculatorPage /></Layout>} />,
  <Route key="/tools/investment-growth-calculator" path="/tools/investment-growth-calculator" element={<Layout><InvestmentCalculatorPage /></Layout>} />,
  <Route key="/tools/mortgage-payment-calculator" path="/tools/mortgage-payment-calculator" element={<Layout><MortgageCalculatorPage /></Layout>} />,
  <Route key="/tools/student-loan-calculator" path="/tools/student-loan-calculator" element={<Layout><StudentLoanCalculatorPage /></Layout>} />,
  <Route key="/tools/net-worth-calculator" path="/tools/net-worth-calculator" element={<Layout><NetWorthCalculatorPage /></Layout>} />,
  <Route key="/tools/term-life-insurance-calculator" path="/tools/term-life-insurance-calculator" element={<Layout><LifeInsuranceCalculatorPage /></Layout>} />,
  <Route key="/tools/down-payment-savings-calculator" path="/tools/down-payment-savings-calculator" element={<Layout><DownPaymentCalculatorPage /></Layout>} />,
  <Route key="/tools/college-savings-calculator" path="/tools/college-savings-calculator" element={<Layout><CollegeSavingsCalculatorPage /></Layout>} />,
  <Route key="/faq" path="/faq" element={<Layout><FAQ /></Layout>} />,
  <Route key="/privacy" path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />,
  <Route key="/terms" path="/terms" element={<Layout><TermsOfService /></Layout>} />,
  <Route key="/dpa" path="/dpa" element={<Layout><DataProcessingAgreement /></Layout>} />,
  <Route key="/cookie-policy" path="/cookie-policy" element={<Layout><CookiePolicy /></Layout>} />,
  <Route key="/gdpr" path="/gdpr" element={<Layout><GDPRCompliance /></Layout>} />
];
