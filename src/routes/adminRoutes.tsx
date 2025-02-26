
import { Route } from "react-router-dom";
import Admin from "@/pages/Admin";
import { BulkUpload } from "@/pages/blog/BulkUpload";

export const adminRoutes = [
  <Route key="/admin" path="/admin" element={<Admin />}>
    <Route key="/admin/blogs" path="blogs" />
    <Route key="/admin/categories" path="categories" />
    <Route key="/admin/new-post" path="new-post" />
    <Route key="/admin/edit/:id" path="edit/:id" />
    <Route key="/admin/users" path="users" />
    <Route key="/admin/settings" path="settings" />
    <Route key="/admin/banner" path="banner" />
    <Route key="/admin/security" path="security" />
    <Route key="/admin/content" path="content" />
    <Route key="/admin/analytics" path="analytics" />
    <Route key="/admin/audit-logs" path="audit-logs" />
    <Route key="/admin/performance" path="performance" />
  </Route>,
  <Route key="/admin/bulk-upload" path="/admin/bulk-upload" element={<BulkUpload />} />
];
