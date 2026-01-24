// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BasePaywallV3.sol";

/**
 * @title Deploy BasePaywall V3
 * @notice Deployment script for BasePaywallV3 with time-limited access
 * 
 * Usage:
 *   forge script script/DeployV3.s.sol:DeployV3 --rpc-url base-sepolia --broadcast --verify
 */
contract DeployV3 is Script {
    function run() external returns (BasePaywallV3) {
        // Configuration
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);
        uint256 platformFeeBps = vm.envOr("PLATFORM_FEE_BPS", uint256(250)); // Default 2.5%
        
        console.log("=== BasePaywall V3 Deployment ===");
        console.log("Owner:", owner);
        console.log("Platform Fee:", platformFeeBps, "bps");
        
        vm.startBroadcast(deployerPrivateKey);
        
        BasePaywallV3 paywall = new BasePaywallV3(owner, platformFeeBps);
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Contract Address:", address(paywall));
        console.log("");
        console.log("Verify with:");
        console.log("  forge verify-contract", address(paywall), "src/BasePaywallV3.sol:BasePaywallV3 --constructor-args $(cast abi-encode 'constructor(address,uint256)' ", owner, platformFeeBps, ")");
        
        return paywall;
    }
}
