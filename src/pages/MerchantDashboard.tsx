import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  ArrowUpRight,
  CreditCard,
  TrendingUp,
  Wallet,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const recentTransactions = [
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
    <DashboardLayout type="merchant" title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value="₦45.2M"
          change="+15.3% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-success/10 text-success"
          delay={0}
        />
        <StatsCard
          title="Available Balance"
          value="₦8.5M"
          change="Last payout: Dec 1"
          changeType="neutral"
          icon={Wallet}
          iconColor="bg-primary/10 text-primary"
          delay={100}
        />
        <StatsCard
          title="Transactions"
          value="2,847"
          change="+234 this week"
          changeType="positive"
          icon={CreditCard}
          iconColor="bg-warning/10 text-warning"
          delay={200}
        />
        <StatsCard
          title="Success Rate"
          value="97.8%"
          change="+1.2% from last month"
          changeType="positive"
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

        {/* API Keys */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Public Key
              </label>
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
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Secret Key
              </label>
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

          <div className="mt-6 p-4 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-sm text-warning font-medium">
              ⚠️ Keep your secret key secure
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Never share your secret key or expose it in client-side code.
            </p>
          </div>
        </Card>
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
        <TransactionTable transactions={recentTransactions} />
      </div>
    </DashboardLayout>
  );
}
