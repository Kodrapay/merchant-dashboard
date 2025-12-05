import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { setMerchantUser } from "@/lib/merchant-user";
import { API_BASE_URL } from "@/lib/api-client";

export default function MerchantSignup() {
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

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

          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Fast onboarding</p>
              <p className="text-sm text-muted-foreground">No paperwork for the demo—just add your details and go live.</p>
            </div>
          </div>
        </div>

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
              {isSubmitting ? "Creating account..." : "Create account"}
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
    </div>
  );
}
