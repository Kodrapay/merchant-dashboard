import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type MerchantProfile = {
  id: string;
  email: string;
  business_name: string;
  merchant_id?: string;
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
      const resp = await fetch(`${apiClient.base}/merchants/me`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!resp.ok) {
        throw new Error("Failed to load merchant profile");
      }
      const data = await resp.json();
      return {
        ...data,
        kyc_status: normalizeKyc(data?.kyc_status),
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
