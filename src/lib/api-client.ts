// Merchant Dashboard API Client Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

// Service endpoints (accessed directly)
const SERVICES = {
  AUTH_SERVICE: "http://localhost:7001",
  MERCHANT_SERVICE: "http://localhost:7002",
  TRANSACTION_SERVICE: "http://localhost:7004",
  CHECKOUT_SERVICE: "http://localhost:7005",
  WALLET_LEDGER_SERVICE: "http://localhost:7007",
  SETTLEMENT_SERVICE: "http://localhost:7008",
  PAYOUT_SERVICE: "http://localhost:7009",
  FEE_SERVICE: "http://localhost:7017",
  FX_SERVICE: "http://localhost:7018",
  WEBHOOK_SERVICE: "http://localhost:7006",
};

export const apiClient = {
  // Auth Service (Port 7001)
  auth: {
    login: `${SERVICES.AUTH_SERVICE}/auth/login`,
    register: `${SERVICES.AUTH_SERVICE}/auth/register`,
    verify: `${SERVICES.AUTH_SERVICE}/auth/verify`,
    refresh: `${SERVICES.AUTH_SERVICE}/auth/refresh`,
  },

  // Merchant Service (Port 7002)
  merchants: {
    list: `${SERVICES.MERCHANT_SERVICE}/merchants`,
    get: (id: string) => `${SERVICES.MERCHANT_SERVICE}/merchants/${id}`,
    profile: `${SERVICES.MERCHANT_SERVICE}/merchants/profile`,
    settings: `${SERVICES.MERCHANT_SERVICE}/merchants/settings`,
  },

  // Transaction Service (Port 7004)
  transactions: {
    list: `${SERVICES.TRANSACTION_SERVICE}/transactions`,
    get: (id: string) => `${SERVICES.TRANSACTION_SERVICE}/transactions/${id}`,
    search: `${SERVICES.TRANSACTION_SERVICE}/transactions/search`,
  },

  // Checkout Service (Port 7005)
  checkout: {
    create: `${SERVICES.CHECKOUT_SERVICE}/checkout`,
    get: (id: string) => `${SERVICES.CHECKOUT_SERVICE}/checkout/${id}`,
    process: `${SERVICES.CHECKOUT_SERVICE}/checkout/process`,
  },

  // Wallet Ledger Service (Port 7007)
  wallets: {
    list: `${SERVICES.WALLET_LEDGER_SERVICE}/wallets`,
    get: (id: string) => `${SERVICES.WALLET_LEDGER_SERVICE}/wallets/${id}`,
    ledger: `${SERVICES.WALLET_LEDGER_SERVICE}/wallets/ledger`,
  },

  // Payout Service (Port 7009)
  payouts: {
    list: `${SERVICES.PAYOUT_SERVICE}/payouts`,
    get: (id: string) => `${SERVICES.PAYOUT_SERVICE}/payouts/${id}`,
    schedule: `${SERVICES.PAYOUT_SERVICE}/payouts/schedule`,
  },

  // Settlement Service (Port 7008)
  settlement: {
    list: `${SERVICES.SETTLEMENT_SERVICE}/settlements`,
    get: (id: string) => `${SERVICES.SETTLEMENT_SERVICE}/settlements/${id}`,
    reconcile: `${SERVICES.SETTLEMENT_SERVICE}/settlements/reconcile`,
  },

  // Fee Service (Port 7017)
  fees: {
    list: `${SERVICES.FEE_SERVICE}/fees`,
    calculate: `${SERVICES.FEE_SERVICE}/fees/calculate`,
    rules: `${SERVICES.FEE_SERVICE}/fees/rules`,
  },

  // FX Service (Port 7018)
  rates: {
    list: `${SERVICES.FX_SERVICE}/rates`,
    convert: `${SERVICES.FX_SERVICE}/rates/convert`,
    historical: `${SERVICES.FX_SERVICE}/rates/historical`,
  },

  // Webhook Service (Port 7006)
  webhooks: {
    list: `${SERVICES.WEBHOOK_SERVICE}/webhooks`,
    get: (id: string) => `${SERVICES.WEBHOOK_SERVICE}/webhooks/${id}`,
    logs: `${SERVICES.WEBHOOK_SERVICE}/webhooks/logs`,
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
