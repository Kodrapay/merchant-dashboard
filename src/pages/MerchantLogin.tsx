import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Lock, ArrowLeft, ArrowRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  deriveBusinessName,
  getMerchantUser,
  setMerchantUser,
} from "@/lib/merchant-user";

export default function MerchantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useOtp, setUseOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      localStorage.setItem("authToken", "demo-merchant-token");
      const existingUser = getMerchantUser();
      const isDemo =
        email.trim().toLowerCase() === "demo@kodrapay.com" &&
        password.trim() === "Demo123!";

      if (isDemo) {
        setMerchantUser({
          email,
          businessName: "Demo Electronics",
          kycStatus: "approved",
          hasDemoData: true,
        });
      } else {
        setMerchantUser({
          email,
          businessName: existingUser?.businessName || deriveBusinessName(email),
          kycStatus: existingUser?.kycStatus ?? "not_started",
          hasDemoData: false,
          createdAt: existingUser?.createdAt ?? new Date().toISOString(),
        });
      }

      setIsSubmitting(false);
      toast({
        title: "Login successful",
        description: "Welcome back. Redirecting to your dashboard.",
      });
      const nextUser = getMerchantUser();
      navigate(nextUser && nextUser.kycStatus !== "approved" ? "/merchant/kyc" : "/merchant");
    }, 600);
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
              <h1 className="text-3xl font-bold text-foreground">Merchant Login</h1>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Access payouts, transactions, and API keys in one place. Use your merchant email and password or request a one-time passcode.
          </p>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Need 2FA?</p>
              <p className="text-sm text-muted-foreground">We will send an OTP to your registered device.</p>
            </div>
          </div>
        </div>

        <Card className="p-8 shadow-lg border-border bg-card">
          <div className="space-y-2 mb-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to open your merchant dashboard.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">{useOtp ? "One-time passcode" : "Password"}</Label>
              <Input
                id="password"
                type={useOtp ? "text" : "password"}
                placeholder={useOtp ? "123456" : "••••••••"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={useOtp}
                  onCheckedChange={(checked) => setUseOtp(Boolean(checked))}
                />
                Use one-time passcode
              </label>
              <a href="mailto:support@kodrapay.com" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Continue"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Secure sign-in with fraud and compliance controls enabled.
          </p>

          <p className="text-sm text-muted-foreground text-center mt-2">
            New to KodraPay?{" "}
            <Link to="/merchant/signup" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
