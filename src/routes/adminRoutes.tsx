
import { lazy } from "react";
import { RouteObject } from "react-router-dom";

const Admin = lazy(() => import("@/pages/Admin"));

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin/*",
    element: <Admin />
  }
];
