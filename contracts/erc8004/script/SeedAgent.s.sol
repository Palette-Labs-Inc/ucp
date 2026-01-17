// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";

import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract SeedAgent is Script {
    using stdJson for string;

    function run() external {
        uint256 agentKey = vm.envUint("AGENT_PRIVATE_KEY");
        string memory agentDomain = vm.envString("AGENT_DOMAIN");
        address agentAddress = vm.addr(agentKey);

        address registryAddress = _resolveRegistry();

        vm.startBroadcast(agentKey);
        IdentityRegistry(registryAddress).newAgent(agentDomain, agentAddress);
        vm.stopBroadcast();
    }

    function _resolveRegistry() private view returns (address registry) {
        registry = vm.envAddress("IDENTITY_REGISTRY");
        if (registry == address(0)) {
            revert("IDENTITY_REGISTRY is required");
        }
    }
}
