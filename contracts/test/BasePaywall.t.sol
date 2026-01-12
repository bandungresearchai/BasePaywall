// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BasePaywall.sol";

contract BasePaywallTest is Test {
    BasePaywall public paywall;
    address public owner;
    address public user1;
    address public user2;

    uint256 public constant PRICE = 0.001 ether;

    event PaymentMade(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event ContentUpdated(address indexed owner);

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
        assertEq(paywall.PRICE(), PRICE);
        assertEq(paywall.hasPaid(user1), false);
        assertEq(paywall.hasPaid(user2), false);
    }

    function test_PaySuccess() public {
        vm.prank(user1);
        
        vm.expectEmit(true, false, false, true);
        emit PaymentMade(user1, PRICE);
        
        paywall.pay{value: PRICE}();
        
        assertTrue(paywall.hasPaid(user1));
        assertEq(address(paywall).balance, PRICE);
    }

    function test_PayWithExcess() public {
        uint256 excessAmount = 0.002 ether;
        uint256 userBalanceBefore = user1.balance;
        
        vm.prank(user1);
        paywall.pay{value: excessAmount}();
        
        assertTrue(paywall.hasPaid(user1));
        assertEq(address(paywall).balance, PRICE);
        // User should get refund of excess
        assertEq(user1.balance, userBalanceBefore - PRICE);
    }

    function test_PayInsufficientAmount() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                BasePaywall.InsufficientPayment.selector,
                PRICE,
                PRICE - 1
            )
        );
        paywall.pay{value: PRICE - 1}();
    }

    function test_PayAlreadyPaid() public {
        vm.startPrank(user1);
        paywall.pay{value: PRICE}();
        
        vm.expectRevert(BasePaywall.AlreadyPaid.selector);
        paywall.pay{value: PRICE}();
        vm.stopPrank();
    }

    function test_ContentAccessAfterPayment() public {
        vm.startPrank(user1);
        paywall.pay{value: PRICE}();
        
        string memory content = paywall.content();
        assertTrue(bytes(content).length > 0);
        vm.stopPrank();
    }

    function test_ContentAccessWithoutPayment() public {
        vm.prank(user1);
        vm.expectRevert(BasePaywall.PaymentRequired.selector);
        paywall.content();
    }

    function test_CheckHasPaid() public {
        assertFalse(paywall.checkHasPaid(user1));
        
        vm.prank(user1);
        paywall.pay{value: PRICE}();
        
        assertTrue(paywall.checkHasPaid(user1));
    }

    function test_SetContent() public {
        string memory newContent = "New premium content!";
        
        vm.expectEmit(true, false, false, false);
        emit ContentUpdated(owner);
        
        paywall.setContent(newContent);
        
        // Pay and verify new content
        vm.prank(user1);
        paywall.pay{value: PRICE}();
        
        vm.prank(user1);
        assertEq(paywall.content(), newContent);
    }

    function test_SetContentNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user1
            )
        );
        paywall.setContent("Hacked content");
    }

    function test_Withdraw() public {
        // First, have some users pay
        vm.prank(user1);
        paywall.pay{value: PRICE}();
        
        vm.prank(user2);
        paywall.pay{value: PRICE}();
        
        uint256 expectedBalance = PRICE * 2;
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
        paywall.pay{value: PRICE}();
        
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
        paywall.pay{value: PRICE}();
        
        assertEq(paywall.getBalance(), PRICE);
    }

    function test_GetPrice() public view {
        assertEq(paywall.getPrice(), PRICE);
    }

    function testFuzz_PayWithVariousAmounts(uint256 amount) public {
        vm.assume(amount >= PRICE && amount <= 100 ether);
        vm.deal(user1, amount);
        
        uint256 balanceBefore = user1.balance;
        
        vm.prank(user1);
        paywall.pay{value: amount}();
        
        assertTrue(paywall.hasPaid(user1));
        // Contract should only keep PRICE, rest refunded
        assertEq(address(paywall).balance, PRICE);
        assertEq(user1.balance, balanceBefore - PRICE);
    }
}
