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

const demoTransactions = [
  {
    id: "1",
    reference: "TXN_001234567",
    customer: "John Doe",
    email: "john@example.com",
    amount: 125000,
    currency: "NGN",
    status: "successful" as const,
    date: "Dec 3, 2024",
  },
  {
    id: "2",
    reference: "TXN_001234568",
    customer: "Jane Smith",
    email: "jane@example.com",
    amount: 45000,
    currency: "NGN",
    status: "successful" as const,
    date: "Dec 3, 2024",
  },
  {
    id: "3",
    reference: "TXN_001234569",
    customer: "Mike Johnson",
    email: "mike@example.com",
    amount: 89500,
    currency: "NGN",
    status: "pending" as const,
    date: "Dec 3, 2024",
  },
  {
    id: "4",
    reference: "TXN_001234570",
    customer: "Sarah Williams",
    email: "sarah@example.com",
    amount: 250000,
    currency: "NGN",
    status: "successful" as const,
    date: "Dec 2, 2024",
  },
  {
    id: "5",
    reference: "TXN_001234571",
    customer: "David Brown",
    email: "david@example.com",
    amount: 15000,
    currency: "NGN",
    status: "failed" as const,
    date: "Dec 2, 2024",
  },
];

export default function MerchantDashboard() {
  const user = getMerchantUser();

  const hasDemoData = Boolean(user?.hasDemoData);
  const kycStatus: "not_started" | "pending" | "approved" | "rejected" =
    user?.hasKyc ? "approved" : "not_started";

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
    <DashboardLayout type="merchant" title="Dashboard">
      {/* KYC Status Alert */}
      <KYCAlert status={kycStatus} className="mb-6" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={hasDemoData ? "₦45.2M" : "₦0"}
          change={hasDemoData ? "+15.3% from last month" : "No volume yet"}
          changeType={hasDemoData ? "positive" : "neutral"}
          icon={DollarSign}
          iconColor="bg-success/10 text-success"
          delay={0}
        />
        <StatsCard
          title="Available Balance"
          value={hasDemoData ? "₦8.5M" : "₦0"}
          change={hasDemoData ? "Last payout: Dec 1" : "No payouts yet"}
          changeType="neutral"
          icon={Wallet}
          iconColor="bg-primary/10 text-primary"
          delay={100}
        />
        <StatsCard
          title="Transactions"
          value={hasDemoData ? "2,847" : "0"}
          change={hasDemoData ? "+234 this week" : "No activity"}
          changeType={hasDemoData ? "positive" : "neutral"}
          icon={CreditCard}
          iconColor="bg-warning/10 text-warning"
          delay={200}
        />
        <StatsCard
          title="Success Rate"
          value={hasDemoData ? "97.8%" : "N/A"}
          change={hasDemoData ? "+1.2% from last month" : "Awaiting transactions"}
          changeType={hasDemoData ? "positive" : "neutral"}
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
          <TransactionTable transactions={hasDemoData ? demoTransactions : []} />
        </div>
    </DashboardLayout>
  );
}
