// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BasePaywallV4.sol";

/**
 * @title Deploy BasePaywall V4
 * @notice Deployment script for BasePaywallV4 with NFT Access Tokens
 * 
 * Usage:
 *   forge script script/DeployV4.s.sol:DeployV4 --rpc-url base-sepolia --broadcast --verify
 */
contract DeployV4 is Script {
    function run() external returns (BasePaywallV4) {
        // Configuration
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);
        uint256 platformFeeBps = vm.envOr("PLATFORM_FEE_BPS", uint256(250)); // Default 2.5%
        string memory nftName = vm.envOr("NFT_NAME", string("BasePaywall Access"));
        string memory nftSymbol = vm.envOr("NFT_SYMBOL", string("BPAY"));
        string memory baseURI = vm.envOr("BASE_URI", string("https://api.basepaywall.xyz/token/"));
        
        console.log("=== BasePaywall V4 (NFT) Deployment ===");
        console.log("Owner:", owner);
        console.log("Platform Fee:", platformFeeBps, "bps");
        console.log("NFT Name:", nftName);
        console.log("NFT Symbol:", nftSymbol);
        console.log("Base URI:", baseURI);
        
        vm.startBroadcast(deployerPrivateKey);
        
        BasePaywallV4 paywall = new BasePaywallV4(
            owner, 
            platformFeeBps,
            nftName,
            nftSymbol,
            baseURI
        );
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Contract Address:", address(paywall));
        console.log("");
        console.log("Features:");
        console.log("  - ERC721 Access Tokens");
        console.log("  - Transferable Access");
        console.log("  - EIP-2981 Royalties");
        console.log("  - Limited Supply Support");
        console.log("");
        console.log("OpenSea URL: https://testnets.opensea.io/assets/base-sepolia/", address(paywall));
        
        return paywall;
    }
}
