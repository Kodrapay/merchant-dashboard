export type MerchantUser = {
  email: string;
  businessName: string;
  kycStatus: "not_started" | "pending" | "approved" | "rejected";
  hasDemoData?: boolean;
  createdAt?: string;
};

const STORAGE_KEY = "merchantUser";

export const getMerchantUser = (): MerchantUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MerchantUser> & { hasKyc?: boolean };
    if (!parsed.kycStatus) {
      parsed.kycStatus = parsed.hasKyc ? "approved" : "not_started";
    }
    return parsed as MerchantUser;
  } catch {
    return null;
  }
};

export const setMerchantUser = (user: MerchantUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const clearMerchantUser = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const deriveBusinessName = (email: string) => {
  const prefix = email.split("@")[0] || "Merchant";
  return prefix
    .split(/[\.\-\_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};
