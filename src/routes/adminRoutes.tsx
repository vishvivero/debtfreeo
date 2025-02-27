import { Route } from "react-router-dom";
import Admin from "@/pages/Admin";

export const adminRoutes = [
  <Route key="/admin" path="/admin/*" element={<Admin />} />
];