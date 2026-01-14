// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title BasePaywall
 * @dev On-chain content paywall implementing HTTP 402 "Payment Required" model on Base L2
 * @notice Users pay per content item to unlock gated content
 */
contract BasePaywall is Ownable, ReentrancyGuard, ERC721 {
    /// @notice Default price for content (in wei)
    uint256 public constant DEFAULT_PRICE = 0.001 ether;

    /// @notice Price per content ID (in wei)
    mapping(uint256 => uint256) public contentPrice;

    /// @notice Payment status per content ID per user
    mapping(uint256 => mapping(address => bool)) public hasPaid;

    /// @notice Content enabled status (true = enabled, false = disabled)
    mapping(uint256 => bool) public contentEnabled;

    /// @notice Revenue per content ID (total collected)
    mapping(uint256 => uint256) public contentRevenue;

    /// @notice Number of unlocks per content ID
    mapping(uint256 => uint256) public contentUnlockCount;

    /// @notice List of content IDs unlocked by each user
    mapping(address => uint256[]) private _userUnlockedContent;

    /// @notice NFT mint enabled flag (creator controlled)
    bool public nftMintEnabled;

    /// @notice NFT token ID counter
    uint256 private _nextTokenId;

    /// @notice Mapping from token ID to content ID
    mapping(uint256 => uint256) public tokenContentId;

    /// @notice Emitted when a user successfully makes a payment
    event PaymentMade(address indexed user, uint256 indexed contentId, uint256 amount);

    /// @notice Emitted when the owner withdraws funds
    event FundsWithdrawn(address indexed owner, uint256 amount);

    /// @notice Emitted when content price is updated
    event ContentPriceSet(uint256 indexed contentId, uint256 price);

    /// @notice Emitted when content is enabled/disabled
    event ContentStatusChanged(uint256 indexed contentId, bool enabled);

    /// @notice Emitted when NFT minting is toggled
    event NFTMintToggled(bool enabled);

    /// @notice Emitted when access NFT is minted
    event AccessNFTMinted(address indexed user, uint256 indexed tokenId, uint256 indexed contentId);

    /// @notice Error thrown when payment amount is insufficient
    error InsufficientPayment(uint256 required, uint256 provided);

    /// @notice Error thrown when user hasn't paid to access content
    error PaymentRequired();

    /// @notice Error thrown when user has already paid for this content
    error AlreadyPaid();

    /// @notice Error thrown when withdrawal fails
    error WithdrawalFailed();

    /// @notice Error thrown when price is invalid
    error InvalidPrice();

    /// @notice Error thrown when content is disabled
    error ContentDisabled();

    /**
     * @dev Constructor sets the initial owner
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) Ownable(initialOwner) ERC721("BasePaywall Access", "BPACCESS") {
        _nextTokenId = 1;
    }

    /**
     * @notice Set the price for a specific content item (owner only)
     * @param contentId The unique identifier for the content
     * @param price The price in wei (0 means use DEFAULT_PRICE)
     */
    function setContentPrice(uint256 contentId, uint256 price) external onlyOwner {
        contentPrice[contentId] = price;
        emit ContentPriceSet(contentId, price);
    }

    /**
     * @notice Enable or disable a content item (owner only)
     * @param contentId The content ID to update
     * @param enabled Whether the content should be enabled
     */
    function setContentEnabled(uint256 contentId, bool enabled) external onlyOwner {
        contentEnabled[contentId] = enabled;
        emit ContentStatusChanged(contentId, enabled);
    }

    /**
     * @notice Toggle NFT minting on/off (owner only)
     * @param enabled Whether NFT minting should be enabled
     */
    function setNFTMintEnabled(bool enabled) external onlyOwner {
        nftMintEnabled = enabled;
        emit NFTMintToggled(enabled);
    }

    /**
     * @notice Get the price for a specific content item
     * @param contentId The content ID to check
     * @return The price in wei
     */
    function getContentPrice(uint256 contentId) public view returns (uint256) {
        uint256 price = contentPrice[contentId];
        return price > 0 ? price : DEFAULT_PRICE;
    }

    /**
     * @notice Check if content is enabled (defaults to true if never set)
     * @param contentId The content ID to check
     * @return Whether the content is enabled
     */
    function isContentEnabled(uint256 contentId) public view returns (bool) {
        // Content is enabled by default unless explicitly disabled
        // We use a special check: if price was ever set OR content was explicitly enabled/disabled
        if (contentPrice[contentId] > 0 || contentEnabled[contentId]) {
            return contentEnabled[contentId];
        }
        return true; // Default to enabled for new content
    }

    /**
     * @notice Pay to unlock a specific content item
     * @param contentId The content ID to unlock
     */
    function pay(uint256 contentId) external payable nonReentrant {
        // Check if content is enabled (skip check for content that was never configured)
        if (contentPrice[contentId] > 0 && !contentEnabled[contentId]) {
            revert ContentDisabled();
        }

        if (hasPaid[contentId][msg.sender]) {
            revert AlreadyPaid();
        }

        uint256 price = getContentPrice(contentId);
        if (msg.value < price) {
            revert InsufficientPayment(price, msg.value);
        }

        hasPaid[contentId][msg.sender] = true;
        _userUnlockedContent[msg.sender].push(contentId);
        contentRevenue[contentId] += price;
        contentUnlockCount[contentId] += 1;

        emit PaymentMade(msg.sender, contentId, price);

        // Mint NFT if enabled
        if (nftMintEnabled) {
            uint256 tokenId = _nextTokenId++;
            tokenContentId[tokenId] = contentId;
            _safeMint(msg.sender, tokenId);
            emit AccessNFTMinted(msg.sender, tokenId, contentId);
        }

        // Refund excess payment
        if (msg.value > price) {
            uint256 refund = msg.value - price;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            if (!success) {
                revert WithdrawalFailed();
            }
        }
    }

    /**
     * @notice Check if a user has access to a specific content item
     * @param contentId The content ID to check
     * @param user The address to check
     * @return Whether the user has paid for this content
     */
    function hasAccess(uint256 contentId, address user) external view returns (bool) {
        return hasPaid[contentId][user];
    }

    /**
     * @notice Get all content IDs unlocked by a user
     * @param user The address to check
     * @return Array of content IDs the user has unlocked
     */
    function getUserUnlockedContent(address user) external view returns (uint256[] memory) {
        return _userUnlockedContent[user];
    }

    /**
     * @notice Get the number of content items unlocked by a user
     * @param user The address to check
     * @return Number of content items unlocked
     */
    function getUserUnlockCount(address user) external view returns (uint256) {
        return _userUnlockedContent[user].length;
    }

    /**
     * @notice Get content statistics
     * @param contentId The content ID to check
     * @return price The content price
     * @return revenue Total revenue from this content
     * @return unlocks Number of times this content was unlocked
     * @return enabled Whether the content is enabled
     */
    function getContentStats(uint256 contentId) external view returns (
        uint256 price,
        uint256 revenue,
        uint256 unlocks,
        bool enabled
    ) {
        return (
            getContentPrice(contentId),
            contentRevenue[contentId],
            contentUnlockCount[contentId],
            isContentEnabled(contentId)
        );
    }

    /**
     * @notice Get total revenue across all content
     * @return Total contract balance representing total revenue
     */
    function getTotalRevenue() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Withdraw accumulated funds (owner only)
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) {
            revert WithdrawalFailed();
        }

        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert WithdrawalFailed();
        }

        emit FundsWithdrawn(msg.sender, balance);
    }

    /**
     * @notice Get the contract balance
     * @return The current balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
