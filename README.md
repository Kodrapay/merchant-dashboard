# Merchant Dashboard

The merchant dashboard for KodraPay provides merchants with insights and management tools for their payment operations including:

- Dashboard overview with key metrics
- Transaction management and tracking
- Revenue analytics
- API key management
- Wallet and balance management
- Payout scheduling
- Settlement tracking
- Checkout integration
- Webhook management

## Getting Started

### Prerequisites

- Node.js 18+ and npm/bun
- API Gateway running on `http://localhost:8000`

### Installation

```bash
cd merchant-dashboard
npm install
# or
bun install
```

### Environment Variables

Create a `.env.local` file:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=Merchant Dashboard
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` (or the port shown in console)

### Build

```bash
npm run build
```

## Architecture

### Services Used

- **Merchant Service** (Port 7002): Merchant profile and settings
- **Auth Service** (Port 7001): Authentication and authorization
- **Transaction Service** (Port 7004): Transaction data and search
- **Checkout Service** (Port 7005): Checkout operations
- **Wallet Ledger Service** (Port 7007): Wallet and balance information
- **Payout Service** (Port 7009): Payout scheduling and management
- **Settlement Service** (Port 7008): Settlement information
- **Fee Service** (Port 7017): Fee information and calculations
- **FX Service** (Port 7018): Exchange rates and conversions
- **Webhook Service** (Port 7006): Webhook configuration and logs

### API Integration

All API calls go through the API Gateway at port 7000. See `src/lib/api-client.ts` for endpoint configuration.

## Structure

```
merchant-dashboard/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   │   ├── MerchantDashboard.tsx
│   │   ├── Checkout.tsx
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── lib/             # Utilities and API client
│   │   ├── api-client.ts
│   │   └── utils.ts
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx
│   └── main.tsx
├── .env.local           # Local environment configuration
└── package.json
```

## Available Routes

- `/` - Home page
- `/merchant/login` - Merchant authentication
- `/merchant/signup` - Merchant signup
- `/merchant/kyc` - KYC capture for new merchants
- `/dashboard` - Merchant dashboard (alias of `/merchant`)
- `/merchant` - Overview dashboard
- `/merchant/transactions` - Transaction history
- `/merchant/payouts` - Payouts and balances
- `/merchant/settings` - Merchant settings (includes API keys & webhooks)
- `/merchant/settings` - Merchant settings
- `/checkout` - Checkout page
- `*` - 404 Not Found

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Routing
- **React Query** - Data fetching
- **Zod** - Schema validation

## Development Notes

- Use the API client configuration in `src/lib/api-client.ts` for all API calls
- Ensure auth token is properly stored and sent with requests
- Components use shadcn/ui for consistent styling
- API keys are managed securely and should never be exposed in client-side code

## TODO

- KYC flow pages (document upload, verification steps, statuses)
