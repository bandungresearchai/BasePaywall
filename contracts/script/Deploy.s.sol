// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BasePaywall.sol";

contract DeployBasePaywall is Script {
    function run() external returns (BasePaywall) {
        // Get deployer address from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying BasePaywall with owner:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        BasePaywall paywall = new BasePaywall(deployer);
        
        vm.stopBroadcast();
        
        console.log("BasePaywall deployed at:", address(paywall));
        console.log("Default Price:", paywall.DEFAULT_PRICE());
        
        return paywall;
    }
}
