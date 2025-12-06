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
import { Wallet, RefreshCw, ArrowUpRight, Calendar, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-client";
import { getMerchantUser } from "@/lib/merchant-user";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusTone = {
  processing: "text-warning bg-warning/10",
  sent: "text-success bg-success/10",
  scheduled: "text-muted-foreground bg-muted/60",
  pending: "text-muted-foreground bg-muted/60",
};

// Nigerian banks list
const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Access Bank (Diamond)" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank For Africa" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

export default function MerchantPayouts() {
  const user = getMerchantUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    refreshPayouts();
    fetchBalance();
  }, [user?.merchantId]);

  const fetchBalance = async () => {
    if (!user?.merchantId) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/merchants/${user.merchantId}/balance?currency=NGN`);
      if (resp.ok) {
        const data = await resp.json();
        setAvailableBalance((data.available_balance || 0) / 100);
        setPendingBalance((data.pending_balance || 0) / 100);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const refreshPayouts = async () => {
    if (!user?.merchantId) {
      setPayouts([]);
      return;
    }
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/payouts?merchant_id=${user.merchantId}`);
      const data = await resp.json();
      const list = (Array.isArray(data) ? data : data.data || data.payouts || []).map((p: any) => ({
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

  // Resolve account name using bank code and account number
  const resolveAccountName = async (bankCode: string, accNumber: string) => {
    if (accNumber.length !== 10) {
      setAccountName("");
      return;
    }

    setIsResolvingAccount(true);
    try {
      // TODO: Replace with actual third-party API endpoint for account name resolution
      // Example: Paystack, Flutterwave, or other Nigerian bank verification services
      // const response = await fetch(`${API_BASE_URL}/banks/resolve?bank_code=${bankCode}&account_number=${accNumber}`);
      // const data = await response.json();
      // setAccountName(data.account_name);

      // Placeholder logic for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const bankName = NIGERIAN_BANKS.find((b) => b.code === bankCode)?.name || "Unknown Bank";
      setAccountName(`Demo Account Holder (${bankName})`);
    } catch (error) {
      setAccountName("");
      toast({
        title: "Failed to resolve account",
        description: "Could not verify account details. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsResolvingAccount(false);
    }
  };

  // Trigger account resolution when both bank and account number are valid
  useEffect(() => {
    if (selectedBank && accountNumber.length === 10) {
      resolveAccountName(selectedBank, accountNumber);
    } else {
      setAccountName("");
    }
  }, [selectedBank, accountNumber]);

  const submitPayout = () => {
    if (!user?.merchantId) {
      toast({ title: "Not signed in", description: "Please log in again.", variant: "destructive" });
      return;
    }

    const amountKobo = Math.max(0, Math.round(Number(payoutAmount || "0") * 100));
    if (!amountKobo) {
      toast({ title: "Enter an amount", description: "Amount must be greater than zero.", variant: "destructive" });
      return;
    }

    if (!selectedBank || !accountNumber || !accountName) {
      toast({
        title: "Incomplete details",
        description: "Please select a bank and enter a valid account number.",
        variant: "destructive",
      });
      return;
    }

    const bankName = NIGERIAN_BANKS.find((b) => b.code === selectedBank)?.name || "Bank";

    fetch(`${API_BASE_URL}/payouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: user.merchantId,
        amount: amountKobo,
        currency: "NGN",
        recipient_name: accountName,
        recipient_account: accountNumber,
        recipient_bank: bankName,
        bank_code: selectedBank,
        narration: "Payout request",
      }),
    })
      .then(async (resp) => {
        if (!resp.ok) throw new Error("Failed to submit payout");
        const data = await resp.json();
        setPayouts((prev) => [
          {
            id: data.id || `payout_${Date.now()}`,
            amount: amountKobo / 100,
            status: data.status || "processing",
            date: data.created_at || format(new Date(), "yyyy-MM-dd HH:mm"),
            bank: `${bankName} - ${accountNumber}`,
          },
          ...prev,
        ]);
        toast({
          title: "Payout request submitted",
          description: `We will process ₦${payoutAmount || "0"} to ${accountName}.`,
        });
      })
      .catch((err) => {
        toast({
          title: "Payout request failed",
          description: err.message || "Please try again shortly.",
          variant: "destructive",
        });
      });

    setIsDialogOpen(false);
    setPayoutAmount("");
    setSelectedBank("");
    setAccountNumber("");
    setAccountName("");
  };

  return (
    <DashboardLayout type="merchant" title="Payouts">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            ₦{availableBalance.toLocaleString()}
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
            <Button variant="outline" className="gap-2" onClick={() => { refreshPayouts(); fetchBalance(); }}>
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
              <Label htmlFor="bank">Bank</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger id="bank">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_BANKS.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account number</Label>
              <Input
                id="account-number"
                type="text"
                maxLength={10}
                placeholder="0123456789"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))}
              />
            </div>
            {isResolvingAccount && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resolving account name...</span>
              </div>
            )}
            {accountName && !isResolvingAccount && (
              <div className="space-y-2">
                <Label htmlFor="account-name">Account name</Label>
                <Input
                  id="account-name"
                  value={accountName}
                  readOnly
                  className="bg-muted"
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPayout} disabled={!payoutAmount || !accountName || isResolvingAccount}>
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
