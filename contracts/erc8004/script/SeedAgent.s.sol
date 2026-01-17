// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "forge-std/StdJson.sol";

import "../src/IdentityRegistry.sol";

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
        if (vm.envOr("IDENTITY_REGISTRY", address(0)) != address(0)) {
            return vm.envAddress("IDENTITY_REGISTRY");
        }

        string memory root = vm.projectRoot();
        string memory outFile = string.concat(root, "/broadcast/identity-registry.json");
        string memory json = vm.readFile(outFile);
        registry = json.readAddress(".identityRegistry");
    }
}
