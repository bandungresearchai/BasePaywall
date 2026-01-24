// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/BasePaywallV4.sol";

contract BasePaywallV4Test is Test {
    BasePaywallV4 public paywall;
    
    address public owner = address(1);
    address public creator = address(2);
    address public user = address(3);
    address public buyer = address(4);
    
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant CONTENT_PRICE = 0.01 ether;
    uint256 public constant ROYALTY_BPS = 500; // 5%
    
    event AccessMinted(address indexed user, uint256 indexed contentId, uint256 indexed tokenId, uint256 price);

    function setUp() public {
        paywall = new BasePaywallV4(
            owner, 
            PLATFORM_FEE,
            "BasePaywall Access",
            "BPAY",
            "https://api.basepaywall.xyz/token/"
        );
        
        vm.deal(creator, 10 ether);
        vm.deal(user, 10 ether);
        vm.deal(buyer, 10 ether);
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(paywall.owner(), owner);
        assertEq(paywall.platformFeeBps(), PLATFORM_FEE);
        assertEq(paywall.name(), "BasePaywall Access");
        assertEq(paywall.symbol(), "BPAY");
    }

    // ============ Content Creation Tests ============

    function test_CreateContent_WithAllOptions() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        
        uint256 contentId = paywall.createContent(
            CONTENT_PRICE,
            100,  // maxSupply
            ROYALTY_BPS,
            "ipfs://QmExample123"
        );
        
        (
            address contentCreator,
            uint256 price,
            bool enabled,
            ,
            ,
            uint256 maxSupply,
            uint256 royaltyBps,
            string memory metadataURI
        ) = paywall.getContent(contentId);
        
        assertEq(contentCreator, creator);
        assertEq(price, CONTENT_PRICE);
        assertTrue(enabled);
        assertEq(maxSupply, 100);
        assertEq(royaltyBps, ROYALTY_BPS);
        assertEq(metadataURI, "ipfs://QmExample123");
        vm.stopPrank();
    }

    function test_CreateContent_UnlimitedSupply() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        (, , , , , uint256 maxSupply, , ) = paywall.getContent(contentId);
        assertEq(maxSupply, 0); // Unlimited
        vm.stopPrank();
    }

    // ============ Minting Tests ============

    function test_Mint_Success() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        // Mint
        vm.prank(user);
        vm.expectEmit(true, true, true, true);
        emit AccessMinted(user, 1, 1, CONTENT_PRICE);
        uint256 tokenId = paywall.mint{value: CONTENT_PRICE}(1);
        
        assertEq(tokenId, 1);
        assertEq(paywall.ownerOf(tokenId), user);
        assertEq(paywall.balanceOf(user), 1);
    }

    function test_Mint_MultipleForSameContent() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        // Mint multiple
        vm.startPrank(user);
        uint256 token1 = paywall.mint{value: CONTENT_PRICE}(1);
        uint256 token2 = paywall.mint{value: CONTENT_PRICE}(1);
        vm.stopPrank();
        
        assertEq(token1, 1);
        assertEq(token2, 2);
        assertEq(paywall.balanceOf(user), 2);
    }

    function test_Mint_RevertMaxSupplyReached() public {
        // Setup limited supply content
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, 2, 0, ""); // Max 2 mints
        vm.stopPrank();
        
        // Mint up to limit
        vm.startPrank(user);
        paywall.mint{value: CONTENT_PRICE}(1);
        paywall.mint{value: CONTENT_PRICE}(1);
        
        // Third mint should fail
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV4.MaxSupplyReached.selector, 2));
        paywall.mint{value: CONTENT_PRICE}(1);
        vm.stopPrank();
    }

    // ============ Access Check Tests ============

    function test_CheckAccess_WithNFT() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        // Before mint
        assertFalse(paywall.checkAccess(1, user));
        
        // After mint
        vm.prank(user);
        paywall.mint{value: CONTENT_PRICE}(1);
        
        assertTrue(paywall.checkAccess(1, user));
    }

    function test_CheckAccess_CreatorAlwaysHasAccess() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        assertTrue(paywall.checkAccess(1, creator));
    }

    // ============ Transfer Tests (Access Transfer) ============

    function test_Transfer_TransfersAccess() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        // User mints
        vm.prank(user);
        uint256 tokenId = paywall.mint{value: CONTENT_PRICE}(1);
        
        assertTrue(paywall.checkAccess(1, user));
        assertFalse(paywall.checkAccess(1, buyer));
        
        // Transfer NFT
        vm.prank(user);
        paywall.transferFrom(user, buyer, tokenId);
        
        // Access transferred
        assertFalse(paywall.checkAccess(1, user));
        assertTrue(paywall.checkAccess(1, buyer));
    }

    // ============ Royalty Tests (EIP-2981) ============

    function test_RoyaltyInfo() public {
        // Setup with royalty
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, 0, ROYALTY_BPS, "");
        vm.stopPrank();
        
        // Mint
        vm.prank(user);
        uint256 tokenId = paywall.mint{value: CONTENT_PRICE}(1);
        
        // Check royalty
        uint256 salePrice = 1 ether;
        (address receiver, uint256 royaltyAmount) = paywall.royaltyInfo(tokenId, salePrice);
        
        assertEq(receiver, creator);
        assertEq(royaltyAmount, salePrice * ROYALTY_BPS / 10000); // 5%
    }

    function test_SupportsInterface_EIP2981() public view {
        // EIP-2981 interface ID
        assertTrue(paywall.supportsInterface(0x2a55205a));
        // ERC721
        assertTrue(paywall.supportsInterface(0x80ac58cd));
        // ERC721Enumerable
        assertTrue(paywall.supportsInterface(0x780e9d63));
    }

    // ============ View Function Tests ============

    function test_GetUserTokensForContent() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE); // Content 1
        paywall.createContent(CONTENT_PRICE); // Content 2
        vm.stopPrank();
        
        // Mint multiple tokens for different content
        vm.startPrank(user);
        paywall.mint{value: CONTENT_PRICE}(1); // Token 1
        paywall.mint{value: CONTENT_PRICE}(1); // Token 2
        paywall.mint{value: CONTENT_PRICE}(2); // Token 3
        vm.stopPrank();
        
        uint256[] memory tokensForContent1 = paywall.getUserTokensForContent(1, user);
        assertEq(tokensForContent1.length, 2);
        assertEq(tokensForContent1[0], 1);
        assertEq(tokensForContent1[1], 2);
        
        uint256[] memory tokensForContent2 = paywall.getUserTokensForContent(2, user);
        assertEq(tokensForContent2.length, 1);
        assertEq(tokensForContent2[0], 3);
    }

    function test_GetUserAccessibleContents() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE); // Content 1
        paywall.createContent(CONTENT_PRICE); // Content 2
        paywall.createContent(CONTENT_PRICE); // Content 3
        vm.stopPrank();
        
        // Mint for content 1 and 3
        vm.startPrank(user);
        paywall.mint{value: CONTENT_PRICE}(1);
        paywall.mint{value: CONTENT_PRICE}(3);
        paywall.mint{value: CONTENT_PRICE}(1); // Another for content 1
        vm.stopPrank();
        
        uint256[] memory accessibleContents = paywall.getUserAccessibleContents(user);
        assertEq(accessibleContents.length, 2);
        // Should contain 1 and 3 (unique)
    }

    function test_GetAccessToken() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        // Mint at specific time
        vm.warp(1000);
        vm.prank(user);
        uint256 tokenId = paywall.mint{value: CONTENT_PRICE}(1);
        
        (uint256 contentId, uint256 mintedAt, uint256 originalPrice) = paywall.getAccessToken(tokenId);
        assertEq(contentId, 1);
        assertEq(mintedAt, 1000);
        assertEq(originalPrice, CONTENT_PRICE);
    }

    // ============ Token URI Tests ============

    function test_TokenURI_WithContentMetadata() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, 0, 0, "ipfs://QmCustomMetadata");
        vm.stopPrank();
        
        vm.prank(user);
        uint256 tokenId = paywall.mint{value: CONTENT_PRICE}(1);
        
        assertEq(paywall.tokenURI(tokenId), "ipfs://QmCustomMetadata");
    }

    function test_TokenURI_WithBaseURI() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        vm.prank(user);
        uint256 tokenId = paywall.mint{value: CONTENT_PRICE}(1);
        
        assertEq(paywall.tokenURI(tokenId), "https://api.basepaywall.xyz/token/1");
    }

    // ============ Platform Stats Tests ============

    function test_GetPlatformStats() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE);
        paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        vm.startPrank(user);
        paywall.mint{value: CONTENT_PRICE}(1);
        paywall.mint{value: CONTENT_PRICE}(2);
        paywall.mint{value: CONTENT_PRICE}(1);
        vm.stopPrank();
        
        (
            uint256 totalCreatorsCount,
            uint256 totalContents,
            uint256 totalMints,
            uint256 totalRevenueAmount,
            
        ) = paywall.getPlatformStats();
        
        assertEq(totalCreatorsCount, 1);
        assertEq(totalContents, 2);
        assertEq(totalMints, 3);
        assertEq(totalRevenueAmount, CONTENT_PRICE * 3);
    }
}
