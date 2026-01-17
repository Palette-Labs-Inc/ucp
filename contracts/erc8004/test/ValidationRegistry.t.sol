// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {ValidationRegistry} from "../src/ValidationRegistry.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract ValidationRegistryTest is Test {
    IdentityRegistry identityRegistry;
    ValidationRegistry validationRegistry;

    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);

    string aliceUri = "https://example.com/alice.json";

    event ValidationRequest(
        address indexed validatorAddress,
        uint256 indexed agentId,
        string requestURI,
        bytes32 indexed requestHash
    );

    event ValidationResponse(
        address indexed validatorAddress,
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint8 response,
        string responseURI,
        bytes32 responseHash,
        string tag
    );

    function setUp() public {
        identityRegistry = new IdentityRegistry();
        validationRegistry = new ValidationRegistry(address(identityRegistry));
    }

    function test_ValidationRequestEvent() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        bytes32 requestHash = keccak256("request");

        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit ValidationRequest(bob, agentId, "ipfs://request", requestHash);
        validationRegistry.validationRequest(bob, agentId, "ipfs://request", requestHash);
    }

    function test_ValidationResponseEvent() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        bytes32 requestHash = keccak256("request");
        vm.prank(alice);
        validationRegistry.validationRequest(bob, agentId, "ipfs://request", requestHash);

        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit ValidationResponse(bob, agentId, requestHash, 100, "ipfs://resp", bytes32(0), "ok");
        validationRegistry.validationResponse(requestHash, 100, "ipfs://resp", bytes32(0), "ok");
    }

    function test_ValidationRequest_Unauthorized() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        bytes32 requestHash = keccak256("request");

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized(address,address)", charlie, alice));
        validationRegistry.validationRequest(bob, agentId, "ipfs://request", requestHash);
    }

    function test_ValidationResponse_Unauthorized() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        bytes32 requestHash = keccak256("request");
        vm.prank(alice);
        validationRegistry.validationRequest(bob, agentId, "ipfs://request", requestHash);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSignature("Unauthorized(address,address)", charlie, bob));
        validationRegistry.validationResponse(requestHash, 100, "", bytes32(0), "");
    }

    function test_ValidationResponse_RequestNotFound() public {
        bytes32 requestHash = keccak256("missing");
        vm.expectRevert(abi.encodeWithSignature("RequestNotFound(bytes32)", requestHash));
        validationRegistry.validationResponse(requestHash, 100, "", bytes32(0), "");
    }

    function test_ValidationResponse_InvalidResponse() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        bytes32 requestHash = keccak256("request");
        vm.prank(alice);
        validationRegistry.validationRequest(bob, agentId, "ipfs://request", requestHash);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSignature("InvalidResponse(uint8,uint8,uint8)", 200, 0, 100));
        validationRegistry.validationResponse(requestHash, 200, "", bytes32(0), "");
    }

    function test_GetValidationStatus() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        bytes32 requestHash = keccak256("request");
        vm.prank(alice);
        validationRegistry.validationRequest(bob, agentId, "ipfs://request", requestHash);

        vm.prank(bob);
        validationRegistry.validationResponse(requestHash, 90, "ipfs://resp", bytes32(0), "soft");

        (address validatorAddress, uint256 storedAgentId, uint8 response, string memory tag, uint256 lastUpdate) =
            validationRegistry.getValidationStatus(requestHash);
        assertEq(validatorAddress, bob);
        assertEq(storedAgentId, agentId);
        assertEq(response, 90);
        assertEq(tag, "soft");
        assertTrue(lastUpdate > 0);
    }
}
