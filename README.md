# BasePaywall

> Decentralized HTTP 402 paywall on Base L2

BasePaywall is an on-chain content paywall that implements the HTTP 402 "Payment Required" model on Base network. Pay once with ETH to unlock premium content permanently—no subscriptions, no recurring fees.

![Base](https://img.shields.io/badge/Base-0052FF?style=flat&logo=coinbase&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![OnchainKit](https://img.shields.io/badge/OnchainKit-0052FF?style=flat&logo=coinbase&logoColor=white)

## 🌟 Features

- **On-Chain Payment Tracking**: All payments recorded immutably on Base blockchain
- **One-Time Payment**: Pay once, access forever—no subscriptions
- **Wallet Integration**: Seamless connection with Coinbase Wallet and other Web3 wallets
- **HTTP 402 Model**: Implements the "Payment Required" standard for web monetization
- **Low Gas Fees**: Built on Base L2 for minimal transaction costs
- **Owner Controls**: Content creators can update content and withdraw funds

## 🏗️ Architecture

```
BasePaywall/
├── contracts/              # Solidity smart contracts (Foundry)
│   ├── src/
│   │   └── BasePaywall.sol
│   ├── test/
│   │   └── BasePaywall.t.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   └── foundry.toml
├── frontend/              # Next.js frontend (OnchainKit)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── config/
│   │   └── hooks/
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Base L2 (Ethereum L2) |
| **Smart Contract** | Solidity 0.8.20 |
| **Contract Framework** | Foundry |
| **Frontend** | Next.js 14, React 18 |
| **Styling** | Tailwind CSS |
| **Web3 Integration** | Coinbase OnchainKit, wagmi, viem |
| **Wallet Support** | Coinbase Wallet, WalletConnect |

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for smart contracts)
- A Web3 wallet (Coinbase Wallet recommended)
- Base Sepolia ETH for testing (get from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/bandungresearchai/BasePaywall.git
cd BasePaywall
```

### 2. Smart Contract Setup

```bash
cd contracts

# Install Foundry dependencies
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Build contracts
forge build

# Run tests
forge test -vvv
```

### 3. Deploy to Base Sepolia

```bash
# Set up your deployer account
cast wallet import deployer --interactive
# Enter your private key when prompted

# Deploy the contract
forge create ./src/BasePaywall.sol:BasePaywall \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --account deployer \
  --constructor-args <YOUR_WALLET_ADDRESS>

# Note the deployed contract address!
```

Alternatively, use the deployment script:

```bash
# Set PRIVATE_KEY in .env first
forge script script/Deploy.s.sol:DeployBasePaywall \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your values:
# - NEXT_PUBLIC_ONCHAINKIT_API_KEY (from https://portal.cdp.coinbase.com/)
# - NEXT_PUBLIC_CONTRACT_ADDRESS (from deployment)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Configuration

### Smart Contract Environment (contracts/.env)

```env
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
BASE_RPC_URL="https://mainnet.base.org"
BASESCAN_API_KEY="your_basescan_api_key"
```

### Frontend Environment (frontend/.env.local)

```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_onchainkit_api_key"
NEXT_PUBLIC_CONTRACT_ADDRESS="0xYourDeployedContractAddress"
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
NEXT_PUBLIC_NETWORK="sepolia"
```

## 📖 Usage

### For Users

1. **Connect Wallet**: Click "Connect" and select your Web3 wallet
2. **View Content**: See the locked premium content preview
3. **Make Payment**: Click "Unlock Content" and confirm the transaction (0.001 ETH)
4. **Access Content**: Once confirmed, the content is permanently unlocked for your address

### For Content Creators

1. Deploy the contract with your address as the owner
2. Update the locked content using `setContent()`
3. Withdraw accumulated payments using `withdraw()`
4. Modify the price by redeploying (price is a constant)

## 🔗 Contract Functions

| Function | Description |
|----------|-------------|
| `pay()` | Pay to unlock content (requires PRICE wei) |
| `content()` | Get locked content (reverts if not paid) |
| `checkHasPaid(address)` | Check if an address has paid |
| `getPrice()` | Get the unlock price in wei |
| `setContent(string)` | Update locked content (owner only) |
| `withdraw()` | Withdraw accumulated funds (owner only) |

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL`
   - `NEXT_PUBLIC_NETWORK`
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
cd frontend
vercel
```

### Contract Verification

```bash
forge verify-contract <CONTRACT_ADDRESS> BasePaywall \
  --chain-id 84532 \
  --etherscan-api-key $BASESCAN_API_KEY
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
forge test -vvv

# With gas report
forge test --gas-report

# With coverage
forge coverage
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## 🗺️ Roadmap

- [ ] Multi-tier pricing support
- [ ] NFT-based access tokens
- [ ] ERC-20 token payments
- [ ] Time-limited access
- [ ] Content encryption
- [ ] Creator dashboard
- [ ] Revenue sharing

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Base](https://base.org) - Ethereum L2 network
- [Coinbase OnchainKit](https://onchainkit.xyz) - Web3 components
- [Foundry](https://book.getfoundry.sh) - Smart contract development
- [OpenZeppelin](https://openzeppelin.com) - Secure contract libraries

---

## 📝 Devfolio Submission

### Project Name
**BasePaywall**

### Tagline
Decentralized HTTP 402 paywall on Base L2 — Pay once, access forever.

### Problem it Solves
Traditional content monetization relies on centralized platforms with:
- Recurring subscription fatigue
- High platform fees (30%+ on most platforms)
- Centralized control over creator content
- No transparent payment verification

Creators need a decentralized, trustless way to monetize content with one-time payments.

### Solution
BasePaywall implements the HTTP 402 "Payment Required" model on Base L2:
- **One-time payment**: Users pay once and get permanent access
- **On-chain verification**: Payment status stored immutably on blockchain
- **Low fees**: Base L2 offers minimal transaction costs
- **Creator ownership**: Direct wallet-to-wallet payments
- **Transparent**: Anyone can verify payment status on-chain

### Challenges Faced
- Bridging Web2 UX expectations with Web3 payment flows
- Handling wallet connection edge cases across different providers
- Optimizing gas usage while maintaining security
- Creating intuitive UI for blockchain-unfamiliar users

### Technologies Used
- **Blockchain**: Base L2 (Ethereum Layer 2)
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin
- **Development**: Foundry (forge, cast)
- **Frontend**: Next.js 14, React 18, TypeScript
- **Web3**: Coinbase OnchainKit, wagmi, viem
- **Styling**: Tailwind CSS
- **Wallet**: Coinbase Wallet, WalletConnect

### Links
- **GitHub**: https://github.com/bandungresearchai/BasePaywall
- **Live Demo**: [Your Vercel URL]
- **Contract**: [Your Base Sepolia Contract Address]

---

<p align="center">
  Built with 💙 on <a href="https://base.org">Base</a>
</p>