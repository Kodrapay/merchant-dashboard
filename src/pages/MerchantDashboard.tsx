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
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { apiClient } from "@/lib/api-client";

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
  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile } = useMerchantProfile();
  const hasDemoData = false;
  const [kycStatus, setKycStatus] = useState<"not_started" | "pending" | "approved" | "rejected">(
    "not_started",
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [payouts, setPayouts] = useState<{ amount: number }[]>([]);
  const [balance, setBalance] = useState<{ available: number; pending: number; total: number }>({
    available: 0,
    pending: 0,
    total: 0,
  });
  const location = useLocation();

  useEffect(() => {
    if (profile?.kyc_status) {
      setKycStatus(profile.kyc_status as "not_started" | "pending" | "approved" | "rejected");
    }
  }, [profile, location.pathname]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!profile?.id && !profile?.merchant_id) {
        setTransactions([]);
        return;
      }
      setIsLoading(true);
      try {
        const merchantId = profile?.id || profile?.merchant_id;
        const resp = await fetch(`${API_BASE_URL}/transactions?merchant_id=${merchantId}`);
        if (!resp.ok) throw new Error("Failed to load transactions");
        const data = await resp.json();
        const listSource = Array.isArray(data)
          ? data
          : data.transactions || data.Transactions || data.data || [];
        const list: Transaction[] = listSource.map((tx: any) => {
          const rawAmount = tx.amount || 0;
          return {
            id: tx.id,
            reference: tx.reference || tx.id,
            customer: tx.customer_name || tx.customer || "Customer",
            email: tx.customer_email || "",
            amount: rawAmount / 100,
            currency: tx.currency || "NGN",
            status: (tx.status === "success" ? "successful" : tx.status || "pending") as Transaction["status"],
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
  }, [profile?.id, profile?.merchant_id, hasDemoData]);

  useEffect(() => {
    const fetchPayouts = async () => {
      const merchantId = profile?.id || profile?.merchant_id;
      if (!merchantId) {
        setPayouts([]);
        return;
      }
      try {
        const resp = await fetch(`${apiClient.payouts.list}?merchant_id=${merchantId}`);
        if (!resp.ok) throw new Error("Failed to load payouts");
        const data = await resp.json();
        const list = Array.isArray(data) ? data : data.payouts || data.data || [];
        setPayouts(list.map((p: any) => ({ amount: (p.amount || 0) / 100 })));
      } catch {
        setPayouts([]);
      }
    };
    fetchPayouts();
  }, [profile?.id, profile?.merchant_id]);

  const revenue = useMemo(() => {
    const total = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    return total;
  }, [transactions]);

  useEffect(() => {
    const fetchBalance = async () => {
      const merchantId = profile?.id || profile?.merchant_id;
      if (!merchantId) {
        setBalance({ available: 0, pending: 0, total: 0 });
        return;
      }
      try {
        const resp = await fetch(`${API_BASE_URL}/merchants/${merchantId}/balance?currency=NGN`);
        if (!resp.ok) throw new Error("Failed to load balance");
        const data = await resp.json();
        setBalance({
          available: (data.available_balance || 0) / 100,
          pending: (data.pending_balance || 0) / 100,
          total: (data.total_volume || revenue * 100) / 100,
        });
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance({ available: 0, pending: 0, total: 0 });
      }
    };
    fetchBalance();
  }, [profile?.id, profile?.merchant_id, revenue]);

  const availableBalance = balance.available;
  const pendingSettlement = balance.pending;

  const successRate = useMemo(() => {
    if (!transactions.length) return null;
    const successCount = transactions.filter((t) => t.status === "successful").length;
    return (successCount / transactions.length) * 100;
  }, [transactions]);

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount || 0);

  const monthlyRevenueData = useMemo(() => {
    const revenueByMonth: { [key: string]: number } = {};
    transactions.forEach(tx => {
      const month = new Date(tx.date).toLocaleString('en-US', { month: 'short' });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + tx.amount;
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map(month => ({
      name: month,
      revenue: revenueByMonth[month] || 0
    }));
  }, [transactions]);

  const totalRevenueValue = balance.total > 0 ? balance.total : revenue;

  return (
    <DashboardLayout type="merchant" title="Dashboard">
      <KYCAlert status={kycStatus} className="mb-6" />

      {isLoadingProfile && (
        <div className="flex justify-center items-center h-48">
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      )}

      {isErrorProfile && (
        <div className="flex flex-col justify-center items-center h-48 text-destructive">
          <p className="text-lg">Error loading profile data.</p>
          <p className="text-sm">Please try again later.</p>
        </div>
      )}

      {(!isLoadingProfile && !isErrorProfile && profile) && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(totalRevenueValue, "NGN")}
              change={transactions.length ? `${transactions.length} transactions` : "No volume yet"}
              changeType={transactions.length ? "positive" : "neutral"}
              icon={DollarSign}
              iconColor="bg-success/10 text-success"
              delay={0}
              className="lg:col-span-2"
            />
            <StatsCard
              title="Available Balance"
              value={formatCurrency(availableBalance, "NGN")}
              change="After settlement"
              changeType="neutral"
              icon={Wallet}
              iconColor="bg-primary/10 text-primary"
              delay={100}
            />
            <StatsCard
              title="Pending Settlement"
              value={formatCurrency(pendingSettlement, "NGN")}
              change={transactions.length ? "Awaiting settlement run" : "No volume yet"}
              changeType="neutral"
              icon={DollarSign}
              iconColor="bg-warning/10 text-warning"
              delay={150}
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
              value={successRate !== null ? `${successRate.toFixed(1)}%` : "N/A"}
              change={transactions.length ? "Based on live data" : "Awaiting transactions"}
              changeType="neutral"
              icon={TrendingUp}
              iconColor="bg-accent text-accent-foreground"
              delay={300}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Chart */}
            <div className="lg:col-span-2">
              <RevenueChart title="Your Revenue" data={monthlyRevenueData} />
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
        </>
      )}

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
