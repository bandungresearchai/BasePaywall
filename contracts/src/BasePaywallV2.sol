// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BasePaywall V2
 * @author BasePaywall Team
 * @notice Multi-tenant Web3 SaaS paywall on Base L2
 * @dev Pay-per-content model with platform fees. No subscriptions, no NFTs.
 * 
 * Architecture:
 * - Platform Owner: Sets fees, emergency pause, withdraws platform earnings
 * - Creators: Self-register, create content, set prices, withdraw earnings
 * - Users: Pay once per content, permanent access
 */
contract BasePaywallV2 is Ownable, ReentrancyGuard, Pausable {
    
    // ============ Constants ============
    
    /// @notice Maximum platform fee (10% = 1000 basis points)
    uint256 public constant MAX_PLATFORM_FEE_BPS = 1000;
    
    /// @notice Basis points denominator (100% = 10000)
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    /// @notice Minimum content price (0.0001 ETH)
    uint256 public constant MIN_CONTENT_PRICE = 0.0001 ether;
    
    /// @notice Maximum content price (10 ETH)
    uint256 public constant MAX_CONTENT_PRICE = 10 ether;

    // ============ State Variables ============
    
    /// @notice Platform fee in basis points (e.g., 250 = 2.5%)
    uint256 public platformFeeBps;
    
    /// @notice Accumulated platform fees available for withdrawal
    uint256 public platformBalance;
    
    /// @notice Global content ID counter
    uint256 public nextContentId;
    
    /// @notice Total number of registered creators
    uint256 public totalCreators;
    
    /// @notice Total platform revenue (all-time)
    uint256 public totalRevenue;

    // ============ Structs ============
    
    struct Creator {
        bool isRegistered;
        uint256 balance;          // Withdrawable earnings
        uint256 contentCount;     // Number of content items created
        uint256 totalRevenue;     // All-time revenue
        uint256 registeredAt;
    }
    
    struct Content {
        address creator;
        uint256 price;
        bool enabled;
        uint256 revenue;
        uint256 unlockCount;
        uint256 createdAt;
    }

    // ============ Mappings ============
    
    /// @notice Creator data by address
    mapping(address => Creator) public creators;
    
    /// @notice Content data by ID
    mapping(uint256 => Content) public contents;
    
    /// @notice Access: contentId => user => hasPaid
    mapping(uint256 => mapping(address => bool)) public hasAccess;
    
    /// @notice User's unlocked content IDs
    mapping(address => uint256[]) private _userUnlocks;
    
    /// @notice Creator's content IDs
    mapping(address => uint256[]) private _creatorContents;

    // ============ Events ============
    
    event CreatorRegistered(address indexed creator, uint256 timestamp);
    event ContentCreated(address indexed creator, uint256 indexed contentId, uint256 price);
    event ContentUpdated(uint256 indexed contentId, uint256 price, bool enabled);
    event ContentUnlocked(address indexed user, uint256 indexed contentId, address indexed creator, uint256 amount);
    event CreatorWithdrawal(address indexed creator, uint256 amount);
    event PlatformWithdrawal(address indexed owner, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    // ============ Errors ============
    
    error NotRegistered();
    error AlreadyRegistered();
    error ContentNotFound();
    error ContentDisabled();
    error AlreadyUnlocked();
    error InsufficientPayment(uint256 required, uint256 provided);
    error InvalidPrice(uint256 price);
    error InvalidFee(uint256 fee);
    error NothingToWithdraw();
    error WithdrawalFailed();
    error Unauthorized();

    // ============ Constructor ============
    
    /**
     * @notice Initialize the platform
     * @param _owner Platform owner address
     * @param _platformFeeBps Initial platform fee in basis points
     */
    constructor(address _owner, uint256 _platformFeeBps) Ownable(_owner) {
        if (_platformFeeBps > MAX_PLATFORM_FEE_BPS) {
            revert InvalidFee(_platformFeeBps);
        }
        platformFeeBps = _platformFeeBps;
        nextContentId = 1;
    }

    // ============ Creator Functions ============
    
    /**
     * @notice Register as a creator (self-service, no approval)
     */
    function registerCreator() external whenNotPaused {
        if (creators[msg.sender].isRegistered) {
            revert AlreadyRegistered();
        }
        
        creators[msg.sender] = Creator({
            isRegistered: true,
            balance: 0,
            contentCount: 0,
            totalRevenue: 0,
            registeredAt: block.timestamp
        });
        
        totalCreators++;
        
        emit CreatorRegistered(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Create a new content item
     * @param price Price in wei
     * @return contentId The new content ID
     */
    function createContent(uint256 price) external whenNotPaused returns (uint256 contentId) {
        if (!creators[msg.sender].isRegistered) {
            revert NotRegistered();
        }
        if (price < MIN_CONTENT_PRICE || price > MAX_CONTENT_PRICE) {
            revert InvalidPrice(price);
        }
        
        contentId = nextContentId++;
        
        contents[contentId] = Content({
            creator: msg.sender,
            price: price,
            enabled: true,
            revenue: 0,
            unlockCount: 0,
            createdAt: block.timestamp
        });
        
        creators[msg.sender].contentCount++;
        _creatorContents[msg.sender].push(contentId);
        
        emit ContentCreated(msg.sender, contentId, price);
    }
    
    /**
     * @notice Update content price and/or enabled status
     * @param contentId Content ID to update
     * @param price New price (0 = keep current)
     * @param enabled Whether content is enabled
     */
    function updateContent(uint256 contentId, uint256 price, bool enabled) external whenNotPaused {
        Content storage content = contents[contentId];
        
        if (content.creator == address(0)) {
            revert ContentNotFound();
        }
        if (content.creator != msg.sender) {
            revert Unauthorized();
        }
        
        if (price > 0) {
            if (price < MIN_CONTENT_PRICE || price > MAX_CONTENT_PRICE) {
                revert InvalidPrice(price);
            }
            content.price = price;
        }
        
        content.enabled = enabled;
        
        emit ContentUpdated(contentId, content.price, enabled);
    }
    
    /**
     * @notice Withdraw creator earnings
     */
    function withdrawCreatorBalance() external nonReentrant whenNotPaused {
        Creator storage creator = creators[msg.sender];
        
        if (!creator.isRegistered) {
            revert NotRegistered();
        }
        
        uint256 amount = creator.balance;
        if (amount == 0) {
            revert NothingToWithdraw();
        }
        
        creator.balance = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert WithdrawalFailed();
        }
        
        emit CreatorWithdrawal(msg.sender, amount);
    }

    // ============ User Functions ============
    
    /**
     * @notice Pay to unlock content
     * @param contentId Content ID to unlock
     */
    function unlock(uint256 contentId) external payable nonReentrant whenNotPaused {
        Content storage content = contents[contentId];
        
        if (content.creator == address(0)) {
            revert ContentNotFound();
        }
        if (!content.enabled) {
            revert ContentDisabled();
        }
        if (hasAccess[contentId][msg.sender]) {
            revert AlreadyUnlocked();
        }
        if (msg.value < content.price) {
            revert InsufficientPayment(content.price, msg.value);
        }
        
        // Calculate fee split
        uint256 platformFee = (content.price * platformFeeBps) / BPS_DENOMINATOR;
        uint256 creatorShare = content.price - platformFee;
        
        // Update state
        hasAccess[contentId][msg.sender] = true;
        _userUnlocks[msg.sender].push(contentId);
        
        content.revenue += content.price;
        content.unlockCount++;
        
        creators[content.creator].balance += creatorShare;
        creators[content.creator].totalRevenue += content.price;
        
        platformBalance += platformFee;
        totalRevenue += content.price;
        
        emit ContentUnlocked(msg.sender, contentId, content.creator, content.price);
        
        // Refund excess payment
        if (msg.value > content.price) {
            uint256 refund = msg.value - content.price;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            if (!success) {
                revert WithdrawalFailed();
            }
        }
    }

    // ============ View Functions ============
    
    /**
     * @notice Check if user has access to content
     * @param contentId Content ID
     * @param user User address
     * @return True if user has access (paid or is creator)
     */
    function checkAccess(uint256 contentId, address user) external view returns (bool) {
        Content storage content = contents[contentId];
        // Creator always has access to own content
        if (content.creator == user) return true;
        return hasAccess[contentId][user];
    }
    
    /**
     * @notice Get user's unlocked content IDs
     * @param user User address
     * @return Array of content IDs
     */
    function getUserUnlocks(address user) external view returns (uint256[] memory) {
        return _userUnlocks[user];
    }
    
    /**
     * @notice Get creator's content IDs
     * @param creator Creator address
     * @return Array of content IDs
     */
    function getCreatorContents(address creator) external view returns (uint256[] memory) {
        return _creatorContents[creator];
    }
    
    /**
     * @notice Get content details
     * @param contentId Content ID
     * @return creator Content creator address
     * @return price Content price
     * @return enabled Whether content is enabled
     * @return revenue Total revenue
     * @return unlockCount Number of unlocks
     */
    function getContent(uint256 contentId) external view returns (
        address creator,
        uint256 price,
        bool enabled,
        uint256 revenue,
        uint256 unlockCount
    ) {
        Content storage content = contents[contentId];
        return (
            content.creator,
            content.price,
            content.enabled,
            content.revenue,
            content.unlockCount
        );
    }
    
    /**
     * @notice Get creator details
     * @param creator Creator address
     * @return isRegistered Whether creator is registered
     * @return balance Withdrawable balance
     * @return contentCount Number of content items
     * @return creatorTotalRevenue Total revenue earned
     */
    function getCreator(address creator) external view returns (
        bool isRegistered,
        uint256 balance,
        uint256 contentCount,
        uint256 creatorTotalRevenue
    ) {
        Creator storage c = creators[creator];
        return (c.isRegistered, c.balance, c.contentCount, c.totalRevenue);
    }
    
    /**
     * @notice Get platform statistics
     * @return creators_ Total registered creators
     * @return contents_ Total content items
     * @return revenue_ Total platform revenue
     * @return platformBal_ Platform balance available for withdrawal
     */
    function getPlatformStats() external view returns (
        uint256 creators_,
        uint256 contents_,
        uint256 revenue_,
        uint256 platformBal_
    ) {
        return (totalCreators, nextContentId - 1, totalRevenue, platformBalance);
    }

    // ============ Platform Owner Functions ============
    
    /**
     * @notice Update platform fee (owner only)
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_PLATFORM_FEE_BPS) {
            revert InvalidFee(newFeeBps);
        }
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }
    
    /**
     * @notice Withdraw platform fees (owner only)
     */
    function withdrawPlatformBalance() external onlyOwner nonReentrant {
        uint256 amount = platformBalance;
        if (amount == 0) {
            revert NothingToWithdraw();
        }
        
        platformBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) {
            revert WithdrawalFailed();
        }
        
        emit PlatformWithdrawal(owner(), amount);
    }
    
    /**
     * @notice Pause platform (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause platform
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
