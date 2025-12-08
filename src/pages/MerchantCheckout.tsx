import { FormEvent, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function MerchantCheckout() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");

  // Payment link params
  const [paymentLinkId, setPaymentLinkId] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"fixed" | "open">("fixed");

  // Customer details
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAmount, setCustomerAmount] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    const merchantIdParam = params.get("merchant_id");
    const amountParam = params.get("amount");
    const currencyParam = params.get("currency");
    const descParam = params.get("description");
    const modeParam = params.get("mode");

    if (refParam) setPaymentLinkId(refParam);
    if (merchantIdParam) setMerchantId(merchantIdParam);
    if (amountParam) setAmount(amountParam);
    if (currencyParam) setCurrency(currencyParam);
    if (descParam) setDescription(decodeURIComponent(descParam));
    if (modeParam) setMode(modeParam as "fixed" | "open");
  }, []);

  const formatAmount = (amt: string, curr: string) => {
    const num = Number(amt);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr || "NGN",
    }).format(num);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const finalAmount = mode === "open" ? Number(customerAmount) : Number(amount);

      if (!finalAmount || finalAmount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/checkout/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_link_id: Number(paymentLinkId) || 0,
          merchant_id: Number(merchantId) || 0,
          amount: finalAmount,
          currency,
          customer_email: customerEmail,
          customer_name: customerName,
          payment_method: "card",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Payment failed");
      }

      const data = await response.json();
      setTransactionRef(data.transaction_reference || data.reference);
      setSuccess(true);

      toast({
        title: "Payment successful!",
        description: `Transaction reference: ${data.transaction_reference || data.reference}`,
      });
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your payment has been processed successfully.
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Transaction Reference</p>
            <p className="font-mono text-sm font-semibold break-all">{transactionRef}</p>
          </div>
          <Button
            onClick={() => window.close()}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-sm text-muted-foreground">{description || "Secure checkout"}</p>
        </div>

        {mode === "fixed" && amount && (
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <p className="text-3xl font-bold">{formatAmount(amount, currency)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          {mode === "open" && (
            <div className="space-y-2">
              <Label htmlFor="customerAmount">Amount (NGN)</Label>
              <Input
                id="customerAmount"
                type="number"
                min="0.01"
                value={customerAmount}
                onChange={(e) => setCustomerAmount(e.target.value)}
                placeholder="25000"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter amount in NGN.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${mode === "fixed" ? formatAmount(amount, currency) : ""}`
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>Secure payment powered by KodraPay</p>
        </div>
      </Card>
    </div>
  );
}
