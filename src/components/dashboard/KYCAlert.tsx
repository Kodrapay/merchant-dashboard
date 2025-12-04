import { AlertCircle, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type KYCStatus = "not_started" | "pending" | "approved" | "rejected";

interface KYCAlertProps {
  status: KYCStatus;
  className?: string;
}

export function KYCAlert({ status, className }: KYCAlertProps) {
  if (status === "approved") {
    // Don't show alert if KYC is approved
    return null;
  }

  const getAlertConfig = () => {
    switch (status) {
      case "not_started":
        return {
          variant: "destructive" as const,
          icon: AlertCircle,
          iconColor: "text-destructive",
          title: "KYC Verification Required",
          description: "You must complete your business KYC verification before you can process transactions.",
          action: (
            <Link to="/merchant/kyc">
              <Button size="sm" className="mt-2">
                Complete KYC Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ),
        };

      case "pending":
        return {
          variant: "default" as const,
          icon: Clock,
          iconColor: "text-primary",
          title: "KYC Under Review",
          description: "Your KYC submission is being reviewed. This typically takes 24-48 hours. You'll be notified once approved.",
          action: null,
        };

      case "rejected":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          iconColor: "text-destructive",
          title: "KYC Verification Rejected",
          description: "Your KYC submission was rejected. Please review the feedback and resubmit with correct information.",
          action: (
            <Link to="/merchant/kyc">
              <Button size="sm" variant="outline" className="mt-2">
                Resubmit KYC
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ),
        };

      default:
        return null;
    }
  };

  const config = getAlertConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className={className}>
      <Icon className={`h-5 w-5 ${config.iconColor}`} />
      <div className="flex-1">
        <AlertTitle className="mb-1">{config.title}</AlertTitle>
        <AlertDescription className="text-sm">
          {config.description}
        </AlertDescription>
        {config.action}
      </div>
    </Alert>
  );
}
