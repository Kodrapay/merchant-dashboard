import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { KYCAlert } from "@/components/dashboard/KYCAlert";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ArrowUpRight,
  CreditCard,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getMerchantUser } from "@/lib/merchant-user";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

export default function MerchantDashboard() {
  const user = getMerchantUser();
  const hasDemoData = Boolean(user?.hasDemoData);
  const kycStatus: "not_started" | "pending" | "approved" | "rejected" =
    user?.kycStatus ?? "not_started";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.merchantId) {
        setTransactions([]);
        return;
      }
      setIsLoading(true);
      try {
        const resp = await fetch(`${API_BASE_URL}/transactions?merchant_id=${user.merchantId}`);
        if (!resp.ok) throw new Error("Failed to load transactions");
        const data = await resp.json();
        const list: Transaction[] = (Array.isArray(data) ? data : data.data || []).map((tx: any) => {
          const rawAmount = tx.amount || 0;
          return {
            id: tx.id,
            reference: tx.reference || tx.id,
            customer: tx.customer_name || tx.customer || "Customer",
            email: tx.customer_email || "",
            amount: rawAmount / 100,
            currency: tx.currency || "NGN",
            status: (tx.status || "pending") as Transaction["status"],
            date: tx.created_at || new Date().toISOString(),
            description: tx.description,
          };
        });
        setTransactions(list);
      } catch {
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (!hasDemoData) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [user?.merchantId, hasDemoData]);

  const revenue = useMemo(() => {
    const total = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    return total;
  }, [transactions]);

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount || 0);

  return (
    <DashboardLayout type="merchant" title="Dashboard">
      {/* KYC Status Alert */}
      <KYCAlert status={kycStatus} className="mb-6" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={hasDemoData ? "₦0" : formatCurrency(revenue, "NGN")}
          change={transactions.length ? `${transactions.length} transactions` : "No volume yet"}
          changeType={transactions.length ? "positive" : "neutral"}
          icon={DollarSign}
          iconColor="bg-success/10 text-success"
          delay={0}
        />
        <StatsCard
          title="Available Balance"
          value={hasDemoData ? "₦0" : "₦0"}
          change={hasDemoData ? "No payouts yet" : "No payouts yet"}
          changeType="neutral"
          icon={Wallet}
          iconColor="bg-primary/10 text-primary"
          delay={100}
        />
        <StatsCard
          title="Transactions"
          value={String(transactions.length)}
          change={transactions.length ? "Recent activity" : "No activity"}
          changeType={transactions.length ? "positive" : "neutral"}
          icon={CreditCard}
          iconColor="bg-warning/10 text-warning"
          delay={200}
        />
        <StatsCard
          title="Success Rate"
          value={transactions.length ? "—" : "N/A"}
          change={transactions.length ? "Based on live data" : "Awaiting transactions"}
          changeType={transactions.length ? "neutral" : "neutral"}
          icon={TrendingUp}
          iconColor="bg-accent text-accent-foreground"
          delay={300}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2">
          <RevenueChart title="Your Revenue" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
          <Button variant="outline" size="sm">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
        <TransactionTable
          transactions={transactions}
          onSelect={(tx) => setSelectedTx(tx)}
          isLoading={isLoading}
        />
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
                  {formatCurrency(selectedTx.amount, selectedTx.currency)}
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
