// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract ReputationRegistryTest is Test {
    IdentityRegistry identityRegistry;
    ReputationRegistry reputationRegistry;

    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);

    string aliceUri = "https://example.com/alice.json";

    event NewFeedback(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        uint8 score,
        string indexed tag1,
        string tag2,
        string endpoint,
        string feedbackURI,
        bytes32 feedbackHash
    );

    event FeedbackRevoked(uint256 indexed agentId, address indexed clientAddress, uint64 indexed feedbackIndex);

    event ResponseAppended(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        address indexed responder,
        string responseURI
    );

    function setUp() public {
        identityRegistry = new IdentityRegistry();
        reputationRegistry = new ReputationRegistry(address(identityRegistry));
    }

    function test_GiveFeedback() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit NewFeedback(
            agentId,
            bob,
            1,
            90,
            "quality",
            "fast",
            "https://api.example.com",
            "ipfs://feedback",
            bytes32(0)
        );
        reputationRegistry.giveFeedback(
            agentId,
            90,
            "quality",
            "fast",
            "https://api.example.com",
            "ipfs://feedback",
            bytes32(0)
        );

        (uint8 score, string memory tag1, string memory tag2, bool isRevoked) =
            reputationRegistry.readFeedback(agentId, bob, 1);
        assertEq(score, 90);
        assertEq(tag1, "quality");
        assertEq(tag2, "fast");
        assertFalse(isRevoked);
    }

    function test_RevokeFeedback() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 80, "", "", "", "", bytes32(0));

        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit FeedbackRevoked(agentId, bob, 1);
        reputationRegistry.revokeFeedback(agentId, 1);

        (, , , bool isRevoked) = reputationRegistry.readFeedback(agentId, bob, 1);
        assertTrue(isRevoked);
    }

    function test_AppendResponse_EmptyUri() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 70, "", "", "", "", bytes32(0));

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSignature("EmptyResponseURI()"));
        reputationRegistry.appendResponse(agentId, bob, 1, "", bytes32(0));
    }

    function test_AppendResponse() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 70, "", "", "", "", bytes32(0));

        vm.prank(charlie);
        vm.expectEmit(true, true, true, true);
        emit ResponseAppended(agentId, bob, 1, charlie, "ipfs://response");
        reputationRegistry.appendResponse(agentId, bob, 1, "ipfs://response", bytes32(0));
    }

    function test_GetSummary() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 60, "a", "", "", "", bytes32(0));

        vm.prank(charlie);
        reputationRegistry.giveFeedback(agentId, 80, "a", "", "", "", bytes32(0));

        (uint64 count, uint8 average) =
            reputationRegistry.getSummary(agentId, new address[](0), "a", "");
        assertEq(count, 2);
        assertEq(average, 70);
    }
}
