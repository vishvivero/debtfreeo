
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { publicRoutes } from "@/routes/publicRoutes";
import { protectedRoutes } from "@/routes/protectedRoutes";
import { adminRoutes } from "@/routes/adminRoutes";
import { useScrollTop } from "./hooks/use-scroll-top";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          <BrowserRouter basename="/">
            <ScrollToTop />
            <Routes>
              {publicRoutes}
              {protectedRoutes}
              {adminRoutes}
            </Routes>
            <Toaster />
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Separate component to use the hook
function ScrollToTop() {
  useScrollTop();
  return null;
}

export default App;
