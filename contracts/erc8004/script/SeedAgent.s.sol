// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";

import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract SeedAgent is Script {
    function run(address registryAddress) external {
        uint256 agentKey = vm.envUint("AGENT_PRIVATE_KEY");
        string memory agentDomain = vm.envString("AGENT_DOMAIN");
        address agentAddress = vm.addr(agentKey);

        if (registryAddress == address(0)) {
            revert("IDENTITY_REGISTRY is required");
        }

        vm.startBroadcast(agentKey);
        IdentityRegistry(registryAddress).newAgent(agentDomain, agentAddress);
        vm.stopBroadcast();
    }
}
