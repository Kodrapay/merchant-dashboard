import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { setMerchantUser } from "@/lib/merchant-user";
import { API_BASE_URL } from "@/lib/api-client";

const pricingTiers = [
  {
    id: "starter",
    name: "Starter",
    price: "₦0/month",
    description: "Perfect for getting started",
    features: ["Card: 1.9% + ₦100", "Bank: 1.2% + ₦50", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "₦15,000/month",
    description: "Most popular",
    features: ["Card: 1.5% + ₦100", "Bank: 0.8% + ₦50", "Priority support", "Webhooks"],
    highlighted: true,
  },
];

export default function MerchantSignup() {
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTier, setSelectedTier] = useState("starter");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Create merchant in database
      const response = await fetch(`${API_BASE_URL}/merchants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: business || "New Merchant",
          email: email,
          business_name: business || "New Business",
          country: "NG",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create merchant");
      }

      const data = await response.json();

      // Register auth user tied to merchant
      const registerResp = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: business || "New Merchant",
          merchant_id: data.id,
        }),
      });

      if (!registerResp.ok) {
        const msg = await registerResp.text();
        // If email already exists, nudge to login instead of failing silently
        if (registerResp.status === 400 || registerResp.status === 409) {
          toast({
            title: "Account already exists",
            description: "Please log in with your credentials instead.",
            variant: "destructive",
          });
          navigate("/merchant/login");
          return;
        }
        throw new Error(msg || "Failed to register auth user");
      }
      const registerData = await registerResp.json();

      const token = registerData.access_token || registerData.token;
      if (token) {
        localStorage.setItem("authToken", token);
      }

      setMerchantUser({
        email,
        businessName: data.business_name || business || "New Business",
        merchantId: data.id,
        kycStatus: "not_started",
        hasDemoData: false,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Account created",
        description: "Welcome to KodraPay. Complete KYC to unlock your dashboard.",
      });
      navigate("/merchant/kyc");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Account creation form */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm uppercase text-muted-foreground tracking-wide">KodraPay</p>
                <h1 className="text-3xl font-bold text-foreground">Create merchant account</h1>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Start collecting payments with hosted checkout, payment links, payouts, and API access. Get set up in minutes.
            </p>

        <Card className="p-8 shadow-lg border-border bg-card">
          <div className="space-y-2 mb-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Get started</h2>
            <p className="text-sm text-muted-foreground">
              Create your merchant account to access the dashboard.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="business">Business name</Label>
              <Input
                id="business"
                placeholder="TechStore NG"
                value={business}
                onChange={(event) => setBusiness(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@business.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))}
              />
              I agree to the terms and privacy policy.
            </label>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting || !acceptTerms}
            >
              {isSubmitting ? "Creating account..." : `Create account with ${selectedTier === "growth" ? "Growth" : "Starter"}`}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <Link to="/merchant/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>

      {/* Right side - Pricing tier selection */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Choose your plan</h2>
          <p className="text-muted-foreground">
            Select the plan that best fits your business needs. You can upgrade or downgrade anytime.
          </p>
        </div>

        <div className="space-y-4">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`p-6 cursor-pointer transition-all ${
                selectedTier === tier.id
                  ? "border-primary shadow-lg ring-2 ring-primary"
                  : "border-border hover:border-primary/50 hover:shadow-md"
              } ${tier.highlighted ? "bg-primary/5" : ""}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                    {tier.highlighted && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary">{tier.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                </div>
                <div
                  className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    selectedTier === tier.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {selectedTier === tier.id && (
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Transaction fees:</p>
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-muted border-border">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Enterprise plan available</p>
              <p className="text-xs text-muted-foreground">
                Need custom pricing, dedicated support, or higher transaction volumes?{" "}
                <Link to="#" className="text-primary hover:underline">
                  Contact our sales team
                </Link>
              </p>
            </div>
          </div>
        </Card>

        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-muted-foreground">
            All plans include dashboard access, standard APIs, and email support. You'll start on the Starter plan by default.
            Upgrade to Growth anytime from your dashboard to get lower transaction fees and priority support.
          </p>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
