// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/BasePaywallV2.sol";

contract BasePaywallV2Test is Test {
    BasePaywallV2 public paywall;
    
    address public platformOwner = address(1);
    address public creator1 = address(2);
    address public creator2 = address(3);
    address public user1 = address(4);
    address public user2 = address(5);
    
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant CONTENT_PRICE = 0.01 ether;
    
    event CreatorRegistered(address indexed creator, uint256 timestamp);
    event ContentCreated(address indexed creator, uint256 indexed contentId, uint256 price);
    event ContentUpdated(uint256 indexed contentId, uint256 price, bool enabled);
    event ContentUnlocked(address indexed user, uint256 indexed contentId, address indexed creator, uint256 amount);
    event CreatorWithdrawal(address indexed creator, uint256 amount);
    event PlatformWithdrawal(address indexed owner, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    function setUp() public {
        paywall = new BasePaywallV2(platformOwner, PLATFORM_FEE_BPS);
        
        // Fund test accounts
        vm.deal(creator1, 10 ether);
        vm.deal(creator2, 10 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    // ============ Constructor Tests ============
    
    function test_Constructor() public view {
        assertEq(paywall.owner(), platformOwner);
        assertEq(paywall.platformFeeBps(), PLATFORM_FEE_BPS);
        assertEq(paywall.nextContentId(), 1);
        assertEq(paywall.totalCreators(), 0);
    }
    
    function test_Constructor_RevertInvalidFee() public {
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV2.InvalidFee.selector, 1001));
        new BasePaywallV2(platformOwner, 1001);
    }

    // ============ Creator Registration Tests ============
    
    function test_RegisterCreator() public {
        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit CreatorRegistered(creator1, block.timestamp);
        paywall.registerCreator();
        
        (bool isRegistered, uint256 balance, uint256 contentCount, uint256 totalRevenue) = paywall.getCreator(creator1);
        
        assertTrue(isRegistered);
        assertEq(balance, 0);
        assertEq(contentCount, 0);
        assertEq(totalRevenue, 0);
        assertEq(paywall.totalCreators(), 1);
    }
    
    function test_RegisterCreator_RevertAlreadyRegistered() public {
        vm.startPrank(creator1);
        paywall.registerCreator();
        
        vm.expectRevert(BasePaywallV2.AlreadyRegistered.selector);
        paywall.registerCreator();
        vm.stopPrank();
    }
    
    function test_RegisterCreator_MultipleCreators() public {
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator2);
        paywall.registerCreator();
        
        assertEq(paywall.totalCreators(), 2);
    }

    // ============ Content Creation Tests ============
    
    function test_CreateContent() public {
        vm.startPrank(creator1);
        paywall.registerCreator();
        
        vm.expectEmit(true, true, false, true);
        emit ContentCreated(creator1, 1, CONTENT_PRICE);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        vm.stopPrank();
        
        assertEq(contentId, 1);
        
        (address creator, uint256 price, bool enabled, uint256 revenue, uint256 unlockCount) = paywall.getContent(contentId);
        
        assertEq(creator, creator1);
        assertEq(price, CONTENT_PRICE);
        assertTrue(enabled);
        assertEq(revenue, 0);
        assertEq(unlockCount, 0);
        
        (,, uint256 contentCount,) = paywall.getCreator(creator1);
        assertEq(contentCount, 1);
    }
    
    function test_CreateContent_RevertNotRegistered() public {
        vm.prank(creator1);
        vm.expectRevert(BasePaywallV2.NotRegistered.selector);
        paywall.createContent(CONTENT_PRICE);
    }
    
    function test_CreateContent_RevertPriceTooLow() public {
        vm.startPrank(creator1);
        paywall.registerCreator();
        
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV2.InvalidPrice.selector, 0.00001 ether));
        paywall.createContent(0.00001 ether);
        vm.stopPrank();
    }
    
    function test_CreateContent_RevertPriceTooHigh() public {
        vm.startPrank(creator1);
        paywall.registerCreator();
        
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV2.InvalidPrice.selector, 11 ether));
        paywall.createContent(11 ether);
        vm.stopPrank();
    }
    
    function test_CreateContent_MultipleContents() public {
        vm.startPrank(creator1);
        paywall.registerCreator();
        
        uint256 id1 = paywall.createContent(0.01 ether);
        uint256 id2 = paywall.createContent(0.02 ether);
        uint256 id3 = paywall.createContent(0.03 ether);
        vm.stopPrank();
        
        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
        assertEq(paywall.nextContentId(), 4);
        
        uint256[] memory creatorContents = paywall.getCreatorContents(creator1);
        assertEq(creatorContents.length, 3);
    }

    // ============ Content Update Tests ============
    
    function test_UpdateContent() public {
        vm.startPrank(creator1);
        paywall.registerCreator();
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        vm.expectEmit(true, false, false, true);
        emit ContentUpdated(contentId, 0.02 ether, true);
        paywall.updateContent(contentId, 0.02 ether, true);
        vm.stopPrank();
        
        (, uint256 price, bool enabled,,) = paywall.getContent(contentId);
        assertEq(price, 0.02 ether);
        assertTrue(enabled);
    }
    
    function test_UpdateContent_DisableContent() public {
        vm.startPrank(creator1);
        paywall.registerCreator();
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        paywall.updateContent(contentId, 0, false);
        vm.stopPrank();
        
        (, uint256 price, bool enabled,,) = paywall.getContent(contentId);
        assertEq(price, CONTENT_PRICE); // Price unchanged when 0 passed
        assertFalse(enabled);
    }
    
    function test_UpdateContent_RevertContentNotFound() public {
        vm.prank(creator1);
        vm.expectRevert(BasePaywallV2.ContentNotFound.selector);
        paywall.updateContent(999, CONTENT_PRICE, true);
    }
    
    function test_UpdateContent_RevertUnauthorized() public {
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        vm.prank(creator2);
        paywall.registerCreator();
        
        vm.prank(creator2);
        vm.expectRevert(BasePaywallV2.Unauthorized.selector);
        paywall.updateContent(contentId, 0.02 ether, true);
    }

    // ============ Unlock (Payment) Tests ============
    
    function test_Unlock() public {
        // Setup
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        // Unlock
        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit ContentUnlocked(user1, contentId, creator1, CONTENT_PRICE);
        paywall.unlock{value: CONTENT_PRICE}(contentId);
        
        // Verify access
        assertTrue(paywall.hasAccess(contentId, user1));
        assertTrue(paywall.checkAccess(contentId, user1));
        
        // Verify user unlocks
        uint256[] memory userUnlocks = paywall.getUserUnlocks(user1);
        assertEq(userUnlocks.length, 1);
        assertEq(userUnlocks[0], contentId);
        
        // Verify content stats
        (,,, uint256 revenue, uint256 unlockCount) = paywall.getContent(contentId);
        assertEq(revenue, CONTENT_PRICE);
        assertEq(unlockCount, 1);
        
        // Verify fee split
        uint256 expectedPlatformFee = (CONTENT_PRICE * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedCreatorShare = CONTENT_PRICE - expectedPlatformFee;
        
        assertEq(paywall.platformBalance(), expectedPlatformFee);
        
        (, uint256 creatorBalance,,) = paywall.getCreator(creator1);
        assertEq(creatorBalance, expectedCreatorShare);
    }
    
    function test_Unlock_RefundExcess() public {
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        uint256 userBalanceBefore = user1.balance;
        
        vm.prank(user1);
        paywall.unlock{value: CONTENT_PRICE + 0.005 ether}(contentId);
        
        // User should be refunded the excess
        assertEq(user1.balance, userBalanceBefore - CONTENT_PRICE);
    }
    
    function test_Unlock_RevertContentNotFound() public {
        vm.prank(user1);
        vm.expectRevert(BasePaywallV2.ContentNotFound.selector);
        paywall.unlock{value: CONTENT_PRICE}(999);
    }
    
    function test_Unlock_RevertContentDisabled() public {
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        vm.prank(creator1);
        paywall.updateContent(contentId, 0, false);
        
        vm.prank(user1);
        vm.expectRevert(BasePaywallV2.ContentDisabled.selector);
        paywall.unlock{value: CONTENT_PRICE}(contentId);
    }
    
    function test_Unlock_RevertAlreadyUnlocked() public {
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        vm.prank(user1);
        paywall.unlock{value: CONTENT_PRICE}(contentId);
        
        vm.prank(user1);
        vm.expectRevert(BasePaywallV2.AlreadyUnlocked.selector);
        paywall.unlock{value: CONTENT_PRICE}(contentId);
    }
    
    function test_Unlock_RevertInsufficientPayment() public {
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV2.InsufficientPayment.selector, CONTENT_PRICE, 0.001 ether));
        paywall.unlock{value: 0.001 ether}(contentId);
    }
    
    function test_Unlock_MultipleUsersMultipleContents() public {
        // Creator setup
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 content1 = paywall.createContent(0.01 ether);
        
        vm.prank(creator1);
        uint256 content2 = paywall.createContent(0.02 ether);
        
        // User1 unlocks both
        vm.prank(user1);
        paywall.unlock{value: 0.01 ether}(content1);
        
        vm.prank(user1);
        paywall.unlock{value: 0.02 ether}(content2);
        
        // User2 unlocks only first
        vm.prank(user2);
        paywall.unlock{value: 0.01 ether}(content1);
        
        // Verify
        assertTrue(paywall.checkAccess(content1, user1));
        assertTrue(paywall.checkAccess(content2, user1));
        assertTrue(paywall.checkAccess(content1, user2));
        assertFalse(paywall.checkAccess(content2, user2));
        
        uint256[] memory user1Unlocks = paywall.getUserUnlocks(user1);
        assertEq(user1Unlocks.length, 2);
        
        uint256[] memory user2Unlocks = paywall.getUserUnlocks(user2);
        assertEq(user2Unlocks.length, 1);
    }

    // ============ Creator Access Tests ============
    
    function test_CreatorHasAccessToOwnContent() public {
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        // Creator has access without paying
        assertTrue(paywall.checkAccess(contentId, creator1));
        assertFalse(paywall.hasAccess(contentId, creator1)); // hasAccess only checks payment
    }

    // ============ Withdrawal Tests ============
    
    function test_WithdrawCreatorBalance() public {
        // Setup and unlock
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        vm.prank(user1);
        paywall.unlock{value: CONTENT_PRICE}(contentId);
        
        // Calculate expected
        uint256 platformFee = (CONTENT_PRICE * PLATFORM_FEE_BPS) / 10000;
        uint256 creatorShare = CONTENT_PRICE - platformFee;
        
        uint256 creatorBalanceBefore = creator1.balance;
        
        // Withdraw
        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit CreatorWithdrawal(creator1, creatorShare);
        paywall.withdrawCreatorBalance();
        
        // Verify
        assertEq(creator1.balance, creatorBalanceBefore + creatorShare);
        
        (, uint256 balance,,) = paywall.getCreator(creator1);
        assertEq(balance, 0);
    }
    
    function test_WithdrawCreatorBalance_RevertNotRegistered() public {
        vm.prank(user1);
        vm.expectRevert(BasePaywallV2.NotRegistered.selector);
        paywall.withdrawCreatorBalance();
    }
    
    function test_WithdrawCreatorBalance_RevertNothingToWithdraw() public {
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        vm.expectRevert(BasePaywallV2.NothingToWithdraw.selector);
        paywall.withdrawCreatorBalance();
    }
    
    function test_WithdrawPlatformBalance() public {
        // Setup and unlock
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(CONTENT_PRICE);
        
        vm.prank(user1);
        paywall.unlock{value: CONTENT_PRICE}(contentId);
        
        uint256 platformFee = (CONTENT_PRICE * PLATFORM_FEE_BPS) / 10000;
        uint256 ownerBalanceBefore = platformOwner.balance;
        
        // Withdraw
        vm.prank(platformOwner);
        vm.expectEmit(true, false, false, true);
        emit PlatformWithdrawal(platformOwner, platformFee);
        paywall.withdrawPlatformBalance();
        
        // Verify
        assertEq(platformOwner.balance, ownerBalanceBefore + platformFee);
        assertEq(paywall.platformBalance(), 0);
    }
    
    function test_WithdrawPlatformBalance_RevertNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        paywall.withdrawPlatformBalance();
    }
    
    function test_WithdrawPlatformBalance_RevertNothingToWithdraw() public {
        vm.prank(platformOwner);
        vm.expectRevert(BasePaywallV2.NothingToWithdraw.selector);
        paywall.withdrawPlatformBalance();
    }

    // ============ Platform Fee Tests ============
    
    function test_SetPlatformFee() public {
        vm.prank(platformOwner);
        vm.expectEmit(false, false, false, true);
        emit PlatformFeeUpdated(PLATFORM_FEE_BPS, 500);
        paywall.setPlatformFee(500);
        
        assertEq(paywall.platformFeeBps(), 500);
    }
    
    function test_SetPlatformFee_RevertInvalidFee() public {
        vm.prank(platformOwner);
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV2.InvalidFee.selector, 1001));
        paywall.setPlatformFee(1001);
    }
    
    function test_SetPlatformFee_RevertNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user1));
        paywall.setPlatformFee(500);
    }

    // ============ Pause Tests ============
    
    function test_Pause() public {
        vm.prank(platformOwner);
        paywall.pause();
        
        assertTrue(paywall.paused());
    }
    
    function test_Pause_RevertOperations() public {
        vm.prank(platformOwner);
        paywall.pause();
        
        vm.prank(creator1);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        paywall.registerCreator();
    }
    
    function test_Unpause() public {
        vm.prank(platformOwner);
        paywall.pause();
        
        vm.prank(platformOwner);
        paywall.unpause();
        
        assertFalse(paywall.paused());
        
        // Operations should work again
        vm.prank(creator1);
        paywall.registerCreator();
        (bool isRegistered,,,) = paywall.getCreator(creator1);
        assertTrue(isRegistered);
    }

    // ============ Platform Stats Tests ============
    
    function test_GetPlatformStats() public {
        // Setup
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        paywall.createContent(0.01 ether);
        
        vm.prank(creator1);
        paywall.createContent(0.02 ether);
        
        vm.prank(user1);
        paywall.unlock{value: 0.01 ether}(1);
        
        (uint256 creators_, uint256 contents_, uint256 revenue_, uint256 platformBal_) = paywall.getPlatformStats();
        
        assertEq(creators_, 1);
        assertEq(contents_, 2);
        assertEq(revenue_, 0.01 ether);
        assertEq(platformBal_, (0.01 ether * PLATFORM_FEE_BPS) / 10000);
    }

    // ============ Edge Case Tests ============
    
    function test_ZeroPlatformFee() public {
        BasePaywallV2 zeroFeePaywall = new BasePaywallV2(platformOwner, 0);
        
        vm.prank(creator1);
        zeroFeePaywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = zeroFeePaywall.createContent(CONTENT_PRICE);
        
        vm.prank(user1);
        zeroFeePaywall.unlock{value: CONTENT_PRICE}(contentId);
        
        // All goes to creator
        (, uint256 creatorBalance,,) = zeroFeePaywall.getCreator(creator1);
        assertEq(creatorBalance, CONTENT_PRICE);
        assertEq(zeroFeePaywall.platformBalance(), 0);
    }
    
    function test_MaxPlatformFee() public {
        BasePaywallV2 maxFeePaywall = new BasePaywallV2(platformOwner, 1000); // 10%
        
        vm.prank(creator1);
        maxFeePaywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = maxFeePaywall.createContent(CONTENT_PRICE);
        
        vm.prank(user1);
        maxFeePaywall.unlock{value: CONTENT_PRICE}(contentId);
        
        uint256 expectedPlatformFee = CONTENT_PRICE / 10; // 10%
        uint256 expectedCreatorShare = CONTENT_PRICE - expectedPlatformFee;
        
        (, uint256 creatorBalance,,) = maxFeePaywall.getCreator(creator1);
        assertEq(creatorBalance, expectedCreatorShare);
        assertEq(maxFeePaywall.platformBalance(), expectedPlatformFee);
    }

    // ============ Fuzz Tests ============
    
    function testFuzz_CreateContent_ValidPrice(uint256 price) public {
        price = bound(price, paywall.MIN_CONTENT_PRICE(), paywall.MAX_CONTENT_PRICE());
        
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(price);
        
        (, uint256 storedPrice,,,) = paywall.getContent(contentId);
        assertEq(storedPrice, price);
    }
    
    function testFuzz_Unlock_CorrectFeeSplit(uint256 price) public {
        price = bound(price, paywall.MIN_CONTENT_PRICE(), paywall.MAX_CONTENT_PRICE());
        
        vm.prank(creator1);
        paywall.registerCreator();
        
        vm.prank(creator1);
        uint256 contentId = paywall.createContent(price);
        
        vm.prank(user1);
        paywall.unlock{value: price}(contentId);
        
        uint256 expectedPlatformFee = (price * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedCreatorShare = price - expectedPlatformFee;
        
        (, uint256 creatorBalance,,) = paywall.getCreator(creator1);
        assertEq(creatorBalance, expectedCreatorShare);
        assertEq(paywall.platformBalance(), expectedPlatformFee);
        assertEq(paywall.totalRevenue(), price);
    }
}
