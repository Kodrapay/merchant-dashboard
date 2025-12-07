import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { validateSession } from "@/lib/session";

export type MerchantProfile = {
  id: number;
  email: string;
  business_name: string;
  merchant_id?: number;
  kyc_status?: string;
  status?: string;
  country?: string;
};

const normalizeKyc = (status?: string) => {
  if (!status) return "not_started";
  if (status === "completed") return "approved";
  return status;
};

export function useMerchantProfile() {
  return useQuery<MerchantProfile>({
    queryKey: ["merchantProfile"],
    queryFn: async () => {
      // Resolve merchant id from the current session (auth returns numeric ids)
      const session = await validateSession();
      const merchantId = session?.merchantId;
      const merchantIdNum =
        typeof merchantId === "string" ? parseInt(merchantId, 10) : merchantId;
      if (!merchantIdNum || Number.isNaN(merchantIdNum) || merchantIdNum <= 0) {
        throw new Error("Missing merchant_id in session");
      }

      const resp = await fetch(`${apiClient.merchants.get(merchantIdNum)}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!resp.ok) {
        throw new Error("Failed to load merchant profile");
      }
      const data = await resp.json();
      const normalizedId =
        typeof data.id === "number"
          ? data.id
          : typeof data.id === "string"
            ? parseInt(data.id, 10)
            : merchantIdNum;
      const normalizedMerchantId =
        typeof data.merchant_id === "number"
          ? data.merchant_id
          : typeof data.merchant_id === "string"
            ? parseInt(data.merchant_id, 10)
            : merchantIdNum;
      if (!normalizedId || Number.isNaN(normalizedId) || normalizedId <= 0) {
        throw new Error("Invalid merchant profile id");
      }
      if (!normalizedMerchantId || Number.isNaN(normalizedMerchantId) || normalizedMerchantId <= 0) {
        throw new Error("Invalid merchant profile merchant_id");
      }
      return {
        ...data,
        id: normalizedId,
        merchant_id: normalizedMerchantId,
        kyc_status: normalizeKyc(data?.kyc_status),
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
