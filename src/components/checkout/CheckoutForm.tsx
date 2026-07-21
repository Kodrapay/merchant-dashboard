import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CreditCard, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface CheckoutFormProps {
  initialAmount?: number;
  currency: string;
  merchantName: string;
  description?: string;
  allowCustomAmount?: boolean;
  reference?: number | null; // Changed to number
  merchantId?: number | null; // Changed to number
}

// Declare Cardinal on window
declare global {
  interface Window {
    Cardinal: any;
  }
}

export function CheckoutForm({
  initialAmount,
  currency,
  merchantName,
  description,
  allowCustomAmount = false,
  reference,
  merchantId,
}: CheckoutFormProps) {
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState<number>(initialAmount ?? 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [resultState, setResultState] = useState<"idle" | "success" | "failure">("idle");
  
  // 3DS State
  const [pendingAuthId, setPendingAuthId] = useState<string>("");

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  // Initialize Cardinal SDK
  useEffect(() => {
    if (window.Cardinal) {
      window.Cardinal.configure({
        logging: {
            level: 'on'
        }
      });
      
      window.Cardinal.on("payments.setupComplete", function(data: any) {
        console.log("Cardinal setup complete", data);
      });

      window.Cardinal.on("payments.validated", function(data: any, jwt: string) {
        console.log("Cardinal validation result", data);
        handle3DSResult(data);
      });
    }
  }, [pendingAuthId]); // Re-bind if auth ID changes? Actually no need, but access to pendingAuthId inside callback might need ref or simple state

  // Handle callback from Cardinal
  const handle3DSResult = async (data: any) => {
    // ActionCode: SUCCESS, NOACTION, FAILURE, ERROR
    if (data.ActionCode === "SUCCESS" || data.ActionCode === "NOACTION") {
      // Proceed to complete payment
      if (pendingAuthId) {
        const paRes = data?.Payment?.ExtendedData?.PARes || data?.Payment?.ExtendedData?.pares || "";
        await submitPayment(pendingAuthId, paRes);
      } else {
        // Fallback if state usage in callback is tricky (use reference from flow)
        console.error("Missing pendingAuthId in callback");
        setResultState("failure");
        setStep("success");
      }
    } else {
       setIsProcessing(false);
       setResultState("failure");
       setStep("success");
       toast({
         title: "Authentication Failed",
         description: data.ErrorDescription || "Your bank declined the authentication.",
         variant: "destructive",
       });
    }
  };

  const handlePayment = async () => {
    await submitPayment();
  };

  const submitPayment = async (authenticationId?: string, paRes?: string) => {
    if (merchantId === undefined || merchantId === null) {
      toast({
        title: "Missing merchant",
        description: "This payment link is incomplete.",
        variant: "destructive",
      });
      setResultState("failure");
      setStep("success");
      return;
    }

    setIsProcessing(true);
    
    // Parse expiry
    const [expMonth, expYear] = expiry.split("/");
    const fullExpYear = expYear ? "20" + expYear : "";

    let transactionSucceeded = true;
    try {
      const payload: any = {
        payment_link_id: reference,
        amount: Number(amount.toFixed(2)),
        currency,
        customer_email: email,
        merchant_id: merchantId,
        description: description || "Checkout payment",
        payment_method: "card",
        // Card data (only if not authenticating existing one)
        card_number: cardNumber.replace(/\s+/g, ""),
        expiry_month: expMonth,
        expiry_year: fullExpYear,
        cvv: cvv,
      };

      if (authenticationId) {
        payload.authentication_id = authenticationId;
        if (paRes) {
          payload.pares = paRes;
        }
      }

      const response = await fetch(`${API_BASE_URL}/checkout/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (!response.ok) {
        transactionSucceeded = false;
        // Check for specific error messages or failures
        toast({
            title: "Payment Failed",
            description: data.details || data.error || "Transaction could not be processed.",
            variant: "destructive"
        });
      } else {
        // Check for 3DS requirement
        if (data.status === "pending_authentication") {
            setPendingAuthId(data.authentication_id);
            
            // Trigger Cardinal Challenge
            if (window.Cardinal) {
                window.Cardinal.continue('cca', {
                    "AcsUrl": data.challenge_url,
                    "Payload": data.pareq
                }, {
                    "OrderDetails": {
                        "TransactionId": data.authentication_id
                    }
                });
                return; // Stop here, wait for callback
            } else {
                console.error("Cardinal SDK not loaded");
                transactionSucceeded = false;
            }
        } else {
            // Success or plain failure
            transactionSucceeded = data.status === "paid" || data.status === "successful";
        }
      }
    } catch (e) {
      console.error(e);
      transactionSucceeded = false;
    }

    if (transactionSucceeded) {
        setIsProcessing(false);
        setResultState("success");
        setStep("success");
    } else if (!pendingAuthId) {
        // Only show failure if we didn't just start 3DS
        setIsProcessing(false);
        setResultState("failure");
        setStep("success");
    }
  };

  // Auto-close window after showing result
  useEffect(() => {
    if (step !== "success" && resultState !== "failure") return;
    const timer = setTimeout(() => {
      // Try to close the window; if disallowed, fall back to a redirect so the user isn't stuck
      window.close();
      if (typeof window !== "undefined") {
        window.open("", "_self");
        window.close();
      }
      // Fallback redirect if the browser blocks window.close
      window.location.href = "/merchant/payment-links";
    }, 2500);
    return () => clearTimeout(timer);
  }, [step, resultState]);

  if (step === "success") {
    if (resultState === "failure") {
      return (
        <div className="text-center py-8 animate-slide-up">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Transaction Failed</h2>
          <p className="text-muted-foreground mb-6">
            Unable to process your payment of {formatAmount(amount, currency)}.
          </p>
          <p className="text-sm text-muted-foreground">
            Please try again or contact support if the issue persists.
          </p>
          <p className="text-xs text-muted-foreground mt-4">This window will close automatically.</p>
        </div>
      );
    }

    return (
      <div className="text-center py-8 animate-slide-up">
        <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground mb-6">
          Your payment of {formatAmount(amount, currency)} has been processed.
        </p>
        <p className="text-sm text-muted-foreground">
          A receipt has been sent to {email}
        </p>
        <p className="text-xs text-muted-foreground mt-4">This window will close automatically.</p>
      </div>
    );
  }

  const feePercentage = 0.015;
  const fixedFee = currency === "NGN" ? 100 : 0;
  const feeCap = currency === "NGN" ? 2000 : Infinity;
  const platformFee = Math.min(Math.round(amount * feePercentage + fixedFee), feeCap);
  const netToMerchant = Math.max(amount - platformFee, 0);
  const amountValid = amount > 0 && Number.isFinite(amount);

  return (
    <div className="space-y-6">
      {/* Amount Display */}
      <div className="text-center pb-6 border-b border-border">
        <p className="text-sm text-muted-foreground mb-1">Pay {merchantName}</p>
        <p className="text-4xl font-bold text-foreground">
          {amountValid ? formatAmount(amount, currency) : "Enter amount"}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
        {reference && (
          <p className="text-xs text-muted-foreground mt-1">Link reference: {reference}</p>
        )}
      </div>

      {step === "details" && (
        <div className="space-y-4 animate-fade-in">
          {allowCustomAmount && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={amount ? String(amount) : ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount to pay"
                className="h-12"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={() => setStep("payment")}
            disabled={!email || (allowCustomAmount && !amountValid)}
          >
            Continue to Payment
          </Button>
        </div>
      )}

      {step === "payment" && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="card">Card Number</Label>
            <div className="relative">
              <Input
                id="card"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="h-12 pl-12"
              />
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                className="h-12"
              />
            </div>
          </div>

          <Button
            className="w-full"
            variant="hero"
            size="lg"
            onClick={handlePayment}
            disabled={!cardNumber || !expiry || !cvv || isProcessing || !amountValid || (merchantId === undefined || merchantId === null)} // Updated condition here
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Processing...
              </span>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay {formatAmount(amount, currency)}
              </>
            )}
          </Button>

          <button
            onClick={() => setStep("details")}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to details
          </button>
        </div>
      )}

      {/* Pricing model */}
      <div className="rounded-lg border border-border p-4 bg-secondary/30 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Platform fee (1.5% + ₦100, capped at ₦2000)</span>
          <span className="font-semibold">{amountValid ? formatAmount(platformFee, currency) : "-"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount to merchant</span>
          <span className="font-semibold">
            {amountValid ? formatAmount(netToMerchant, currency) : "-"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Fees are illustrative for this demo. The platform collects the fee per successful transaction.
        </p>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
        <Shield className="h-4 w-4 text-success" />
        <span className="text-xs text-muted-foreground">
          Secured by KodraPay • 256-bit SSL encryption
        </span>
      </div>
    </div>
  );
}
