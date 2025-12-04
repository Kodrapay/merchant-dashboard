import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Filter, Calendar, Search } from "lucide-react";
import { getMerchantUser } from "@/lib/merchant-user";
import { API_BASE_URL } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Transaction = {
  id: string;
  reference: string;
  customer: string;
  email: string;
  amount: number;
  currency: string;
  status: "successful" | "pending" | "failed";
  date: string;
  description?: string;
};

export default function MerchantTransactions() {
  const user = getMerchantUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.merchantId) {
        setTransactions([]);
        return;
      }
      setIsLoading(true);
      try {
        const resp = await fetch(`${API_BASE_URL}/transactions?merchant_id=${user.merchantId}`);
        const data = await resp.json();
        const list: Transaction[] = (Array.isArray(data) ? data : data.data || []).map((tx: any) => ({
          id: tx.id,
          reference: tx.reference || tx.id,
          customer: tx.customer_name || tx.customer || "Customer",
          email: tx.customer_email || "",
          amount: (tx.amount || 0) / 100,
          currency: tx.currency || "NGN",
          status: (tx.status || "pending") as Transaction["status"],
          date: tx.created_at || new Date().toISOString(),
          description: tx.description,
        }));
        setTransactions(list);
      } catch {
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.merchantId]);

  return (
    <DashboardLayout type="merchant" title="Transactions">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Processed</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            ₦{transactions.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Success rate</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {transactions.length ? "—" : "N/A"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Refunds pending</p>
          <p className="text-2xl font-semibold text-warning mt-1">
            0
          </p>
        </Card>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-xs">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search reference or customer" className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date range
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          <Button variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </Card>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">Live</Badge>
          <span className="text-sm text-muted-foreground">Last updated: a few seconds ago</span>
        </div>
        <TransactionTable transactions={transactions} onSelect={setSelectedTx} isLoading={isLoading} />
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Settling soon</p>
          <p className="text-xl font-semibold text-foreground mt-1">₦0</p>
          <p className="text-xs text-muted-foreground mt-2">
            Funds will settle to your bank within 24 hours.
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Chargebacks</p>
          <p className="text-xl font-semibold text-destructive mt-1">0 open</p>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            Upload supporting evidence to improve win rate.
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Fraud review</p>
          <p className="text-xl font-semibold text-warning mt-1">0 flagged</p>
          <p className="text-xs text-muted-foreground mt-2">
            Configure rules in the fraud service to reduce false positives.
          </p>
        </Card>
      </div>

      <Dialog open={Boolean(selectedTx)} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono">{selectedTx.reference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  ₦{(selectedTx.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className="capitalize">{selectedTx.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{selectedTx.customer}</p>
                <p className="text-muted-foreground">{selectedTx.email}</p>
              </div>
              {selectedTx.description && (
                <div>
                  <p className="text-muted-foreground">Description</p>
                  <p>{selectedTx.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
