
import { Route, Navigate } from "react-router-dom";
import Overview from "@/pages/Overview";
import DebtList from "@/pages/DebtList";
import { DebtDetailsPage } from "@/components/debt/DebtDetailsPage";
import Reports from "@/pages/Reports";
import Strategy from "@/pages/Strategy";
import Track from "@/pages/Track";
import Profile from "@/pages/Profile";
import MyPlan from "@/pages/MyPlan";
import Help from "@/pages/Help";
import ResultsHistory from "@/pages/ResultsHistory";

export const protectedRoutes = [
  <Route key="/overview" path="/overview" element={<Overview />} />,
  <Route 
    key="/overview/code" 
    path="/overview/:code" 
    element={<Navigate to="/overview" replace />} 
  />,
  <Route key="/overview/debts" path="/overview/debts" element={<DebtList />} />,
  <Route key="/overview/debt" path="/overview/debt/:debtId" element={<DebtDetailsPage />} />,
  <Route key="/overview/reports" path="/overview/reports" element={<Reports />} />,
  <Route key="/strategy" path="/strategy" element={<Strategy />} />,
  <Route key="/results-history" path="/results-history" element={<ResultsHistory />} />,
  <Route key="/track" path="/track" element={<Track />} />,
  <Route key="/profile" path="/profile" element={<Profile />} />,
  <Route key="/my-plan" path="/my-plan" element={<MyPlan />} />,
  <Route key="/help" path="/help" element={<Help />} />
];
