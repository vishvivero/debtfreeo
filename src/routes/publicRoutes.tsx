
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Index = lazy(() => import("@/pages/Index"));
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/components/blog/BlogPost"));
const Contact = lazy(() => import("@/pages/Contact"));
const FreeTools = lazy(() => import("@/pages/FreeTools"));
const Help = lazy(() => import("@/pages/Help"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Auth = lazy(() => import("@/pages/Auth"));

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/blog",
    element: <Blog />,
  },
  {
    path: "/blog/:slug",
    element: <BlogPost />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/tools",
    element: <FreeTools />,
  },
  {
    path: "/help",
    element: <Help />,
  },
  {
    path: "/faq",
    element: <FAQ />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
];
