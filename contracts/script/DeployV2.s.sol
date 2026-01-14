// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BasePaywallV2.sol";

/**
 * @title DeployV2
 * @notice Deployment script for BasePaywallV2 on Base
 * 
 * Usage:
 *   # Base Sepolia (testnet)
 *   forge script script/DeployV2.s.sol:DeployV2 \
 *     --rpc-url $BASE_SEPOLIA_RPC_URL \
 *     --account deployer \
 *     --broadcast \
 *     --verify
 * 
 *   # Base Mainnet
 *   forge script script/DeployV2.s.sol:DeployV2 \
 *     --rpc-url $BASE_MAINNET_RPC_URL \
 *     --account deployer \
 *     --broadcast \
 *     --verify
 */
contract DeployV2 is Script {
    // Platform fee: 2.5% (250 basis points)
    uint256 constant PLATFORM_FEE_BPS = 250;

    function run() external {
        // Get deployer from environment or use default
        address deployer = msg.sender;
        
        console.log("Deploying BasePaywallV2...");
        console.log("Platform Owner:", deployer);
        console.log("Platform Fee: 250 bps (2.5%)");

        vm.startBroadcast();

        BasePaywallV2 paywall = new BasePaywallV2(deployer, PLATFORM_FEE_BPS);

        vm.stopBroadcast();

        console.log("BasePaywallV2 deployed at:", address(paywall));
        console.log("");
        console.log("Next steps:");
        console.log("1. Update frontend/src/config/contract.ts with the new address");
        console.log("2. Verify on BaseScan if not auto-verified");
    }
}

/**
 * @title DeployV2WithCustomFee
 * @notice Deploy with custom platform fee
 * 
 * Usage:
 *   PLATFORM_FEE_BPS=500 forge script script/DeployV2.s.sol:DeployV2WithCustomFee ...
 */
contract DeployV2WithCustomFee is Script {
    function run() external {
        uint256 feeBps = vm.envOr("PLATFORM_FEE_BPS", uint256(250));
        address deployer = msg.sender;
        
        require(feeBps <= 1000, "Fee cannot exceed 10%");
        
        console.log("Deploying BasePaywallV2 with custom fee...");
        console.log("Platform Owner:", deployer);
        console.log("Platform Fee:", feeBps, "bps");

        vm.startBroadcast();

        BasePaywallV2 paywall = new BasePaywallV2(deployer, feeBps);

        vm.stopBroadcast();

        console.log("BasePaywallV2 deployed at:", address(paywall));
    }
}
