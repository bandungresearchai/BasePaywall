// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/BasePaywall.sol";

contract BasePaywallTest is Test {
    BasePaywall public paywall;
    address public owner;
    address public user1;
    address public user2;

    uint256 public constant DEFAULT_PRICE = 0.001 ether;
    uint256 public constant CONTENT_ID_1 = 1;
    uint256 public constant CONTENT_ID_2 = 2;

    event PaymentMade(address indexed user, uint256 indexed contentId, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event ContentPriceSet(uint256 indexed contentId, uint256 price);
    event ContentStatusChanged(uint256 indexed contentId, bool enabled);
    event NFTMintToggled(bool enabled);
    event AccessNFTMinted(address indexed user, uint256 indexed tokenId, uint256 indexed contentId);

    // Allow the test contract to receive ETH
    receive() external payable {}

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        paywall = new BasePaywall(owner);
        
        // Fund test users
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    function test_InitialState() public view {
        assertEq(paywall.owner(), owner);
        assertEq(paywall.DEFAULT_PRICE(), DEFAULT_PRICE);
        assertFalse(paywall.hasAccess(CONTENT_ID_1, user1));
        assertFalse(paywall.hasAccess(CONTENT_ID_2, user2));
        assertFalse(paywall.nftMintEnabled());
    }

    function test_PaySuccess() public {
        vm.prank(user1);
        
        vm.expectEmit(true, true, false, true);
        emit PaymentMade(user1, CONTENT_ID_1, DEFAULT_PRICE);
        
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        assertTrue(paywall.hasAccess(CONTENT_ID_1, user1));
        assertEq(address(paywall).balance, DEFAULT_PRICE);
    }

    function test_PayWithExcess() public {
        uint256 excessAmount = 0.002 ether;
        uint256 userBalanceBefore = user1.balance;
        
        vm.prank(user1);
        paywall.pay{value: excessAmount}(CONTENT_ID_1);
        
        assertTrue(paywall.hasAccess(CONTENT_ID_1, user1));
        assertEq(address(paywall).balance, DEFAULT_PRICE);
        // User should get refund of excess
        assertEq(user1.balance, userBalanceBefore - DEFAULT_PRICE);
    }

    function test_PayInsufficientAmount() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                BasePaywall.InsufficientPayment.selector,
                DEFAULT_PRICE,
                DEFAULT_PRICE - 1
            )
        );
        paywall.pay{value: DEFAULT_PRICE - 1}(CONTENT_ID_1);
    }

    function test_PayAlreadyPaid() public {
        vm.startPrank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        vm.expectRevert(BasePaywall.AlreadyPaid.selector);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        vm.stopPrank();
    }

    function test_PayMultipleContents() public {
        vm.startPrank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_2);
        vm.stopPrank();
        
        assertTrue(paywall.hasAccess(CONTENT_ID_1, user1));
        assertTrue(paywall.hasAccess(CONTENT_ID_2, user1));
        assertEq(address(paywall).balance, DEFAULT_PRICE * 2);
    }

    function test_SetContentPrice() public {
        uint256 customPrice = 0.005 ether;
        
        vm.expectEmit(true, false, false, true);
        emit ContentPriceSet(CONTENT_ID_1, customPrice);
        
        paywall.setContentPrice(CONTENT_ID_1, customPrice);
        
        assertEq(paywall.getContentPrice(CONTENT_ID_1), customPrice);
        // Other content should still use default
        assertEq(paywall.getContentPrice(CONTENT_ID_2), DEFAULT_PRICE);
    }

    function test_SetContentPriceNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user1
            )
        );
        paywall.setContentPrice(CONTENT_ID_1, 0.01 ether);
    }

    function test_PayWithCustomPrice() public {
        uint256 customPrice = 0.005 ether;
        paywall.setContentPrice(CONTENT_ID_1, customPrice);
        paywall.setContentEnabled(CONTENT_ID_1, true);
        
        vm.prank(user1);
        paywall.pay{value: customPrice}(CONTENT_ID_1);
        
        assertTrue(paywall.hasAccess(CONTENT_ID_1, user1));
        assertEq(address(paywall).balance, customPrice);
    }

    function test_HasAccess() public {
        assertFalse(paywall.hasAccess(CONTENT_ID_1, user1));
        
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        assertTrue(paywall.hasAccess(CONTENT_ID_1, user1));
        // User should not have access to other content
        assertFalse(paywall.hasAccess(CONTENT_ID_2, user1));
    }

    function test_MultipleUsersMultipleContents() public {
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        vm.prank(user2);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_2);
        
        assertTrue(paywall.hasAccess(CONTENT_ID_1, user1));
        assertFalse(paywall.hasAccess(CONTENT_ID_2, user1));
        assertFalse(paywall.hasAccess(CONTENT_ID_1, user2));
        assertTrue(paywall.hasAccess(CONTENT_ID_2, user2));
    }

    // User access history tests
    function test_GetUserUnlockedContent() public {
        vm.startPrank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_2);
        vm.stopPrank();
        
        uint256[] memory unlocked = paywall.getUserUnlockedContent(user1);
        assertEq(unlocked.length, 2);
        assertEq(unlocked[0], CONTENT_ID_1);
        assertEq(unlocked[1], CONTENT_ID_2);
    }

    function test_GetUserUnlockCount() public {
        assertEq(paywall.getUserUnlockCount(user1), 0);
        
        vm.startPrank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        assertEq(paywall.getUserUnlockCount(user1), 1);
        
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_2);
        assertEq(paywall.getUserUnlockCount(user1), 2);
        vm.stopPrank();
    }

    // Content management tests
    function test_SetContentEnabled() public {
        paywall.setContentPrice(CONTENT_ID_1, 0.001 ether);
        paywall.setContentEnabled(CONTENT_ID_1, true);
        
        vm.expectEmit(true, false, false, true);
        emit ContentStatusChanged(CONTENT_ID_1, false);
        
        paywall.setContentEnabled(CONTENT_ID_1, false);
        
        assertFalse(paywall.contentEnabled(CONTENT_ID_1));
    }

    function test_PayDisabledContent() public {
        paywall.setContentPrice(CONTENT_ID_1, 0.001 ether);
        paywall.setContentEnabled(CONTENT_ID_1, false);
        
        vm.prank(user1);
        vm.expectRevert(BasePaywall.ContentDisabled.selector);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
    }

    // Revenue tracking tests
    function test_ContentRevenue() public {
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        vm.prank(user2);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        assertEq(paywall.contentRevenue(CONTENT_ID_1), DEFAULT_PRICE * 2);
        assertEq(paywall.contentUnlockCount(CONTENT_ID_1), 2);
    }

    function test_GetContentStats() public {
        uint256 customPrice = 0.005 ether;
        paywall.setContentPrice(CONTENT_ID_1, customPrice);
        paywall.setContentEnabled(CONTENT_ID_1, true);
        
        vm.prank(user1);
        paywall.pay{value: customPrice}(CONTENT_ID_1);
        
        (uint256 price, uint256 revenue, uint256 unlocks, bool enabled) = paywall.getContentStats(CONTENT_ID_1);
        
        assertEq(price, customPrice);
        assertEq(revenue, customPrice);
        assertEq(unlocks, 1);
        assertTrue(enabled);
    }

    function test_GetTotalRevenue() public {
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        vm.prank(user2);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_2);
        
        assertEq(paywall.getTotalRevenue(), DEFAULT_PRICE * 2);
    }

    // NFT tests
    function test_NFTMintEnabled() public {
        assertFalse(paywall.nftMintEnabled());
        
        vm.expectEmit(false, false, false, true);
        emit NFTMintToggled(true);
        
        paywall.setNFTMintEnabled(true);
        assertTrue(paywall.nftMintEnabled());
    }

    function test_PayMintsNFTWhenEnabled() public {
        paywall.setNFTMintEnabled(true);
        
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        // User should have 1 NFT
        assertEq(paywall.balanceOf(user1), 1);
        // Token 1 should be owned by user1
        assertEq(paywall.ownerOf(1), user1);
        // Token 1 should be associated with CONTENT_ID_1
        assertEq(paywall.tokenContentId(1), CONTENT_ID_1);
    }

    function test_PayDoesNotMintNFTWhenDisabled() public {
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        // User should have 0 NFTs
        assertEq(paywall.balanceOf(user1), 0);
    }

    // Withdraw tests
    function test_Withdraw() public {
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        vm.prank(user2);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_2);
        
        uint256 expectedBalance = DEFAULT_PRICE * 2;
        assertEq(address(paywall).balance, expectedBalance);
        
        uint256 ownerBalanceBefore = owner.balance;
        
        vm.expectEmit(true, false, false, true);
        emit FundsWithdrawn(owner, expectedBalance);
        
        paywall.withdraw();
        
        assertEq(address(paywall).balance, 0);
        assertEq(owner.balance, ownerBalanceBefore + expectedBalance);
    }

    function test_WithdrawNotOwner() public {
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user1
            )
        );
        paywall.withdraw();
    }

    function test_WithdrawNoBalance() public {
        vm.expectRevert(BasePaywall.WithdrawalFailed.selector);
        paywall.withdraw();
    }

    function test_GetBalance() public {
        assertEq(paywall.getBalance(), 0);
        
        vm.prank(user1);
        paywall.pay{value: DEFAULT_PRICE}(CONTENT_ID_1);
        
        assertEq(paywall.getBalance(), DEFAULT_PRICE);
    }

    function test_GetContentPrice() public view {
        assertEq(paywall.getContentPrice(CONTENT_ID_1), DEFAULT_PRICE);
    }

    // Fuzz tests
    function testFuzz_PayWithVariousAmounts(uint256 amount) public {
        vm.assume(amount >= DEFAULT_PRICE && amount <= 100 ether);
        vm.deal(user1, amount);
        
        uint256 balanceBefore = user1.balance;
        
        vm.prank(user1);
        paywall.pay{value: amount}(CONTENT_ID_1);
        
        assertTrue(paywall.hasAccess(CONTENT_ID_1, user1));
        // Contract should only keep DEFAULT_PRICE, rest refunded
        assertEq(address(paywall).balance, DEFAULT_PRICE);
        assertEq(user1.balance, balanceBefore - DEFAULT_PRICE);
    }

    function testFuzz_PayMultipleContentsWithCustomPrices(uint256 price1, uint256 price2) public {
        vm.assume(price1 > 0 && price1 <= 1 ether);
        vm.assume(price2 > 0 && price2 <= 1 ether);
        
        paywall.setContentPrice(CONTENT_ID_1, price1);
        paywall.setContentEnabled(CONTENT_ID_1, true);
        paywall.setContentPrice(CONTENT_ID_2, price2);
        paywall.setContentEnabled(CONTENT_ID_2, true);
        
        vm.prank(user1);
        paywall.pay{value: price1}(CONTENT_ID_1);
        
        vm.prank(user1);
        paywall.pay{value: price2}(CONTENT_ID_2);
        
        assertTrue(paywall.hasAccess(CONTENT_ID_1, user1));
        assertTrue(paywall.hasAccess(CONTENT_ID_2, user1));
        assertEq(address(paywall).balance, price1 + price2);
        
        // Verify user access history
        uint256[] memory unlocked = paywall.getUserUnlockedContent(user1);
        assertEq(unlocked.length, 2);
    }

    // ERC721 tests
    function test_NFTMetadata() public view {
        assertEq(paywall.name(), "BasePaywall Access");
        assertEq(paywall.symbol(), "BPACCESS");
    }
}
