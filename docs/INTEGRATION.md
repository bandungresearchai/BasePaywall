# Integration Guide

> Drop-in paywall integration for websites, APIs, and applications

## 📋 Overview

BasePaywall offers multiple integration patterns:

| Method | Best For | Complexity |
|--------|----------|------------|
| **React Components** | Next.js/React websites | ⭐ Easy |
| **x402 Middleware** | API routes & serverless | ⭐⭐ Medium |
| **x402 Client SDK** | Custom frontends | ⭐⭐ Medium |
| **Direct Contract** | Custom implementations | ⭐⭐⭐ Advanced |

---

## 🚀 Quick Start (5 Minutes)

### Option A: Using Pre-built React Components

**1. Install dependencies:**

```bash
npm install @coinbase/onchainkit wagmi viem @tanstack/react-query
```

**2. Copy the paywall components:**

```bash
# From the BasePaywall repository
cp -r frontend/src/components/PaywallContent.tsx your-project/components/
cp -r frontend/src/hooks/usePaywall.ts your-project/hooks/
cp -r frontend/src/config/contract.ts your-project/config/
```

**3. Configure your contract:**

```typescript
// config/contract.ts
export const CONTRACT_ADDRESS = '0xYourDeployedContract' as const;
export const NETWORK = 'base-sepolia'; // or 'base' for mainnet
```

**4. Add to your page:**

```tsx
import { PaywallContent } from '@/components/PaywallContent';

export default function PremiumPage() {
  return (
    <PaywallContent
      contentId={1}
      previewContent="This is a preview..."
      premiumContent="This is the full premium content!"
    />
  );
}
```

---

### Option B: x402 Protocol for APIs

**1. Add middleware to your API route:**

```typescript
// app/api/premium/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createX402Middleware } from '@/lib/x402';

const x402 = createX402Middleware({
  payTo: '0xYourWalletAddress',
  amount: '1000000000000000', // 0.001 ETH in wei
  network: 'base-sepolia',
  resource: '/api/premium',
  description: 'Premium API access',
});

export async function GET(request: NextRequest) {
  return x402(request, async () => {
    // This code runs only after payment is verified
    return NextResponse.json({
      data: 'Premium content here',
      secret: 'The answer is 42',
    });
  });
}
```

**2. Client-side with automatic payment:**

```typescript
import { X402Client } from '@/lib/x402';
import { sendTransaction } from '@wagmi/core';

const client = new X402Client({
  payerAddress: '0xUserWallet',
  paymentHandler: async (details) => {
    // Handle payment using your preferred wallet library
    const hash = await sendTransaction({
      to: details.payTo,
      value: BigInt(details.maxAmountRequired),
    });
    return hash;
  },
});

// Automatic payment handling
const response = await client.fetch('/api/premium');
const data = await response.json();
```

---

## 📦 Full Integration Patterns

### Pattern 1: Blog/Article Paywall

```tsx
// components/ArticlePaywall.tsx
'use client';

import { usePaywall } from '@/hooks/usePaywall';
import { useAccount } from 'wagmi';

interface ArticlePaywallProps {
  contentId: number;
  preview: React.ReactNode;
  fullContent: React.ReactNode;
  price: string; // e.g., "0.001 ETH"
}

export function ArticlePaywall({ 
  contentId, 
  preview, 
  fullContent,
  price 
}: ArticlePaywallProps) {
  const { address, isConnected } = useAccount();
  const { hasAccess, unlock, isLoading } = usePaywall(contentId);

  if (!isConnected) {
    return (
      <div>
        {preview}
        <div className="paywall-cta">
          <p>Connect wallet to unlock full article</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <div>{fullContent}</div>;
  }

  return (
    <div>
      {preview}
      <div className="paywall-cta">
        <p>Unlock full article for {price}</p>
        <button 
          onClick={unlock} 
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Unlock Now'}
        </button>
      </div>
    </div>
  );
}
```

### Pattern 2: API Rate Limiting with Payments

```typescript
// middleware/paidApi.ts
import { createX402Middleware } from '@/lib/x402';

const PRICING_TIERS = {
  basic: '100000000000000',    // 0.0001 ETH
  premium: '1000000000000000', // 0.001 ETH
  enterprise: '10000000000000000', // 0.01 ETH
};

export function createPaidApiMiddleware(tier: keyof typeof PRICING_TIERS) {
  return createX402Middleware({
    payTo: process.env.PAYMENT_ADDRESS as `0x${string}`,
    amount: PRICING_TIERS[tier],
    network: 'base-sepolia',
    resource: '/api/data',
  });
}

// Usage in route
export async function GET(req: NextRequest) {
  const middleware = createPaidApiMiddleware('premium');
  
  return middleware(req, async () => {
    const data = await fetchPremiumData();
    return NextResponse.json(data);
  });
}
```

### Pattern 3: Multi-Content Creator Dashboard

For V2 multi-tenant setup:

```typescript
// hooks/useCreatorPaywall.ts
import { useContractWrite, useContractRead } from 'wagmi';
import { BASEPAYWALL_V2_ABI, BASEPAYWALL_V2_ADDRESS } from '@/config/contractV2';

export function useCreatorPaywall() {
  // Register as creator
  const { write: registerCreator } = useContractWrite({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'registerCreator',
  });

  // Create content
  const { write: createContent } = useContractWrite({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'createContent',
  });

  // Get creator stats
  const { data: creatorData } = useContractRead({
    address: BASEPAYWALL_V2_ADDRESS,
    abi: BASEPAYWALL_V2_ABI,
    functionName: 'getCreator',
    args: [address],
  });

  return {
    registerCreator,
    createContent: (priceInWei: bigint) => createContent({ args: [priceInWei] }),
    stats: creatorData,
  };
}
```

---

## 🔧 Configuration Reference

### Environment Variables

```env
# Required
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key

# Network Configuration
NEXT_PUBLIC_NETWORK=base-sepolia  # or 'base' for mainnet
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Optional: For V2 multi-tenant
NEXT_PUBLIC_CONTRACT_V2_ADDRESS=0x...
```

### Contract Deployment

**Deploy your own contract:**

```bash
cd contracts

# Build
forge build

# Deploy (V1 - single creator)
forge create ./src/BasePaywall.sol:BasePaywall \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $YOUR_WALLET

# Deploy (V2 - multi-tenant)
forge create ./src/BasePaywallV2.sol:BasePaywallV2 \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $YOUR_WALLET 250  # 2.5% platform fee
```

---

## 🌐 x402 Protocol Reference

### Request Flow

```
┌──────────┐     1. Request      ┌──────────┐
│  Client  │ ─────────────────► │  Server  │
└──────────┘                     └──────────┘
     │                                │
     │     2. 402 + Payment Details   │
     │ ◄───────────────────────────── │
     │                                │
     │   3. Execute on-chain payment  │
     │ ─────────────────────────────► │ (blockchain)
     │                                │
     │   4. Retry with X-Payment      │
     │ ─────────────────────────────► │
     │                                │
     │   5. 200 + Content             │
     │ ◄───────────────────────────── │
```

### HTTP Headers

**Request:**
```
X-Payment: base64-encoded-payment-payload
```

**Response (402):**
```
X-Payment-Required: base64-encoded-payment-details
Content-Type: application/json

{
  "version": "1",
  "network": "base-sepolia",
  "payTo": "0x...",
  "maxAmountRequired": "1000000000000000",
  "resource": "/api/premium",
  "description": "Premium API Access"
}
```

### Payment Payload Structure

```typescript
interface X402PaymentPayload {
  version: '1';
  network: 'base' | 'base-sepolia';
  transactionHash: `0x${string}`;
  payer: `0x${string}`;
}
```

---

## 📱 Framework-Specific Guides

### Next.js App Router

```typescript
// app/premium/page.tsx
import { PaywallContent } from '@/components/PaywallContent';

export default function PremiumPage() {
  return (
    <main>
      <h1>Premium Content</h1>
      <PaywallContent contentId={1} />
    </main>
  );
}
```

### Express.js API

```typescript
import express from 'express';
import { verifyX402Payment } from './x402';

const app = express();

app.get('/api/premium', async (req, res) => {
  const payment = req.headers['x-payment'];
  
  if (!payment) {
    return res.status(402).json({
      version: '1',
      network: 'base-sepolia',
      payTo: process.env.WALLET_ADDRESS,
      maxAmountRequired: '1000000000000000',
      resource: '/api/premium',
    });
  }
  
  const isValid = await verifyX402Payment(payment);
  
  if (!isValid) {
    return res.status(402).json({ error: 'Invalid payment' });
  }
  
  res.json({ content: 'Premium data' });
});
```

### WordPress Plugin (Concept)

```php
<?php
// Shortcode: [basepaywall content_id="1" price="0.001"]
function basepaywall_shortcode($atts, $content = null) {
    $a = shortcode_atts([
        'content_id' => '1',
        'price' => '0.001',
    ], $atts);
    
    return sprintf(
        '<div class="basepaywall" 
              data-content-id="%s" 
              data-price="%s">
            <div class="preview">%s</div>
            <button class="unlock-btn">Unlock for %s ETH</button>
        </div>',
        esc_attr($a['content_id']),
        esc_attr($a['price']),
        wp_trim_words($content, 50),
        esc_html($a['price'])
    );
}
add_shortcode('basepaywall', 'basepaywall_shortcode');
```

---

## ✅ Integration Checklist

- [ ] Deploy contract (V1 or V2 depending on needs)
- [ ] Configure environment variables
- [ ] Install dependencies (`wagmi`, `viem`, `@coinbase/onchainkit`)
- [ ] Set up wallet connection (Coinbase Wallet recommended)
- [ ] Add paywall component or middleware
- [ ] Test on Base Sepolia with testnet ETH
- [ ] Verify contract on BaseScan
- [ ] Deploy to production (Base mainnet)

---

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Contract not found" | Check `CONTRACT_ADDRESS` env var |
| "Network mismatch" | Ensure wallet is on Base Sepolia/Base |
| "Transaction failed" | Check user has sufficient ETH for gas + price |
| "Payment not verified" | Wait for block confirmation (~2s on Base) |

### Getting Help

- 📖 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/bandungresearchai/BasePaywall/issues)
- 💬 [Discussions](https://github.com/bandungresearchai/BasePaywall/discussions)

---

<p align="center">
  <em>Ready to integrate? Start with the Quick Start above!</em>
</p>
