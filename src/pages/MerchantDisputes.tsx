import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, apiClient } from "@/lib/api-client";
import { getMerchantUser } from "@/lib/merchant-user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, AlertCircle } from "lucide-react";

type Dispute = {
  id: string;
  status: string;
  reference: string;
  merchant_id?: string;
  opened_at?: string;
  closed_at?: string;
};

export default function MerchantDisputes() {
  const user = getMerchantUser();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDisputes = async () => {
    if (!user?.merchantId) {
      setError("Please sign in again to view disputes.");
      setDisputes([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${apiClient.disputes.list}?merchant_id=${user.merchantId}`);
      if (!resp.ok) throw new Error("Failed to load disputes");
      const data = await resp.json();
      const list = Array.isArray(data) ? data : data?.disputes || data?.data || [];
      setDisputes(list);
    } catch (err: any) {
      setError(err.message || "Failed to load disputes");
      setDisputes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [user?.merchantId]);

  const statusTone: Record<string, string> = {
    open: "bg-warning/10 text-warning",
    under_review: "bg-warning/10 text-warning",
    resolved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <DashboardLayout type="merchant" title="Disputes">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Transaction Disputes</h2>
          <p className="text-sm text-muted-foreground">Track raised disputes and their statuses.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={loadDisputes} disabled={isLoading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive mb-3">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Closed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading disputes...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && disputes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No disputes found.
                </TableCell>
              </TableRow>
            )}
            {disputes.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-sm">{d.reference}</TableCell>
                <TableCell>
                  <Badge className={statusTone[d.status] || ""}>{d.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.opened_at}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.closed_at || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </DashboardLayout>
  );
}
