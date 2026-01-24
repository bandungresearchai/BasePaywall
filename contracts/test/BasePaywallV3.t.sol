// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/BasePaywallV3.sol";

contract BasePaywallV3Test is Test {
    BasePaywallV3 public paywall;
    
    address public owner = address(1);
    address public creator = address(2);
    address public user = address(3);
    
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant CONTENT_PRICE = 0.01 ether;
    uint256 public constant ONE_DAY = 1 days;
    uint256 public constant ONE_WEEK = 7 days;
    
    event CreatorRegistered(address indexed creator, uint256 timestamp);
    event ContentCreated(address indexed creator, uint256 indexed contentId, uint256 price, uint256 accessDuration);
    event ContentUnlocked(address indexed user, uint256 indexed contentId, address indexed creator, uint256 amount, uint256 expiresAt);
    event AccessExtended(address indexed user, uint256 indexed contentId, uint256 newExpiresAt, uint256 amount);

    function setUp() public {
        paywall = new BasePaywallV3(owner, PLATFORM_FEE);
        
        // Fund accounts
        vm.deal(creator, 10 ether);
        vm.deal(user, 10 ether);
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(paywall.owner(), owner);
        assertEq(paywall.platformFeeBps(), PLATFORM_FEE);
        assertEq(paywall.nextContentId(), 1);
    }

    function test_Constructor_RevertInvalidFee() public {
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV3.InvalidFee.selector, 1001));
        new BasePaywallV3(owner, 1001);
    }

    // ============ Creator Registration Tests ============

    function test_RegisterCreator() public {
        vm.prank(creator);
        vm.expectEmit(true, false, false, true);
        emit CreatorRegistered(creator, block.timestamp);
        paywall.registerCreator();
        
        (bool isRegistered, , , , ) = paywall.getCreator(creator);
        assertTrue(isRegistered);
    }

    function test_RegisterCreator_RevertAlreadyRegistered() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        
        vm.expectRevert(BasePaywallV3.AlreadyRegistered.selector);
        paywall.registerCreator();
        vm.stopPrank();
    }

    // ============ Content Creation Tests (Permanent Access) ============

    function test_CreateContent_Permanent() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        
        vm.expectEmit(true, true, false, true);
        emit ContentCreated(creator, 1, CONTENT_PRICE, 0);
        uint256 contentId = paywall.createContent(CONTENT_PRICE, 0);
        
        assertEq(contentId, 1);
        
        (address contentCreator, uint256 price, bool enabled, , , uint256 accessDuration) = paywall.getContent(contentId);
        assertEq(contentCreator, creator);
        assertEq(price, CONTENT_PRICE);
        assertTrue(enabled);
        assertEq(accessDuration, 0); // Permanent
        vm.stopPrank();
    }

    // ============ Content Creation Tests (Time-Limited Access) ============

    function test_CreateContent_TimeLimited() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        
        vm.expectEmit(true, true, false, true);
        emit ContentCreated(creator, 1, CONTENT_PRICE, ONE_WEEK);
        uint256 contentId = paywall.createContent(CONTENT_PRICE, ONE_WEEK);
        
        (address contentCreator, uint256 price, bool enabled, , , uint256 accessDuration) = paywall.getContent(contentId);
        assertEq(contentCreator, creator);
        assertEq(price, CONTENT_PRICE);
        assertTrue(enabled);
        assertEq(accessDuration, ONE_WEEK);
        vm.stopPrank();
    }

    function test_CreateContent_RevertInvalidDuration_TooShort() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        
        // Less than 1 hour
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV3.InvalidDuration.selector, 30 minutes));
        paywall.createContent(CONTENT_PRICE, 30 minutes);
        vm.stopPrank();
    }

    function test_CreateContent_RevertInvalidDuration_TooLong() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        
        // More than 365 days
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV3.InvalidDuration.selector, 400 days));
        paywall.createContent(CONTENT_PRICE, 400 days);
        vm.stopPrank();
    }

    // ============ Unlock Tests (Permanent Access) ============

    function test_Unlock_PermanentAccess() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, 0);
        vm.stopPrank();
        
        // Unlock
        vm.prank(user);
        paywall.unlock{value: CONTENT_PRICE}(1);
        
        // Check access
        assertTrue(paywall.checkAccess(1, user));
        
        // Check access details
        (bool hasAccess, uint256 expiresAt, bool isActive, ) = paywall.getAccessDetails(1, user);
        assertTrue(hasAccess);
        assertEq(expiresAt, 0); // Permanent
        assertTrue(isActive);
    }

    // ============ Unlock Tests (Time-Limited Access) ============

    function test_Unlock_TimeLimitedAccess() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, ONE_WEEK);
        vm.stopPrank();
        
        // Unlock at specific time
        vm.warp(1000);
        
        vm.prank(user);
        paywall.unlock{value: CONTENT_PRICE}(1);
        
        // Check access details
        (bool hasAccess, uint256 expiresAt, bool isActive, uint256 timeRemaining) = paywall.getAccessDetails(1, user);
        assertTrue(hasAccess);
        assertEq(expiresAt, 1000 + ONE_WEEK);
        assertTrue(isActive);
        assertEq(timeRemaining, ONE_WEEK);
        
        // Check access is valid
        assertTrue(paywall.checkAccess(1, user));
    }

    function test_Unlock_TimeLimitedAccess_Expires() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, ONE_WEEK);
        vm.stopPrank();
        
        // Unlock
        vm.warp(1000);
        vm.prank(user);
        paywall.unlock{value: CONTENT_PRICE}(1);
        
        // Access is valid now
        assertTrue(paywall.checkAccess(1, user));
        
        // Fast forward past expiration
        vm.warp(1000 + ONE_WEEK + 1);
        
        // Access should be expired
        assertFalse(paywall.checkAccess(1, user));
        
        // Check access details
        (bool hasAccess, , bool isActive, uint256 timeRemaining) = paywall.getAccessDetails(1, user);
        assertTrue(hasAccess); // Has purchased
        assertFalse(isActive); // But expired
        assertEq(timeRemaining, 0);
    }

    // ============ Extend Access Tests ============

    function test_ExtendAccess_BeforeExpiration() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, ONE_WEEK);
        vm.stopPrank();
        
        // Initial unlock
        vm.warp(1000);
        vm.prank(user);
        paywall.unlock{value: CONTENT_PRICE}(1);
        
        // Extend access halfway through
        vm.warp(1000 + 3 days);
        vm.prank(user);
        paywall.extendAccess{value: CONTENT_PRICE}(1);
        
        // Check new expiration (extends from original expiration)
        (, uint256 expiresAt, , ) = paywall.getAccessDetails(1, user);
        assertEq(expiresAt, 1000 + ONE_WEEK + ONE_WEEK); // Original + extension
    }

    function test_ExtendAccess_AfterExpiration() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, ONE_WEEK);
        vm.stopPrank();
        
        // Initial unlock
        vm.warp(1000);
        vm.prank(user);
        paywall.unlock{value: CONTENT_PRICE}(1);
        
        // Wait for expiration
        vm.warp(1000 + ONE_WEEK + 10 days);
        assertFalse(paywall.checkAccess(1, user));
        
        // Extend access
        vm.prank(user);
        paywall.extendAccess{value: CONTENT_PRICE}(1);
        
        // Check access restored (extends from now)
        assertTrue(paywall.checkAccess(1, user));
        (, uint256 expiresAt, , ) = paywall.getAccessDetails(1, user);
        assertEq(expiresAt, block.timestamp + ONE_WEEK);
    }

    function test_ExtendAccess_RevertPermanentContent() public {
        // Setup permanent content
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, 0);
        vm.stopPrank();
        
        // Unlock
        vm.prank(user);
        paywall.unlock{value: CONTENT_PRICE}(1);
        
        // Try to extend permanent access
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(BasePaywallV3.InvalidDuration.selector, 0));
        paywall.extendAccess{value: CONTENT_PRICE}(1);
    }

    function test_ExtendAccess_RevertNoPriorPurchase() public {
        // Setup
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, ONE_WEEK);
        vm.stopPrank();
        
        // Try to extend without prior purchase
        vm.prank(user);
        vm.expectRevert(BasePaywallV3.NoAccessToExtend.selector);
        paywall.extendAccess{value: CONTENT_PRICE}(1);
    }

    // ============ Get Active Content Tests ============

    function test_GetUserActiveContent() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, ONE_WEEK);   // ID 1
        paywall.createContent(CONTENT_PRICE, ONE_DAY);    // ID 2
        paywall.createContent(CONTENT_PRICE, 0);          // ID 3 (permanent)
        vm.stopPrank();
        
        // Unlock all
        vm.warp(1000);
        vm.startPrank(user);
        paywall.unlock{value: CONTENT_PRICE}(1);
        paywall.unlock{value: CONTENT_PRICE}(2);
        paywall.unlock{value: CONTENT_PRICE}(3);
        vm.stopPrank();
        
        // All should be active
        uint256[] memory active = paywall.getUserActiveContent(user);
        assertEq(active.length, 3);
        
        // After 2 days, ID 2 should be expired
        vm.warp(1000 + 2 days);
        active = paywall.getUserActiveContent(user);
        assertEq(active.length, 2);
        
        // After 2 weeks, ID 1 should also be expired
        vm.warp(1000 + 2 weeks);
        active = paywall.getUserActiveContent(user);
        assertEq(active.length, 1); // Only permanent access remains
    }

    // ============ Revenue & Withdrawal Tests ============

    function test_Revenue_TimeLimited_MultipleRenewals() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, ONE_WEEK);
        vm.stopPrank();
        
        // Initial purchase + 2 renewals = 3 payments
        vm.startPrank(user);
        paywall.unlock{value: CONTENT_PRICE}(1);
        paywall.extendAccess{value: CONTENT_PRICE}(1);
        paywall.extendAccess{value: CONTENT_PRICE}(1);
        vm.stopPrank();
        
        // Check revenue
        (, , , uint256 revenue, uint256 unlockCount, ) = paywall.getContent(1);
        assertEq(revenue, CONTENT_PRICE * 3);
        assertEq(unlockCount, 3);
        
        // Check creator balance
        uint256 expectedCreatorShare = (CONTENT_PRICE * 3 * (10000 - PLATFORM_FEE)) / 10000;
        (, uint256 balance, , , ) = paywall.getCreator(creator);
        assertEq(balance, expectedCreatorShare);
    }

    // ============ Update Content Tests ============

    function test_UpdateContent_ChangeAccessDuration() public {
        vm.startPrank(creator);
        paywall.registerCreator();
        paywall.createContent(CONTENT_PRICE, ONE_WEEK);
        
        // Update to 30 days
        paywall.updateContent(1, 0, true, 30 days);
        
        (, , , , , uint256 accessDuration) = paywall.getContent(1);
        assertEq(accessDuration, 30 days);
        
        // Update to permanent
        paywall.updateContent(1, 0, true, 0);
        
        (, , , , , accessDuration) = paywall.getContent(1);
        assertEq(accessDuration, 0);
        vm.stopPrank();
    }
}
