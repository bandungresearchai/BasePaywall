// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BasePaywall V3
 * @author BasePaywall Team
 * @notice Multi-tenant Web3 SaaS paywall with time-limited access on Base L2
 * @dev Extends V2 with support for:
 *      - Time-limited access (rental model)
 *      - Permanent access (purchase model)
 *      - Access extension/renewal
 * 
 * Architecture:
 * - Platform Owner: Sets fees, emergency pause, withdraws platform earnings
 * - Creators: Self-register, create content with access duration, set prices, withdraw earnings
 * - Users: Pay for access (permanent or time-limited), renew/extend access
 */
contract BasePaywallV3 is Ownable, ReentrancyGuard, Pausable {
    
    // ============ Constants ============
    
    /// @notice Maximum platform fee (10% = 1000 basis points)
    uint256 public constant MAX_PLATFORM_FEE_BPS = 1000;
    
    /// @notice Basis points denominator (100% = 10000)
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    /// @notice Minimum content price (0.0001 ETH)
    uint256 public constant MIN_CONTENT_PRICE = 0.0001 ether;
    
    /// @notice Maximum content price (10 ETH)
    uint256 public constant MAX_CONTENT_PRICE = 10 ether;

    /// @notice Access duration for permanent access (0 means permanent)
    uint256 public constant PERMANENT_ACCESS = 0;

    /// @notice Minimum access duration (1 hour)
    uint256 public constant MIN_ACCESS_DURATION = 1 hours;

    /// @notice Maximum access duration (365 days)
    uint256 public constant MAX_ACCESS_DURATION = 365 days;

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
        uint256 accessDuration;   // NEW: 0 = permanent, >0 = duration in seconds
    }

    struct UserAccess {
        bool hasAccess;
        uint256 expiresAt;        // 0 = permanent, >0 = timestamp when access expires
        uint256 purchaseCount;    // Number of times user purchased/renewed
    }

    // ============ Mappings ============
    
    /// @notice Creator data by address
    mapping(address => Creator) public creators;
    
    /// @notice Content data by ID
    mapping(uint256 => Content) public contents;
    
    /// @notice Access: contentId => user => UserAccess struct
    mapping(uint256 => mapping(address => UserAccess)) public userAccess;
    
    /// @notice User's unlocked content IDs (includes expired)
    mapping(address => uint256[]) private _userUnlocks;
    
    /// @notice Creator's content IDs
    mapping(address => uint256[]) private _creatorContents;

    // ============ Events ============
    
    event CreatorRegistered(address indexed creator, uint256 timestamp);
    event ContentCreated(address indexed creator, uint256 indexed contentId, uint256 price, uint256 accessDuration);
    event ContentUpdated(uint256 indexed contentId, uint256 price, bool enabled, uint256 accessDuration);
    event ContentUnlocked(address indexed user, uint256 indexed contentId, address indexed creator, uint256 amount, uint256 expiresAt);
    event AccessExtended(address indexed user, uint256 indexed contentId, uint256 newExpiresAt, uint256 amount);
    event CreatorWithdrawal(address indexed creator, uint256 amount);
    event PlatformWithdrawal(address indexed owner, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    // ============ Errors ============
    
    error NotRegistered();
    error AlreadyRegistered();
    error ContentNotFound();
    error ContentDisabled();
    error AlreadyHasAccess();
    error InsufficientPayment(uint256 required, uint256 provided);
    error InvalidPrice(uint256 price);
    error InvalidFee(uint256 fee);
    error InvalidDuration(uint256 duration);
    error NothingToWithdraw();
    error WithdrawalFailed();
    error Unauthorized();
    error NoAccessToExtend();

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
     * @notice Create a new content item with optional time-limited access
     * @param price Price in wei
     * @param accessDuration Access duration in seconds (0 = permanent)
     * @return contentId The new content ID
     */
    function createContent(uint256 price, uint256 accessDuration) external whenNotPaused returns (uint256 contentId) {
        if (!creators[msg.sender].isRegistered) {
            revert NotRegistered();
        }
        if (price < MIN_CONTENT_PRICE || price > MAX_CONTENT_PRICE) {
            revert InvalidPrice(price);
        }
        // Validate access duration
        if (accessDuration != PERMANENT_ACCESS) {
            if (accessDuration < MIN_ACCESS_DURATION || accessDuration > MAX_ACCESS_DURATION) {
                revert InvalidDuration(accessDuration);
            }
        }
        
        contentId = nextContentId++;
        
        contents[contentId] = Content({
            creator: msg.sender,
            price: price,
            enabled: true,
            revenue: 0,
            unlockCount: 0,
            createdAt: block.timestamp,
            accessDuration: accessDuration
        });
        
        creators[msg.sender].contentCount++;
        _creatorContents[msg.sender].push(contentId);
        
        emit ContentCreated(msg.sender, contentId, price, accessDuration);
    }

    /**
     * @notice Create content with permanent access (backwards compatible)
     * @param price Price in wei
     * @return contentId The new content ID
     */
    function createContent(uint256 price) external whenNotPaused returns (uint256 contentId) {
        return this.createContent(price, PERMANENT_ACCESS);
    }
    
    /**
     * @notice Update content price, enabled status, and/or access duration
     * @param contentId Content ID to update
     * @param price New price (0 = keep current)
     * @param enabled Whether content is enabled
     * @param accessDuration New access duration (type(uint256).max = keep current)
     */
    function updateContent(uint256 contentId, uint256 price, bool enabled, uint256 accessDuration) external whenNotPaused {
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

        // Update access duration if not sentinel value
        if (accessDuration != type(uint256).max) {
            if (accessDuration != PERMANENT_ACCESS) {
                if (accessDuration < MIN_ACCESS_DURATION || accessDuration > MAX_ACCESS_DURATION) {
                    revert InvalidDuration(accessDuration);
                }
            }
            content.accessDuration = accessDuration;
        }
        
        content.enabled = enabled;
        
        emit ContentUpdated(contentId, content.price, enabled, content.accessDuration);
    }

    /**
     * @notice Update content (backwards compatible - keeps accessDuration)
     * @param contentId Content ID to update
     * @param price New price (0 = keep current)
     * @param enabled Whether content is enabled
     */
    function updateContent(uint256 contentId, uint256 price, bool enabled) external whenNotPaused {
        this.updateContent(contentId, price, enabled, type(uint256).max);
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
     * @notice Pay to unlock content (first time purchase)
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
        
        UserAccess storage access = userAccess[contentId][msg.sender];
        
        // Check if user already has valid access
        if (_hasValidAccess(contentId, msg.sender)) {
            revert AlreadyHasAccess();
        }
        
        if (msg.value < content.price) {
            revert InsufficientPayment(content.price, msg.value);
        }
        
        // Calculate fee split
        uint256 platformFee = (content.price * platformFeeBps) / BPS_DENOMINATOR;
        uint256 creatorShare = content.price - platformFee;
        
        // Calculate expiration
        uint256 expiresAt = PERMANENT_ACCESS;
        if (content.accessDuration > 0) {
            expiresAt = block.timestamp + content.accessDuration;
        }
        
        // Update access state
        access.hasAccess = true;
        access.expiresAt = expiresAt;
        access.purchaseCount++;
        
        // Track in user unlocks if first time
        if (access.purchaseCount == 1) {
            _userUnlocks[msg.sender].push(contentId);
        }
        
        content.revenue += content.price;
        content.unlockCount++;
        
        creators[content.creator].balance += creatorShare;
        creators[content.creator].totalRevenue += content.price;
        
        platformBalance += platformFee;
        totalRevenue += content.price;
        
        emit ContentUnlocked(msg.sender, contentId, content.creator, content.price, expiresAt);
        
        // Refund excess payment
        _refundExcess(content.price);
    }

    /**
     * @notice Extend/renew access to time-limited content
     * @param contentId Content ID to extend access for
     */
    function extendAccess(uint256 contentId) external payable nonReentrant whenNotPaused {
        Content storage content = contents[contentId];
        
        if (content.creator == address(0)) {
            revert ContentNotFound();
        }
        if (!content.enabled) {
            revert ContentDisabled();
        }
        
        // Can only extend time-limited content
        if (content.accessDuration == PERMANENT_ACCESS) {
            revert InvalidDuration(0);
        }
        
        UserAccess storage access = userAccess[contentId][msg.sender];
        
        // Must have purchased at least once before
        if (access.purchaseCount == 0) {
            revert NoAccessToExtend();
        }
        
        if (msg.value < content.price) {
            revert InsufficientPayment(content.price, msg.value);
        }
        
        // Calculate fee split
        uint256 platformFee = (content.price * platformFeeBps) / BPS_DENOMINATOR;
        uint256 creatorShare = content.price - platformFee;
        
        // Calculate new expiration (extend from current expiration or now if expired)
        uint256 baseTime = access.expiresAt > block.timestamp ? access.expiresAt : block.timestamp;
        uint256 newExpiresAt = baseTime + content.accessDuration;
        
        // Update access state
        access.hasAccess = true;
        access.expiresAt = newExpiresAt;
        access.purchaseCount++;
        
        content.revenue += content.price;
        content.unlockCount++;
        
        creators[content.creator].balance += creatorShare;
        creators[content.creator].totalRevenue += content.price;
        
        platformBalance += platformFee;
        totalRevenue += content.price;
        
        emit AccessExtended(msg.sender, contentId, newExpiresAt, content.price);
        
        // Refund excess payment
        _refundExcess(content.price);
    }

    // ============ Internal Functions ============

    /**
     * @notice Check if user has valid (non-expired) access
     */
    function _hasValidAccess(uint256 contentId, address user) internal view returns (bool) {
        UserAccess storage access = userAccess[contentId][user];
        
        if (!access.hasAccess) return false;
        
        // Permanent access never expires
        if (access.expiresAt == PERMANENT_ACCESS) return true;
        
        // Time-limited access - check if expired
        return block.timestamp <= access.expiresAt;
    }

    /**
     * @notice Refund excess payment
     */
    function _refundExcess(uint256 price) internal {
        if (msg.value > price) {
            uint256 refund = msg.value - price;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            if (!success) {
                revert WithdrawalFailed();
            }
        }
    }

    // ============ View Functions ============
    
    /**
     * @notice Check if user has valid access to content
     * @param contentId Content ID
     * @param user User address
     * @return True if user has valid (non-expired) access
     */
    function checkAccess(uint256 contentId, address user) external view returns (bool) {
        Content storage content = contents[contentId];
        // Creator always has access to own content
        if (content.creator == user) return true;
        return _hasValidAccess(contentId, user);
    }

    /**
     * @notice Get user's access details for a content
     * @param contentId Content ID
     * @param user User address
     * @return hasAccess Whether user has ever purchased
     * @return expiresAt When access expires (0 = permanent)
     * @return isActive Whether access is currently active
     * @return timeRemaining Seconds until expiration (0 if permanent or expired)
     */
    function getAccessDetails(uint256 contentId, address user) external view returns (
        bool hasAccess,
        uint256 expiresAt,
        bool isActive,
        uint256 timeRemaining
    ) {
        UserAccess storage access = userAccess[contentId][user];
        hasAccess = access.hasAccess;
        expiresAt = access.expiresAt;
        isActive = _hasValidAccess(contentId, user);
        
        if (access.expiresAt > 0 && access.expiresAt > block.timestamp) {
            timeRemaining = access.expiresAt - block.timestamp;
        } else {
            timeRemaining = 0;
        }
    }
    
    /**
     * @notice Get user's unlocked content IDs (includes expired)
     * @param user User address
     * @return Array of content IDs
     */
    function getUserUnlocks(address user) external view returns (uint256[] memory) {
        return _userUnlocks[user];
    }

    /**
     * @notice Get user's currently active content IDs (excludes expired)
     * @param user User address
     * @return Array of active content IDs
     */
    function getUserActiveContent(address user) external view returns (uint256[] memory) {
        uint256[] memory allUnlocks = _userUnlocks[user];
        uint256 activeCount = 0;
        
        // First pass: count active
        for (uint256 i = 0; i < allUnlocks.length; i++) {
            if (_hasValidAccess(allUnlocks[i], user)) {
                activeCount++;
            }
        }
        
        // Second pass: populate array
        uint256[] memory activeContent = new uint256[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < allUnlocks.length; i++) {
            if (_hasValidAccess(allUnlocks[i], user)) {
                activeContent[idx++] = allUnlocks[i];
            }
        }
        
        return activeContent;
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
     * @notice Get creator data
     * @param creator Creator address
     * @return isRegistered Whether registered
     * @return balance Withdrawable balance
     * @return contentCount Number of contents
     * @return totalRevenue All-time revenue
     * @return registeredAt Registration timestamp
     */
    function getCreator(address creator) external view returns (
        bool isRegistered,
        uint256 balance,
        uint256 contentCount,
        uint256 totalRevenue,
        uint256 registeredAt
    ) {
        Creator storage c = creators[creator];
        return (c.isRegistered, c.balance, c.contentCount, c.totalRevenue, c.registeredAt);
    }
    
    /**
     * @notice Get content data
     * @param contentId Content ID
     * @return creator Creator address
     * @return price Price in wei
     * @return enabled Whether enabled
     * @return revenue Total revenue
     * @return unlockCount Number of unlocks
     * @return accessDuration Access duration (0 = permanent)
     */
    function getContent(uint256 contentId) external view returns (
        address creator,
        uint256 price,
        bool enabled,
        uint256 revenue,
        uint256 unlockCount,
        uint256 accessDuration
    ) {
        Content storage c = contents[contentId];
        return (c.creator, c.price, c.enabled, c.revenue, c.unlockCount, c.accessDuration);
    }
    
    /**
     * @notice Get platform stats
     * @return totalCreatorsCount Total creators
     * @return totalContents Total content items
     * @return totalRevenueAmount Total revenue
     * @return platformBalanceAmount Platform balance
     */
    function getPlatformStats() external view returns (
        uint256 totalCreatorsCount,
        uint256 totalContents,
        uint256 totalRevenueAmount,
        uint256 platformBalanceAmount
    ) {
        return (totalCreators, nextContentId - 1, totalRevenue, platformBalance);
    }

    // ============ Platform Admin Functions ============
    
    /**
     * @notice Update platform fee
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
     * @notice Withdraw platform balance
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
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
