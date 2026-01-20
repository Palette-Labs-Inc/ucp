// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {MockERC3009Token} from "../test/mocks/MockERC3009Token.sol";

contract DeployMockToken is Script {
    function run() external returns (address token) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address buyer = vm.envAddress("BUYER_ADDRESS");
        uint256 buyerAmount = vm.envUint("BUYER_AMOUNT");

        vm.startBroadcast(deployerKey);
        MockERC3009Token mockToken = new MockERC3009Token("USD Coin", "USDC", 6);
        mockToken.mint(buyer, buyerAmount);
        token = address(mockToken);
        vm.stopBroadcast();

        console2.log("MockERC3009Token:", token);
        console2.log("Buyer:", buyer);
        console2.log("BuyerAmount:", buyerAmount);
    }
}
