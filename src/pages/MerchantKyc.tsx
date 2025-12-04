import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getMerchantUser, setMerchantUser } from "@/lib/merchant-user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock } from "lucide-react";

export default function MerchantKyc() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getMerchantUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessReg, setBusinessReg] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState(user?.email ? `https://${user.email.split("@")[1] || "business.com"}` : "");
  const [kycStatus, setKycStatus] = useState(user?.kycStatus ?? "not_started");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      if (user) {
        setMerchantUser({ ...user, kycStatus: "pending" });
        setKycStatus("pending");
      }
      setIsSubmitting(false);
      toast({
        title: "KYC submitted",
        description: "We’ll review and grant you access. You’ll be notified once approved.",
      });
      navigate("/merchant/kyc");
    }, 800);
  };

  const simulateAdminApproval = () => {
    if (user) {
      const updated = { ...user, kycStatus: "approved" } as typeof user;
      setMerchantUser(updated);
      setKycStatus("approved");
      toast({ title: "KYC approved (demo)", description: "Access unlocked." });
      navigate("/merchant");
    }
  };

  return (
    <DashboardLayout type="merchant" title="Complete KYC" forceKycOnly>
      <div className="max-w-3xl space-y-6">
        {kycStatus === "pending" && (
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>KYC submitted</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              Awaiting admin approval. Once approved, other menus will unlock.
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pending
              </Badge>
              <Button variant="outline" size="sm" onClick={simulateAdminApproval}>
                Simulate admin approval
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <Card className="p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Step 1 • Business verification</p>
            <h2 className="text-xl font-semibold text-foreground">Tell us about your business</h2>
            <p className="text-sm text-muted-foreground">
              Submit basic details to activate your account. This demo will auto-approve after submission.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="business-name">Registered business name</Label>
              <Input
                id="business-name"
                value={user?.businessName || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-reg">Business registration number</Label>
              <Input
                id="business-reg"
                placeholder="RC1234567"
                value={businessReg}
                onChange={(event) => setBusinessReg(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Registered address</Label>
              <Textarea
                id="address"
                placeholder="12 Admiralty Way, Lagos"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://yourbusiness.com"
              />
            </div>
            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit KYC"}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
