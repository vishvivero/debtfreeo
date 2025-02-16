
import { lazy } from "react";
import { RouteObject } from "react-router-dom";

const Overview = lazy(() => import("@/pages/Overview"));
const DebtList = lazy(() => import("@/pages/DebtList"));
const DebtDetailsPage = lazy(() => import("@/components/debt/DebtDetailsPage"));
const Reports = lazy(() => import("@/pages/Reports"));
const Strategy = lazy(() => import("@/pages/Strategy"));
const Track = lazy(() => import("@/pages/Track"));
const Profile = lazy(() => import("@/pages/Profile"));
const MyPlan = lazy(() => import("@/pages/MyPlan"));
const Help = lazy(() => import("@/pages/Help"));

export const protectedRoutes: RouteObject[] = [
  {
    path: "/overview",
    element: <Overview />
  },
  {
    path: "/overview/code",
    element: <Overview />
  },
  {
    path: "/overview/debts",
    element: <DebtList />
  },
  {
    path: "/overview/debt/:debtId",
    element: <DebtDetailsPage />
  },
  {
    path: "/overview/reports",
    element: <Reports />
  },
  {
    path: "/strategy",
    element: <Strategy />
  },
  {
    path: "/track",
    element: <Track />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/my-plan",
    element: <MyPlan />
  },
  {
    path: "/help",
    element: <Help />
  }
];
