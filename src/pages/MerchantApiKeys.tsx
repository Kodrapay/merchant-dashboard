import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, RefreshCw, Shield } from "lucide-react";

export default function MerchantApiKeys() {
  const [showSecret, setShowSecret] = useState(false);
  const { toast } = useToast();

  const publicKey = "pk_live_abc123xyz456def789";
  const secretKey = "sk_live_secret_key_hidden_for_security";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  return (
    <DashboardLayout type="merchant" title="API Keys">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Live keys</p>
                <p className="text-lg font-semibold text-foreground">Use in production</p>
              </div>
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Public Key</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="text-sm text-foreground flex-1 truncate">
                    {publicKey}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(publicKey, "Public key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Secret Key</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="text-sm text-foreground flex-1 truncate">
                    {showSecret ? secretKey : "sk_live_••••••••••••••••"}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(secretKey, "Secret key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Webhook signing secret</p>
                <p className="text-lg font-semibold text-foreground">Keep your endpoints secure</p>
              </div>
              <Badge variant="secondary">Live</Badge>
            </div>
            <Input defaultValue="whsec_78d9fda3f002c6a2" readOnly />
            <Button variant="outline" className="w-full sm:w-auto">
              Rotate secret
            </Button>
          </Card>
        </div>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Security</p>
              <p className="text-lg font-semibold text-foreground">Best practices</p>
            </div>
          </div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            <li>Never expose secret keys in client-side code.</li>
            <li>Use separate keys for staging and production.</li>
            <li>Rotate credentials regularly and revoke unused keys.</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
