import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MerchantDashboard from "./pages/MerchantDashboard";
import MerchantLogin from "./pages/MerchantLogin";
import MerchantSignup from "./pages/MerchantSignup";
import MerchantTransactions from "./pages/MerchantTransactions";
import MerchantPayouts from "./pages/MerchantPayouts";
import MerchantSettings from "./pages/MerchantSettings";
import Checkout from "./pages/Checkout";
import MerchantPaymentLinks from "./pages/MerchantPaymentLinks";
import MerchantKyc from "./pages/MerchantKyc";
import { validateSession, getSessionCookie } from "./lib/session";

const queryClient = new QueryClient();

const RequireMerchantAuth = ({
  children,
  requireKyc = false,
}: {
  children: JSX.Element;
  requireKyc?: boolean;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasSession] = useState(() => Boolean(getSessionCookie()));

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!hasSession) {
        // No session cookie - redirect immediately
        if (isMounted && location.pathname !== "/merchant/login") {
          navigate("/merchant/login", { replace: true });
        }
        return;
      }

      // We have a session cookie - validate it asynchronously in background
      try {
        const session = await validateSession();
        if (!session && isMounted && location.pathname !== "/merchant/login") {
          // Session is invalid - redirect
          navigate("/merchant/login", { replace: true });
        }
      } catch (error) {
        // Session validation failed - redirect
        if (isMounted && location.pathname !== "/merchant/login") {
          navigate("/merchant/login", { replace: true });
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [hasSession, navigate, location.pathname]);

  // Render children immediately if we have a session on mount
  // Validation happens in background and will redirect if needed
  if (!hasSession) {
    return null;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/merchant/login" element={<MerchantLogin />} />
          <Route path="/merchant/signup" element={<MerchantSignup />} />
          <Route
            path="/merchant"
            element={<Navigate to="/merchant/dashboard" replace />}
          />
          <Route
            path="/merchant/dashboard"
            element={
              <RequireMerchantAuth requireKyc>
                <MerchantDashboard />
              </RequireMerchantAuth>
            }
          />
          <Route
            path="/merchant/transactions"
            element={
              <RequireMerchantAuth requireKyc>
                <MerchantTransactions />
              </RequireMerchantAuth>
            }
          />
          <Route
            path="/merchant/payment-links"
            element={
              <RequireMerchantAuth requireKyc>
                <MerchantPaymentLinks />
              </RequireMerchantAuth>
            }
          />
          <Route
            path="/merchant/payouts"
            element={
              <RequireMerchantAuth requireKyc>
                <MerchantPayouts />
              </RequireMerchantAuth>
            }
          />
          <Route
            path="/merchant/settings"
            element={
              <RequireMerchantAuth requireKyc>
                <MerchantSettings />
              </RequireMerchantAuth>
            }
          />
          <Route
            path="/merchant/kyc"
            element={
              <RequireMerchantAuth>
                <MerchantKyc />
              </RequireMerchantAuth>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
