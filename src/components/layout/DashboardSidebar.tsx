import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Wallet,
  ArrowLeftRight,
  FileText,
  FileCheck,
} from "lucide-react";
import { useMerchantProfile } from "@/hooks/useMerchantProfile";
import { logout } from "@/lib/session";

interface SidebarProps {
  type: "admin" | "merchant";
  forceKycOnly?: boolean;
}

const adminLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/merchants", icon: Users, label: "Merchants" },
  { href: "/admin/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

const merchantLinks = [
  { href: "/merchant", icon: LayoutDashboard, label: "Dashboard" },
  {
    href: "/merchant/transactions",
    icon: ArrowLeftRight,
    label: "Transactions",
  },
  { href: "/merchant/payment-links", icon: FileText, label: "Payment Links" },
  { href: "/merchant/disputes", icon: FileCheck, label: "Disputes" },
  { href: "/merchant/payouts", icon: Wallet, label: "Payouts" },
  { href: "/merchant/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar({ type, forceKycOnly }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useMerchantProfile();
  const isKycApproved = (profile?.kyc_status === "approved" || profile?.kyc_status === "completed");
  const links =
    type === "admin"
      ? adminLinks
      : !forceKycOnly && isKycApproved
        ? merchantLinks
        : [{ href: "/merchant/kyc", icon: FileCheck, label: "Business KYC" }];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar/95 border-r border-sidebar-border/70 shadow-[12px_0_30px_-18px_rgba(15,23,42,0.6)] backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border/70 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
              KodraPay
            </span>
            <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">
              Commerce
            </p>
          </div>
          <span className="ml-auto rounded-full bg-sidebar-accent px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-sidebar-primary">
            {type === "admin" ? "Admin" : "Merchant"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-5">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-[0_8px_20px_-14px_rgba(24,98,80,0.65)]"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border/70 p-3">
          <button
            onClick={async () => {
              await logout();
              localStorage.removeItem("merchantUser");
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Exit Dashboard
          </button>
        </div>
      </div>
    </aside>
  );
}
