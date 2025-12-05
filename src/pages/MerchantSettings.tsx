import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getMerchantUser } from "@/lib/merchant-user";
import { Bell, Building2, Globe, Shield, Eye, EyeOff, Copy, RefreshCw, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient, fetchFromAPI } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

type APIKey = {
  key_id: string;
  key?: string;
  key_prefix: string;
  type: string;
  environment: string;
  created_at: string;
};

export default function MerchantSettings() {
  const [showSecret, setShowSecret] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [kycStatus, setKycStatus] = useState<"not_started" | "pending" | "approved" | "rejected">("not_started");
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = getMerchantUser();

  useEffect(() => {
    const user = getMerchantUser();
    if (user?.businessName) {
      setBusinessName(user.businessName);
    }
    if (user?.kycStatus) {
      setKycStatus(user.kycStatus);
    }

    // Load API keys
    const loadAPIKeys = async () => {
      if (!user?.merchantId) {
        setIsLoadingKeys(false);
        return;
      }
      try {
        const keys = await fetchFromAPI(apiClient.merchants.apiKeys(user.merchantId));
        setApiKeys(keys);
      } catch (error) {
        console.error("Failed to load API keys:", error);
      } finally {
        setIsLoadingKeys(false);
      }
    };
    loadAPIKeys();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard.`,
    });
  };

  const rotateWebhookSecret = () => {
    const next = `whsec_${Math.random().toString(36).slice(2, 12)}`;
    setWebhookSecret(next);
    toast({
      title: "Webhook secret rotated",
      description: "Use the new secret to verify signatures.",
    });
  };

  const handleRotateKey = async () => {
    if (!user?.merchantId) return;
    try {
      const newKey = await fetchFromAPI(apiClient.merchants.rotateApiKey(user.merchantId), {
        method: "POST",
      });
      setApiKeys((prev) =>
        prev.map((k) =>
          k.type === "secret" && k.environment === newKey.environment ? newKey : k
        )
      );
      toast({
        title: "Key Rotated",
        description: "Your secret key has been rotated successfully.",
      });
    } catch (error) {
      console.error("Failed to rotate key:", error);
      toast({
        title: "Error",
        description: "Failed to rotate key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const publicKey = apiKeys.find((k) => k.type === "public");
  const secretKey = apiKeys.find((k) => k.type === "secret");

  return (
    <DashboardLayout type="merchant" title="Settings">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Business profile</p>
              <p className="text-lg font-semibold text-foreground">Legal details</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business">Business name</Label>
              <Input
                id="business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Website</Label>
              <Input id="domain" placeholder="https://yourbusiness.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="callback">Callback URL</Label>
            <Input id="callback" placeholder="https://yourbusiness.com/webhooks/payments" />
          </div>
          <Button className="w-full md:w-auto">Save changes</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notifications</p>
              <p className="text-lg font-semibold text-foreground">Alerts</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="font-medium text-foreground">Payment alerts</p>
                <p className="text-sm text-muted-foreground">Send push and email for successful payments</p>
              </div>
              <Switch defaultChecked />
            </label>
            <label className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="font-medium text-foreground">Settlement notices</p>
                <p className="text-sm text-muted-foreground">Notify when funds are sent to your bank</p>
              </div>
              <Switch defaultChecked />
            </label>
            <label className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="font-medium text-foreground">Risk alerts</p>
                <p className="text-sm text-muted-foreground">Alert when transactions require review</p>
              </div>
              <Switch />
            </label>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">KYC status</p>
            <p className="text-lg font-semibold text-foreground">Business verification</p>
          </div>
          <Badge variant={kycStatus === "approved" ? "secondary" : "outline"} className="capitalize">
            {kycStatus}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Keep your verification details up to date. You can resubmit if business information changes.
        </p>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/merchant/kyc")}>
          {kycStatus === "approved" ? "Update KYC" : "Complete KYC"}
        </Button>
      </Card>

      <Card className="p-6 space-y-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Support</p>
            <p className="text-lg font-semibold text-foreground">Share more details</p>
          </div>
        </div>
        <Textarea placeholder="Tell us about your integration needs, payout schedule, or any custom requirements." />
        <Separator />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Our team responds in under 24 hours.</p>
          <Button variant="outline">Submit request</Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 mt-2">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API credentials</p>
                <p className="text-lg font-semibold text-foreground">Test keys</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRotateKey} disabled={isLoadingKeys}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {isLoadingKeys ? (
            <p className="text-sm text-muted-foreground">Loading API keys...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Public Key</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="text-sm text-foreground flex-1 truncate">
                    {publicKey?.key || publicKey?.key_prefix}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(publicKey?.key || publicKey?.key_prefix || "", "Public key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Secret Key</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="text-sm text-foreground flex-1 truncate">
                    {showSecret && secretKey?.key
                      ? secretKey.key
                      : secretKey?.key_prefix + "••••••••••••••••"}
                  </code>
                  {secretKey?.key && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(secretKey?.key || secretKey?.key_prefix || "", "Secret key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Webhook signing secret</p>
              <p className="text-lg font-semibold text-foreground">Secure callbacks</p>
            </div>
          </div>
          <Input value={webhookSecret} readOnly />
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Live</Badge>
            <Button variant="outline" size="sm" onClick={rotateWebhookSecret}>
              Rotate secret
            </Button>
          </div>
          <Separator />
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Keep secrets in your backend only.</li>
            <li>Rotate regularly and revoke unused keys.</li>
            <li>Use test keys in staging environments.</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
