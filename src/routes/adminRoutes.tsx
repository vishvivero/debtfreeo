
import { Route } from "react-router-dom";
import Admin from "@/pages/Admin";
import { BulkUpload } from "@/pages/blog/BulkUpload";

export const adminRoutes = [
  <Route key="/admin" path="/admin/*" element={<Admin />} />,
  <Route key="/admin/bulk-upload" path="/admin/bulk-upload" element={<BulkUpload />} />
];
