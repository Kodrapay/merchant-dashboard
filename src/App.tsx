import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { getMerchantUser } from "./lib/merchant-user";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const RequireMerchantAuth = ({
  children,
  requireKyc = false,
}: {
  children: JSX.Element;
  requireKyc?: boolean;
}) => {
  const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("authToken"));
  const user = getMerchantUser();

  if (!hasToken) {
    return <Navigate to="/merchant/login" replace />;
  }

  if (requireKyc && (!user || user.kycStatus !== "approved")) {
    return <Navigate to="/merchant/kyc" replace />;
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
            path="/dashboard"
            element={
              <RequireMerchantAuth requireKyc>
                <MerchantDashboard />
              </RequireMerchantAuth>
            }
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/merchant/checkout" element={<Checkout />} />
          {/* Merchant routes */}
          <Route
            path="/merchant"
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
