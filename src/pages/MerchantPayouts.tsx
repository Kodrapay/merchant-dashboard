import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet, RefreshCw, ArrowUpRight, Calendar } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-client";
import { getMerchantUser } from "@/lib/merchant-user";

const statusTone = {
  processing: "text-warning bg-warning/10",
  sent: "text-success bg-success/10",
  scheduled: "text-muted-foreground bg-muted/60",
  pending: "text-muted-foreground bg-muted/60",
};

export default function MerchantPayouts() {
  const user = getMerchantUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [bank, setBank] = useState("GTBank •••• 1234");
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      if (!user?.merchantId) {
        setPayouts([]);
        return;
      }
      setIsLoading(true);
      try {
        const resp = await fetch(`${API_BASE_URL}/payouts?merchant_id=${user.merchantId}`);
        const data = await resp.json();
        const list = (Array.isArray(data) ? data : data.data || []).map((p: any) => ({
          id: p.id,
          amount: (p.amount || 0) / 100,
          status: p.status || "pending",
          date: p.created_at || "",
          bank: p.bank || p.recipient_bank || "",
        }));
        setPayouts(list);
      } catch {
        setPayouts([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.merchantId]);

  const submitPayout = () => {
    setIsDialogOpen(false);
    setPayoutAmount("");
    toast({
      title: "Payout request submitted",
      description: `We will process ₦${payoutAmount || "0"} to ${bank}.`,
    });
  };

  return (
    <DashboardLayout type="merchant" title="Payouts">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            ₦{payouts.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Next payout</p>
          <p className="text-2xl font-semibold text-foreground mt-1">₦0</p>
          <p className="text-xs text-muted-foreground mt-1">Arriving soon</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending review</p>
          <p className="text-2xl font-semibold text-warning mt-1">0</p>
          <p className="text-xs text-muted-foreground mt-1">No pending reviews</p>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input placeholder="Search payout ID" className="pr-10" />
              <Calendar className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Wallet className="h-4 w-4" />
            Request payout
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Recent payouts</h3>
          <Button variant="ghost" size="sm" className="gap-2">
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        <div className="divide-y divide-border">
          {isLoading && (
            <div className="py-4 text-sm text-muted-foreground text-center">Loading payouts...</div>
          )}
          {!isLoading && payouts.length === 0 && (
            <div className="py-4 text-sm text-muted-foreground text-center">No payouts yet.</div>
          )}
          {payouts.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm text-muted-foreground">{payout.id}</p>
                <p className="font-semibold text-foreground">₦{payout.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{payout.bank}</p>
              </div>
              <div className="text-right">
                <Badge className={statusTone[payout.status as keyof typeof statusTone]}>
                  {payout.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">{payout.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request payout</DialogTitle>
            <DialogDescription>
              Choose an amount and destination account. This is a demo flow and will show a confirmation toast.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payout-amount">Amount (NGN)</Label>
              <Input
                id="payout-amount"
                type="number"
                min="1"
                placeholder="200000"
                value={payoutAmount}
                onChange={(event) => setPayoutAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">Bank account</Label>
              <Input
                id="bank"
                value={bank}
                onChange={(event) => setBank(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPayout} disabled={!payoutAmount}>
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
