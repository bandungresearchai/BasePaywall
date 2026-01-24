# Extensibility Roadmap

> Future capabilities and extension points for BasePaywall

## 🎯 Vision

BasePaywall is designed as a foundational layer for Web3 content monetization. While the current implementation focuses on **permanent, one-time access**, the architecture supports numerous extensions without breaking changes.

---

## 📍 Current State (v1.0 & v2.0)

### v1.0 - Single Creator
- ✅ One-time ETH payments
- ✅ Permanent access model
- ✅ Single creator per contract
- ✅ HTTP 402 protocol support
- ✅ On-chain payment verification

### v2.0 - Multi-Tenant Platform
- ✅ Multiple creators per contract
- ✅ Self-service creator registration
- ✅ Configurable platform fees (max 10%)
- ✅ Creator dashboards & analytics
- ✅ Content enable/disable controls
- ✅ Emergency pause functionality

### v2.0.1 - UI/UX Improvements (January 2026)
- ✅ Wallet-only authentication (removed social login)
- ✅ Bento UI product grid with CSS Grid Layout
- ✅ Enhanced admin dashboard with charts & analytics
- ✅ Toast notification system with error handling
- ✅ Loading skeletons and empty states
- ✅ Mobile-friendly WalletConnect support

### v3.0 - Time-Limited Access (January 2026)
- ✅ Configurable access duration per content
- ✅ Support for 1 hour to 365 days rental periods
- ✅ Access extension/renewal functionality
- ✅ Expiration tracking and time remaining display
- ✅ Backwards compatible with permanent access

### v4.0 - NFT Access Tokens (January 2026)
- ✅ ERC721 tokens minted on purchase
- ✅ Transferable access via NFT transfer
- ✅ EIP-2981 royalty support for secondary sales
- ✅ Configurable max supply per content
- ✅ Custom metadata URI per content
- ✅ OpenSea and marketplace compatible

---

## 🚀 Future Extensions

### 1. Tiered Content & Bundles (v5.0)

**Status:** 🟠 Under Design - Q2 2026

**Concept:**
Instead of permanent access, allow creators to offer time-bounded unlocks.

```solidity
struct Content {
    // ... existing fields
    uint256 accessDuration; // 0 = permanent, >0 = seconds
}

struct UserAccess {
    bool hasAccess;
    uint256 expiresAt; // 0 = permanent
}

function unlock(uint256 contentId) external payable {
    // ... payment logic
    
    if (content.accessDuration > 0) {
        userAccess[contentId][msg.sender] = UserAccess({
            hasAccess: true,
            expiresAt: block.timestamp + content.accessDuration
        });
    } else {
        userAccess[contentId][msg.sender] = UserAccess({
            hasAccess: true,
            expiresAt: 0 // permanent
        });
    }
}

function checkAccess(uint256 contentId, address user) public view returns (bool) {
    UserAccess memory access = userAccess[contentId][user];
    if (!access.hasAccess) return false;
    if (access.expiresAt == 0) return true; // permanent
    return block.timestamp <= access.expiresAt;
}
```

**Use Cases:**
- 24-hour early access to content
- Weekly/monthly premium memberships
- Time-limited promotional offers
- Rental model for digital assets

---

### 2. NFT-Based Access Tokens (v2.2)

**Status:** 🟡 Planned for Q2 2026

**Concept:**
Mint an NFT as proof of access, enabling transferability and secondary markets.

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasePaywallNFT is BasePaywallV2, ERC721 {
    uint256 public nextTokenId;
    
    // tokenId => contentId mapping
    mapping(uint256 => uint256) public tokenContent;
    
    function unlock(uint256 contentId) external payable override {
        super.unlock(contentId);
        
        // Mint access NFT
        uint256 tokenId = nextTokenId++;
        tokenContent[tokenId] = contentId;
        _mint(msg.sender, tokenId);
    }
    
    function checkAccess(uint256 contentId, address user) public view override returns (bool) {
        // Check if user owns any NFT for this content
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (tokenContent[i] == contentId && ownerOf(i) == user) {
                return true;
            }
        }
        return false;
    }
}
```

**Benefits:**
- **Transferability:** Sell or gift access to others
- **Secondary Market:** Enable resale on OpenSea, etc.
- **Collectibility:** Access becomes a tradeable asset
- **Composability:** Integrate with other NFT protocols

**Considerations:**
- Gas costs for NFT minting
- Creator preference (some may not want transferable access)
- Optional per-content configuration

---

### 3. Tiered Content & Bundles (v2.3)

**Status:** 🟠 Under Design

**Concept:**
Multiple pricing tiers and content bundles.

```solidity
enum Tier { FREE, BASIC, PREMIUM, VIP }

struct TieredContent {
    address creator;
    mapping(Tier => uint256) tierPrices;
    mapping(Tier => bool) tierEnabled;
    Tier minimumTier; // Required tier to access
}

struct ContentBundle {
    uint256[] contentIds;
    uint256 bundlePrice; // Discounted from individual
    bool active;
}

// User's highest tier per creator
mapping(address => mapping(address => Tier)) public userTier;

function purchaseTier(address creator, Tier tier) external payable {
    // One-time payment unlocks all content at or below tier
    userTier[creator][msg.sender] = tier;
}
```

**Features:**
- Bronze/Silver/Gold access levels
- Bundle discounts for multiple content
- Upgrade paths between tiers
- Creator-defined tier benefits

---

### 4. ERC-20 Token Payments (v2.4)

**Status:** ✅ Partially Implemented (IDRX support)

**Current:** IDRX stablecoin support via x402-IDRX middleware

**Planned Expansion:**
- USDC support (native on Base)
- Any ERC-20 token whitelist
- Dynamic pricing oracles

```solidity
interface IERC20 {
    function transferFrom(address, address, uint256) external returns (bool);
}

mapping(address => bool) public acceptedTokens;

function unlockWithToken(
    uint256 contentId, 
    address token, 
    uint256 amount
) external {
    require(acceptedTokens[token], "Token not accepted");
    require(amount >= getTokenPrice(contentId, token), "Insufficient payment");
    
    IERC20(token).transferFrom(msg.sender, address(this), amount);
    
    // Grant access
    hasAccess[contentId][msg.sender] = true;
}
```

---

### 5. Subscription Model (v3.0)

**Status:** 🔴 Future Consideration

**Concept:**
Recurring payment streams for ongoing access.

```solidity
// Using streaming protocols like Sablier or Superfluid
interface IStreamingPayment {
    function createStream(address recipient, uint256 rate) external;
    function cancelStream(uint256 streamId) external;
}

struct Subscription {
    uint256 streamId;
    uint256 monthlyRate;
    uint256 startedAt;
    bool active;
}

function subscribe(address creator) external {
    // Create payment stream
    uint256 streamId = streamingProtocol.createStream(
        creator, 
        subscriptionRate
    );
    
    subscriptions[msg.sender][creator] = Subscription({
        streamId: streamId,
        monthlyRate: subscriptionRate,
        startedAt: block.timestamp,
        active: true
    });
}
```

**Considerations:**
- Integration with streaming payment protocols
- Graceful degradation when payments stop
- Hybrid one-time + subscription models

---

### 6. Content Encryption Layer (v3.1)

**Status:** 🔴 Research Phase

**Concept:**
True content protection with on-chain access control.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Creator   │ ──► │  Encrypted  │ ──► │    User     │
│             │     │   Content   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              Lit Protocol / Threshold Network       │
│         (Decentralized Key Management)              │
└─────────────────────────────────────────────────────┘
```

**Implementation Options:**
1. **Lit Protocol:** Decentralized access control with blockchain conditions
2. **Threshold Network:** Threshold cryptography for key sharing
3. **IPFS + Encryption:** Encrypted content on IPFS, keys controlled by contract

---

## 🔌 Extension Points (For Developers)

### Hook System

The V2 contract can be extended with hooks:

```solidity
interface IPaywallHook {
    function beforeUnlock(uint256 contentId, address user) external returns (bool);
    function afterUnlock(uint256 contentId, address user, uint256 amount) external;
}

// In BasePaywallV2Extended
function unlock(uint256 contentId) external payable {
    if (address(hook) != address(0)) {
        require(hook.beforeUnlock(contentId, msg.sender), "Hook rejected");
    }
    
    // ... existing unlock logic
    
    if (address(hook) != address(0)) {
        hook.afterUnlock(contentId, msg.sender, content.price);
    }
}
```

**Hook Use Cases:**
- Allowlist/blocklist enforcement
- Dynamic pricing adjustments
- External verification requirements
- Cross-chain access sync

### Custom Access Verification

Implement custom `IAccessControl`:

```solidity
interface IAccessControl {
    function hasAccess(uint256 contentId, address user) external view returns (bool);
}

// Example: NFT-gated access
contract NFTGatedAccess is IAccessControl {
    IERC721 public requiredNFT;
    
    function hasAccess(uint256, address user) external view returns (bool) {
        return requiredNFT.balanceOf(user) > 0;
    }
}
```

---

## 📊 Feature Priority Matrix

| Feature | Demand | Complexity | Impact | Priority |
|---------|--------|------------|--------|----------|
| Time-Limited Access | 🔥 High | ⭐ Low | 🎯 High | **P1** |
| NFT Access Tokens | 🔥 High | ⭐⭐ Medium | 🎯 High | **P1** |
| Tiered Content | 📈 Medium | ⭐⭐ Medium | 🎯 High | **P2** |
| USDC Payments | 📈 Medium | ⭐ Low | 📊 Medium | **P2** |
| Subscriptions | 📉 Lower | ⭐⭐⭐ High | 📊 Medium | **P3** |
| Content Encryption | 📈 Medium | ⭐⭐⭐ High | 🎯 High | **P3** |

---

## 🛠️ Contributing Extensions

We welcome community contributions! Here's how to propose new extensions:

### 1. Discussion First
Open a [GitHub Discussion](https://github.com/bandungresearchai/BasePaywall/discussions) with:
- Use case description
- Proposed interface changes
- Breaking change assessment

### 2. Reference Implementation
Create a branch with:
- Smart contract changes (with tests)
- Frontend integration example
- Documentation updates

### 3. Review Process
- Security review for contract changes
- Gas optimization analysis
- Community feedback period

---

## 📅 Release Timeline

```
Q1 2026 ─────┬──── Time-Limited Access (v2.1)
             │
Q2 2026 ─────┼──── NFT Access Tokens (v2.2)
             │     USDC Support (v2.2)
             │
Q3 2026 ─────┼──── Tiered Content (v2.3)
             │     Bundle Pricing (v2.3)
             │
Q4 2026 ─────┼──── Subscription Model (v3.0)
             │     Content Encryption (v3.1)
             │
2027+ ───────┴──── Cross-chain Support
                   DAO Governance
                   Mobile SDKs
```

---

## 💡 Have an Idea?

We'd love to hear your feature requests:

1. 🐛 [Open an Issue](https://github.com/bandungresearchai/BasePaywall/issues/new)
2. 💬 [Start a Discussion](https://github.com/bandungresearchai/BasePaywall/discussions)
3. 🔧 [Submit a PR](https://github.com/bandungresearchai/BasePaywall/pulls)

---

<p align="center">
  <em>BasePaywall is built to grow with your needs</em>
</p>
