// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BasePaywall
 * @dev On-chain content paywall implementing HTTP 402 "Payment Required" model on Base L2
 * @notice Users pay a fixed price to unlock gated content
 */
contract BasePaywall is Ownable, ReentrancyGuard {
    /// @notice Price required to unlock content (in wei)
    uint256 public constant PRICE = 0.001 ether;

    /// @notice Mapping of addresses to their payment status
    mapping(address => bool) public hasPaid;

    /// @notice The locked content that becomes accessible after payment
    string private _lockedContent;

    /// @notice Emitted when a user successfully makes a payment
    event PaymentMade(address indexed user, uint256 amount);

    /// @notice Emitted when the owner withdraws funds
    event FundsWithdrawn(address indexed owner, uint256 amount);

    /// @notice Emitted when locked content is updated
    event ContentUpdated(address indexed owner);

    /// @notice Error thrown when payment amount is insufficient
    error InsufficientPayment(uint256 required, uint256 provided);

    /// @notice Error thrown when user hasn't paid to access content
    error PaymentRequired();

    /// @notice Error thrown when user has already paid
    error AlreadyPaid();

    /// @notice Error thrown when withdrawal fails
    error WithdrawalFailed();

    /**
     * @dev Constructor sets the initial owner and default locked content
     * @param initialOwner Address of the contract owner
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        _lockedContent = "Congratulations! You have unlocked the premium content. This is your exclusive access to the BasePaywall protected material.";
    }

    /**
     * @notice Pay to unlock content access
     * @dev Requires msg.value >= PRICE and marks sender as having paid
     */
    function pay() external payable nonReentrant {
        if (hasPaid[msg.sender]) {
            revert AlreadyPaid();
        }
        if (msg.value < PRICE) {
            revert InsufficientPayment(PRICE, msg.value);
        }

        hasPaid[msg.sender] = true;
        emit PaymentMade(msg.sender, msg.value);

        // Refund excess payment
        if (msg.value > PRICE) {
            uint256 refund = msg.value - PRICE;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            if (!success) {
                revert WithdrawalFailed();
            }
        }
    }

    /**
     * @notice Get the locked content (only accessible after payment)
     * @dev Reverts if caller hasn't paid
     * @return The locked content string
     */
    function content() public view returns (string memory) {
        if (!hasPaid[msg.sender]) {
            revert PaymentRequired();
        }
        return _lockedContent;
    }

    /**
     * @notice Check if a specific address has paid
     * @param user The address to check
     * @return Whether the user has paid
     */
    function checkHasPaid(address user) public view returns (bool) {
        return hasPaid[user];
    }

    /**
     * @notice Update the locked content (owner only)
     * @param newContent The new content to lock behind the paywall
     */
    function setContent(string calldata newContent) external onlyOwner {
        _lockedContent = newContent;
        emit ContentUpdated(msg.sender);
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

    /**
     * @notice Get the required payment price
     * @return The price in wei
     */
    function getPrice() external pure returns (uint256) {
        return PRICE;
    }
}
