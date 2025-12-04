import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, RefreshCw, Shield } from "lucide-react";
import { getMerchantUser } from "@/lib/merchant-user";
import { apiClient, fetchFromAPI } from "@/lib/api-client";

type APIKey = {
  key_id: string;
  key?: string;
  key_prefix: string;
  type: string;
  environment: string;
  created_at: string;
};

export default function MerchantApiKeys() {
  const [showSecret, setShowSecret] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const user = getMerchantUser();

  useEffect(() => {
    const loadAPIKeys = async () => {
      if (!user?.merchantId) {
        setIsLoading(false);
        return;
      }
      try {
        const keys = await fetchFromAPI(apiClient.merchants.apiKeys(user.merchantId));
        setApiKeys(keys);
      } catch (error) {
        console.error("Failed to load API keys:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAPIKeys();
  }, [user?.merchantId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handleRotateKey = async () => {
    if (!user?.merchantId) return;
    try {
      const newKey = await fetchFromAPI(apiClient.merchants.rotateApiKey(user.merchantId), {
        method: "POST",
      });
      // Update the secret key in the list
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
    <DashboardLayout type="merchant" title="API Keys">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Test keys</p>
                <p className="text-lg font-semibold text-foreground">Use in development</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRotateKey} disabled={isLoading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
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
                      onClick={() =>
                        copyToClipboard(
                          secretKey?.key || secretKey?.key_prefix || "",
                          "Secret key"
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
