import { FormEvent, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Copy, ExternalLink, Link2, CircleDot, Trash2 } from "lucide-react";
import { getMerchantUser } from "@/lib/merchant-user";
import { apiClient, fetchFromAPI } from "@/lib/api-client";

type PaymentLink = {
  id: string;
  amount?: number;
  currency: string;
  description: string;
  url: string;
  createdAt: string;
  type: "fixed" | "open";
};

const getOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : "";

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${currency} ${amount / 100}`;
  }
};

export default function MerchantPaymentLinks() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("25000");
  const [currency, setCurrency] = useState("NGN");
  const [description, setDescription] = useState("Payment link for customer");
  const [linkType, setLinkType] = useState<"fixed" | "open">("fixed");
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const user = useMemo(() => getMerchantUser(), []);
  const merchantId = user?.merchantId;

  const baseCheckoutUrl = useMemo(() => `${getOrigin()}/merchant/checkout`, []);

  useEffect(() => {
    // Fetch payment links from backend
    const loadPaymentLinks = async () => {
      if (!merchantId) return;

      try {
        const response = await fetchFromAPI(apiClient.paymentLinks.list(merchantId));
        const data: any[] = Array.isArray(response) ? response : response.links || response.data || [];
        setLinks(
          data.map((link) => ({
            id: link.id,
            amount: link.amount ? Number(link.amount) : undefined,
            currency: link.currency || "NGN",
            description: link.description || "",
            url: `${baseCheckoutUrl}?ref=${link.reference || link.id}&merchant_id=${link.merchant_id}&mode=${link.mode}${link.amount ? `&amount=${Number(link.amount)}` : ""}&currency=${link.currency || "NGN"}&description=${encodeURIComponent(link.description || "")}`,
            createdAt: link.created_at || "",
            type: (link.mode || "fixed") as "fixed" | "open",
          })),
        );
      } catch (error) {
        console.error("Failed to load payment links:", error);
      }
    };

    loadPaymentLinks();
  }, [merchantId, baseCheckoutUrl]);

  const handleCreateLink = async (event: FormEvent) => {
    event.preventDefault();

    if (!user?.merchantId) {
      toast({
        title: "Error",
        description: `Merchant ID not found. Please log in again. User: ${JSON.stringify(user)}`,
        variant: "destructive",
      });
      console.error("User object:", user);
      return;
    }

    const parsedAmount = Number(amount);
    const safeAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : undefined;
    if (linkType === "fixed" && !safeAmount) {
      toast({
        title: "Enter a valid amount",
        description: "Fixed links need a positive amount.",
        variant: "destructive",
      });
      return;
    }
    const safeCurrency = currency.trim().toUpperCase() || "NGN";
    const trimmedDescription = description.trim() || "Payment link";

    try {
      const response = await fetchFromAPI(apiClient.paymentLinks.create, {
        method: "POST",
        body: JSON.stringify({
          merchant_id: user.merchantId,
          mode: linkType,
          // store amounts in kobo (multiply by 100)
          amount: safeAmount ? Math.round(safeAmount * 100) : undefined,
          currency: safeCurrency,
          description: trimmedDescription,
          reference: `pl_${Date.now()}`,
        }),
      });

      const newLink: PaymentLink = {
        id: response.id || response.reference,
        amount: response.amount ? Number(response.amount) : undefined,
        currency: response.currency,
        description: response.description,
        url: `${baseCheckoutUrl}?ref=${response.reference || response.id}&merchant_id=${user.merchantId}&mode=${response.mode}${response.amount ? `&amount=${Number(response.amount)}` : ""}&currency=${response.currency || "NGN"}&description=${encodeURIComponent(response.description || "")}`,
        createdAt: response.created_at,
        type: response.mode,
      };

      setLinks((current) => [newLink, ...current].slice(0, 50));
      toast({
        title: "Payment link created",
        description: "Copy and share this link with your customer.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create payment link",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
      console.error("Error creating payment link:", error);
      console.error("Request body:", {
        merchant_id: user.merchantId,
        mode: linkType,
        amount: safeAmount,
        currency: safeCurrency,
        description: trimmedDescription,
        reference: `pl_${Date.now()}`,
      });
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Ready to share with customers." });
    } catch {
      toast({
        title: "Unable to copy automatically",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!merchantId) {
      toast({ title: "Not signed in", description: "Please log in again.", variant: "destructive" });
      return;
    }

    try {
      await fetchFromAPI(apiClient.paymentLinks.delete(id, merchantId), { method: "DELETE" });
      setLinks((current) => current.filter((l) => l.id !== id));
      toast({ title: "Payment link deleted", description: "The link is no longer active." });
    } catch (error: any) {
      toast({
        title: "Failed to delete payment link",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout type="merchant" title="Payment Links">
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Link2 className="h-4 w-4" />
              Create a new payment link
            </div>
            <p className="text-sm text-muted-foreground">
              Generate a checkout link to send to customers. They will complete payment on your hosted checkout page.
            </p>
            <p className="text-xs text-muted-foreground">
              Pricing model: 1.5% + ₦100 per transaction (capped at ₦2000). The platform fee is applied on each successful payment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "fixed", title: "Fixed amount", caption: "Set an amount customers must pay" },
              { key: "open", title: "Open amount", caption: "Customer enters the amount" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setLinkType(option.key as "fixed" | "open")}
                className={`rounded-xl border p-4 text-left transition-all ${linkType === option.key ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-2">
                  <CircleDot className={`h-4 w-4 ${linkType === option.key ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-semibold">{option.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{option.caption}</p>
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleCreateLink}>
            {linkType === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="25000"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                placeholder="NGN"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this payment for?"
              />
            </div>

            <Button type="submit" className="w-full">
              Generate link
            </Button>
          </form>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent links</p>
              <p className="text-lg font-semibold text-foreground">
                {links.length > 0 ? "Share these with customers" : "No links yet"}
              </p>
            </div>
            <Badge variant="secondary">{links.length} active</Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            {links.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Create your first payment link to see it here.
              </p>
            )}

            {links.map((link) => (
              <div
                key={link.id}
                className="rounded-lg border border-border p-4 space-y-3 bg-card/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate" title={link.id}>Link ID • {link.id}</p>
                    <p className="text-base font-semibold text-foreground truncate">
                      {link.type === "fixed"
                        ? formatAmount(link.amount ?? 0, link.currency)
                        : "Customer enters amount"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate" title={link.description}>{link.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="capitalize">
                      {link.type === "fixed" ? "Fixed" : "Open"}
                    </Badge>
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Active
                    </Badge>
                  </div>
                </div>

                <div className="rounded-md bg-secondary px-3 py-2 text-xs font-mono break-words overflow-hidden" title={link.url}>
                  {link.url}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => copyToClipboard(link.url)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open checkout
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(link.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
