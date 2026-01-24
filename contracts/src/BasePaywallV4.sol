// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BasePaywall V4 - NFT Access
 * @author BasePaywall Team
 * @notice NFT-based paywall with transferable access tokens on Base L2
 * @dev Each unlock mints an ERC721 token that proves and grants access.
 *      - Access is transferable via NFT transfer
 *      - Supports secondary market trading
 *      - Optional royalties on transfers
 * 
 * Key Features:
 * - ERC721 NFT minted on unlock
 * - Access check via NFT ownership
 * - Transferable access
 * - Secondary market ready (OpenSea, etc)
 * - Optional per-content royalties
 */
contract BasePaywallV4 is ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    
    // ============ Constants ============
    
    uint256 public constant MAX_PLATFORM_FEE_BPS = 1000;
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MIN_CONTENT_PRICE = 0.0001 ether;
    uint256 public constant MAX_CONTENT_PRICE = 10 ether;
    uint256 public constant MAX_ROYALTY_BPS = 1000; // 10% max royalty

    // ============ State Variables ============
    
    uint256 public platformFeeBps;
    uint256 public platformBalance;
    uint256 public nextContentId;
    uint256 public nextTokenId;
    uint256 public totalCreators;
    uint256 public totalRevenue;
    
    string public baseTokenURI;

    // ============ Structs ============
    
    struct Creator {
        bool isRegistered;
        uint256 balance;
        uint256 contentCount;
        uint256 totalRevenue;
        uint256 registeredAt;
    }
    
    struct Content {
        address creator;
        uint256 price;
        bool enabled;
        uint256 revenue;
        uint256 mintCount;
        uint256 createdAt;
        uint256 royaltyBps;        // Royalty on secondary sales
        uint256 maxSupply;         // 0 = unlimited
        string metadataURI;        // Content-specific metadata
    }

    struct AccessToken {
        uint256 contentId;
        uint256 mintedAt;
        uint256 originalPrice;
    }

    // ============ Mappings ============
    
    mapping(address => Creator) public creators;
    mapping(uint256 => Content) public contents;
    mapping(uint256 => AccessToken) public accessTokens;  // tokenId => AccessToken
    mapping(address => uint256[]) private _creatorContents;

    // ============ Events ============
    
    event CreatorRegistered(address indexed creator, uint256 timestamp);
    event ContentCreated(address indexed creator, uint256 indexed contentId, uint256 price, uint256 maxSupply);
    event ContentUpdated(uint256 indexed contentId, uint256 price, bool enabled);
    event AccessMinted(address indexed user, uint256 indexed contentId, uint256 indexed tokenId, uint256 price);
    event CreatorWithdrawal(address indexed creator, uint256 amount);
    event PlatformWithdrawal(address indexed owner, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event BaseURIUpdated(string newBaseURI);

    // ============ Errors ============
    
    error NotRegistered();
    error AlreadyRegistered();
    error ContentNotFound();
    error ContentDisabled();
    error InsufficientPayment(uint256 required, uint256 provided);
    error InvalidPrice(uint256 price);
    error InvalidFee(uint256 fee);
    error InvalidRoyalty(uint256 royalty);
    error MaxSupplyReached(uint256 maxSupply);
    error NothingToWithdraw();
    error WithdrawalFailed();
    error Unauthorized();

    // ============ Constructor ============
    
    constructor(
        address _owner, 
        uint256 _platformFeeBps,
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) ERC721(_name, _symbol) Ownable(_owner) {
        if (_platformFeeBps > MAX_PLATFORM_FEE_BPS) {
            revert InvalidFee(_platformFeeBps);
        }
        platformFeeBps = _platformFeeBps;
        nextContentId = 1;
        nextTokenId = 1;
        baseTokenURI = _baseURI;
    }

    // ============ Creator Functions ============
    
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
     * @notice Create content with NFT access
     * @param price Price in wei
     * @param maxSupply Maximum NFTs that can be minted (0 = unlimited)
     * @param royaltyBps Royalty on secondary sales in basis points
     * @param metadataURI Content-specific metadata URI
     */
    function createContent(
        uint256 price, 
        uint256 maxSupply,
        uint256 royaltyBps,
        string calldata metadataURI
    ) external whenNotPaused returns (uint256 contentId) {
        if (!creators[msg.sender].isRegistered) {
            revert NotRegistered();
        }
        if (price < MIN_CONTENT_PRICE || price > MAX_CONTENT_PRICE) {
            revert InvalidPrice(price);
        }
        if (royaltyBps > MAX_ROYALTY_BPS) {
            revert InvalidRoyalty(royaltyBps);
        }
        
        contentId = nextContentId++;
        
        contents[contentId] = Content({
            creator: msg.sender,
            price: price,
            enabled: true,
            revenue: 0,
            mintCount: 0,
            createdAt: block.timestamp,
            royaltyBps: royaltyBps,
            maxSupply: maxSupply,
            metadataURI: metadataURI
        });
        
        creators[msg.sender].contentCount++;
        _creatorContents[msg.sender].push(contentId);
        
        emit ContentCreated(msg.sender, contentId, price, maxSupply);
    }
    
    /**
     * @notice Create content with defaults (unlimited supply, no royalty)
     */
    function createContent(uint256 price) external whenNotPaused returns (uint256 contentId) {
        return this.createContent(price, 0, 0, "");
    }

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
     * @notice Mint an access NFT for content
     * @param contentId Content ID to unlock
     * @return tokenId The minted token ID
     */
    function mint(uint256 contentId) external payable nonReentrant whenNotPaused returns (uint256 tokenId) {
        Content storage content = contents[contentId];
        
        if (content.creator == address(0)) {
            revert ContentNotFound();
        }
        if (!content.enabled) {
            revert ContentDisabled();
        }
        if (content.maxSupply > 0 && content.mintCount >= content.maxSupply) {
            revert MaxSupplyReached(content.maxSupply);
        }
        if (msg.value < content.price) {
            revert InsufficientPayment(content.price, msg.value);
        }
        
        // Calculate fee split
        uint256 platformFee = (content.price * platformFeeBps) / BPS_DENOMINATOR;
        uint256 creatorShare = content.price - platformFee;
        
        // Mint NFT
        tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        // Store access token data
        accessTokens[tokenId] = AccessToken({
            contentId: contentId,
            mintedAt: block.timestamp,
            originalPrice: content.price
        });
        
        // Update stats
        content.revenue += content.price;
        content.mintCount++;
        
        creators[content.creator].balance += creatorShare;
        creators[content.creator].totalRevenue += content.price;
        
        platformBalance += platformFee;
        totalRevenue += content.price;
        
        emit AccessMinted(msg.sender, contentId, tokenId, content.price);
        
        // Refund excess
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
     * @notice Check if user has access to content (owns any token for that content)
     */
    function checkAccess(uint256 contentId, address user) external view returns (bool) {
        Content storage content = contents[contentId];
        // Creator always has access
        if (content.creator == user) return true;
        
        // Check if user owns any token for this content
        uint256 balance = balanceOf(user);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (accessTokens[tokenId].contentId == contentId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get user's access tokens for a specific content
     */
    function getUserTokensForContent(uint256 contentId, address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tempTokens = new uint256[](balance);
        uint256 count = 0;
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (accessTokens[tokenId].contentId == contentId) {
                tempTokens[count++] = tokenId;
            }
        }
        
        // Trim array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempTokens[i];
        }
        return result;
    }
    
    /**
     * @notice Get all content IDs user has access to
     */
    function getUserAccessibleContents(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tempContents = new uint256[](balance);
        uint256 count = 0;
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            uint256 contentId = accessTokens[tokenId].contentId;
            
            // Check if already in array
            bool exists = false;
            for (uint256 j = 0; j < count; j++) {
                if (tempContents[j] == contentId) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                tempContents[count++] = contentId;
            }
        }
        
        // Trim array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempContents[i];
        }
        return result;
    }
    
    function getCreatorContents(address creator) external view returns (uint256[] memory) {
        return _creatorContents[creator];
    }
    
    function getCreator(address creator) external view returns (
        bool isRegistered,
        uint256 balance,
        uint256 contentCount,
        uint256 creatorTotalRevenue,
        uint256 registeredAt
    ) {
        Creator storage c = creators[creator];
        return (c.isRegistered, c.balance, c.contentCount, c.totalRevenue, c.registeredAt);
    }
    
    function getContent(uint256 contentId) external view returns (
        address creator,
        uint256 price,
        bool enabled,
        uint256 revenue,
        uint256 mintCount,
        uint256 maxSupply,
        uint256 royaltyBps,
        string memory metadataURI
    ) {
        Content storage c = contents[contentId];
        return (c.creator, c.price, c.enabled, c.revenue, c.mintCount, c.maxSupply, c.royaltyBps, c.metadataURI);
    }

    function getAccessToken(uint256 tokenId) external view returns (
        uint256 contentId,
        uint256 mintedAt,
        uint256 originalPrice
    ) {
        AccessToken storage t = accessTokens[tokenId];
        return (t.contentId, t.mintedAt, t.originalPrice);
    }
    
    function getPlatformStats() external view returns (
        uint256 totalCreatorsCount,
        uint256 totalContents,
        uint256 totalMints,
        uint256 totalRevenueAmount,
        uint256 platformBalanceAmount
    ) {
        return (totalCreators, nextContentId - 1, nextTokenId - 1, totalRevenue, platformBalance);
    }

    // ============ ERC721 Overrides ============
    
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        AccessToken storage token = accessTokens[tokenId];
        Content storage content = contents[token.contentId];
        
        // If content has specific metadata, use it
        if (bytes(content.metadataURI).length > 0) {
            return content.metadataURI;
        }
        
        // Otherwise use base URI + tokenId
        string memory base = _baseURI();
        return bytes(base).length > 0 ? string(abi.encodePacked(base, _toString(tokenId))) : "";
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // ============ EIP-2981 Royalty Support ============
    
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        AccessToken storage token = accessTokens[tokenId];
        Content storage content = contents[token.contentId];
        
        receiver = content.creator;
        royaltyAmount = (salePrice * content.royaltyBps) / BPS_DENOMINATOR;
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable) returns (bool) {
        // EIP-2981 interface ID
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }

    // ============ Platform Admin Functions ============
    
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_PLATFORM_FEE_BPS) {
            revert InvalidFee(newFeeBps);
        }
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }
    
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
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
