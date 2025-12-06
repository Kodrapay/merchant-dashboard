// Merchant Dashboard API Client Configuration
// All requests flow through the API Gateway
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = {
  base: API_BASE_URL,
  // Auth Service (Port 7001)
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    verify: `${API_BASE_URL}/auth/verify`,
    refresh: `${API_BASE_URL}/auth/refresh`,
  },

  // Merchant Service (Port 7002)
  merchants: {
    list: `${API_BASE_URL}/merchants`,
    get: (id: string) => `${API_BASE_URL}/merchants/${id}`,
    profile: `${API_BASE_URL}/merchants/profile`,
    settings: `${API_BASE_URL}/merchants/settings`,
    apiKeys: (id: string) => `${API_BASE_URL}/merchants/${id}/api-keys`,
    rotateApiKey: (id: string) => `${API_BASE_URL}/merchants/${id}/api-keys/rotate`,
  },

  // Payment Links (via Merchant Service)
  paymentLinks: {
    create: `${API_BASE_URL}/payment-links`,
    list: (merchantId: string) => `${API_BASE_URL}/merchants/${merchantId}/payment-links`,
    get: (id: string) => `${API_BASE_URL}/payment-links/${id}`,
    delete: (id: string, merchantId?: string) =>
      `${API_BASE_URL}/payment-links/${id}${merchantId ? `?merchant_id=${merchantId}` : ""}`,
  },

  // Transaction Service (Port 7004)
  transactions: {
    list: `${API_BASE_URL}/transactions`,
    get: (id: string) => `${API_BASE_URL}/transactions/${id}`,
    search: `${API_BASE_URL}/transactions/search`,
  },

  // Checkout Service (Port 7005)
  checkout: {
    create: `${API_BASE_URL}/checkout`,
    get: (id: string) => `${API_BASE_URL}/checkout/${id}`,
    process: `${API_BASE_URL}/checkout/process`,
  },

  // Wallet Ledger Service (Port 7007)
  wallets: {
    list: `${API_BASE_URL}/wallets`,
    get: (id: string) => `${API_BASE_URL}/wallets/${id}`,
    ledger: `${API_BASE_URL}/wallets/ledger`,
  },

  // Payout Service (Port 7009)
  payouts: {
    list: `${API_BASE_URL}/payouts`,
    get: (id: string) => `${API_BASE_URL}/payouts/${id}`,
    schedule: `${API_BASE_URL}/payouts/schedule`,
  },

  // Settlement Service (Port 7008)
  settlement: {
    list: `${API_BASE_URL}/settlements`,
    get: (id: string) => `${API_BASE_URL}/settlements/${id}`,
    reconcile: `${API_BASE_URL}/settlements/reconcile`,
  },

  // Fee Service (Port 7017)
  fees: {
    list: `${API_BASE_URL}/fees`,
    calculate: `${API_BASE_URL}/fees/calculate`,
    rules: `${API_BASE_URL}/fees/rules`,
  },

  // FX Service (Port 7018)
  rates: {
    list: `${API_BASE_URL}/rates`,
    convert: `${API_BASE_URL}/rates/convert`,
    historical: `${API_BASE_URL}/rates/historical`,
  },

  // Webhook Service (Port 7006)
  webhooks: {
    list: `${API_BASE_URL}/webhooks`,
    get: (id: string) => `${API_BASE_URL}/webhooks/${id}`,
    logs: `${API_BASE_URL}/webhooks/logs`,
  },

  // Dispute Service (Port 7013)
  disputes: {
    list: `${API_BASE_URL}/disputes`,
    create: `${API_BASE_URL}/disputes`,
    get: (id: string) => `${API_BASE_URL}/disputes/${id}`,
    evidence: (id: string) => `${API_BASE_URL}/disputes/${id}/evidence`,
  },
};

export async function fetchFromAPI(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
