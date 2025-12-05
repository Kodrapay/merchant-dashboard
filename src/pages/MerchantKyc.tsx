import { FormEvent, useEffect, useState } from "react";
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
import { API_BASE_URL } from "@/lib/api-client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function MerchantKyc() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getMerchantUser();
  const normalizeKyc = (status?: string) => {
    if (!status) return "not_started";
    if (status === "completed") return "approved";
    return status;
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessType, setBusinessType] = useState<"running" | "startup">("running");
  const [businessReg, setBusinessReg] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState(user?.email ? `https://${user.email.split("@")[1] || "business.com"}` : "");
  const [kycStatus, setKycStatus] = useState(normalizeKyc(user?.kycStatus));

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.merchantId) return;
      try {
        const resp = await fetch(`${API_BASE_URL}/merchants/${user.merchantId}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (data?.kyc_status) {
          const normalized = normalizeKyc(data.kyc_status);
          setKycStatus(normalized);
          setMerchantUser({ ...(user || {}), kycStatus: normalized });

          // If KYC is already approved, redirect to dashboard
          if (normalized === "approved") {
            navigate("/merchant/dashboard", { replace: true });
          }
        }
      } catch {
        /* ignore */
      }
    };
    fetchStatus();
  }, [user?.merchantId, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!user?.merchantId) {
      toast({ title: "Not signed in", description: "Please sign in again.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        merchant_id: user.merchantId,
        business_type: businessType === "running" ? "registered" : "startup",
        business_name: user.businessName || "Business",
        cac_number: businessReg,
        tin_number: "",
        business_address: address || "N/A",
        city: "Lagos",
        state: "LA",
        postal_code: "100001",
        incorporation_date: "",
        business_category: "General",
        director_name: user.businessName || user.email || "Director",
        director_bvn: "00000000000",
        director_phone: "+2340000000000",
        director_email: user.email,
        documents: {},
      };

      const resp = await fetch(`${API_BASE_URL}/kyc/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error("KYC submission failed");

      setMerchantUser({ ...user, kycStatus: "pending" });
      setKycStatus("pending");
      toast({
        title: "KYC submitted",
        description: "We’ll review and grant you access. You’ll be notified once approved.",
      });
      navigate("/merchant/kyc");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error?.message || "Please retry shortly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              Submit basic details to activate your account. Choose whether you are a running business or a startup to see the right document checklist.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Business type</Label>
              <RadioGroup
                value={businessType}
                onValueChange={(val) => setBusinessType(val as "running" | "startup")}
                className="grid grid-cols-2 gap-3"
              >
                <label className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer ${businessType === "running" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="running" id="running" className="mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Registered / Running</p>
                    <p className="text-xs text-muted-foreground">CAC / existing business documents</p>
                  </div>
                </label>
                <label className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer ${businessType === "startup" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="startup" id="startup" className="mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Startup</p>
                    <p className="text-xs text-muted-foreground">Lightweight docs (ID, utility bill, bank statement)</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <div className="rounded-lg border border-dashed border-border p-3 bg-muted/30">
              <p className="text-xs font-semibold text-foreground mb-1">Required documents</p>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                {businessType === "startup" ? (
                  <>
                    <li>Director/Founder government-issued ID</li>
                    <li>Utility bill (≤3 months) for address verification</li>
                    <li>Recent bank statement (≤3 months)</li>
                  </>
                ) : (
                  <>
                    <li>CAC certificate (RC number)</li>
                    <li>TIN certificate</li>
                    <li>Director government-issued ID</li>
                    <li>Utility bill (≤3 months)</li>
                  </>
                )}
              </ul>
            </div>

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
