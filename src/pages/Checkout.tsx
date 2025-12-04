import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getMerchantUser } from "@/lib/merchant-user";

export default function Checkout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeMethods, setActiveMethods] = useState<string[]>(["card"]);
  const [selectedMethod, setSelectedMethod] = useState<string>("card");

  const amountParam = Number(searchParams.get("amount"));
  const currency = (searchParams.get("currency") || "NGN").toUpperCase();
  const description =
    searchParams.get("description") || "Premium Subscription - 1 Month";
  const merchantName = searchParams.get("merchant") || "TechStore NG";
  const reference = searchParams.get("ref");
  const merchantId = searchParams.get("merchant_id") || getMerchantUser()?.merchantId || null;
  const mode = (searchParams.get("mode") || "fixed").toLowerCase();
  const hasValidAmount = Number.isFinite(amountParam) && amountParam > 0;
  const allowCustomAmount = mode === "open" || !hasValidAmount;
  const initialAmount = hasValidAmount ? amountParam : allowCustomAmount ? undefined : 25000;

  useEffect(() => {
    const stored = localStorage.getItem("paymentOptions");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) {
          setActiveMethods(parsed);
          setSelectedMethod(parsed.includes("card") ? "card" : parsed[0]);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (location.pathname.startsWith("/merchant/checkout") && !reference) {
    return <Navigate to="/merchant/payment-links" replace />;
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">KodraPay</span>
          </Link>
          <span className="text-sm text-muted-foreground">Secure Checkout</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{currency}</Badge>
            <span>
              Paying {merchantName}
              {reference ? ` • Link ${reference}` : ""}
              {mode === "open" ? " • Customer sets amount" : ""}
            </span>
          </div>

          <Card className="p-4 mb-4">
            <p className="text-sm font-medium mb-2">Select payment method</p>
            <div className="flex gap-2 flex-wrap">
              {["card", "virtual_account", "ussd"].map((method) => {
                const labels: Record<string, string> = {
                  card: "Card",
                  virtual_account: "Virtual Account",
                  ussd: "USSD",
                };
                const disabled = !activeMethods.includes(method);
                return (
                  <Button
                    key={method}
                    variant={selectedMethod === method ? "default" : "outline"}
                    onClick={() => setSelectedMethod(method)}
                    disabled={disabled}
                  >
                    {labels[method]}
                    {disabled ? " (Coming soon)" : ""}
                  </Button>
                );
              })}
            </div>
          </Card>

          {selectedMethod === "card" ? (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8 animate-slide-up">
              <CheckoutForm
                initialAmount={initialAmount}
                currency={currency}
                merchantName={merchantName}
                description={description}
                allowCustomAmount={allowCustomAmount}
                reference={reference}
                merchantId={merchantId}
              />
            </div>
          ) : (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              {selectedMethod === "virtual_account" && "Virtual account payments are coming soon."}
              {selectedMethod === "ussd" && "USSD payments are coming soon."}
            </Card>
          )}

          {/* Test Card Info */}
          <div className="mt-6 p-4 bg-card rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground mb-2">Test Card Details</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Card Number</p>
                <p className="font-mono">4084 0841 1111 1111</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expiry</p>
                <p className="font-mono">12/28</p>
              </div>
              <div>
                <p className="text-muted-foreground">CVV</p>
                <p className="font-mono">408</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Powered by{" "}
          <Link to="/" className="text-primary hover:underline">
            KodraPay
          </Link>
        </div>
      </footer>
    </div>
  );
}
