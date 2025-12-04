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

const queryClient = new QueryClient();

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
          <Route path="/dashboard" element={<MerchantDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/merchant/checkout" element={<Checkout />} />
          {/* Merchant routes */}
          <Route path="/merchant" element={<MerchantDashboard />} />
          <Route
            path="/merchant/transactions"
            element={<MerchantTransactions />}
          />
          <Route
            path="/merchant/payment-links"
            element={<MerchantPaymentLinks />}
          />
          <Route path="/merchant/payouts" element={<MerchantPayouts />} />
          <Route path="/merchant/settings" element={<MerchantSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
