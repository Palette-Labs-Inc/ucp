// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IValidationRegistry} from "./interfaces/IValidationRegistry.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";
import {Constants} from "./libraries/Constants.sol";

contract ValidationRegistry is IValidationRegistry {
    IIdentityRegistry private immutable IDENTITY_REGISTRY;

    uint256 public ttl;
    mapping(bytes32 dataHash => Request request) private _requests;

    /// @notice Initializes the Validation Registry with the address of the Identity Registry and request TTL
    /// @param identityRegistryAddress The address of the deployed Identity Registry contract
    /// @param requestTtl The time-to-live (TTL) for validation requests in seconds
    constructor(address identityRegistryAddress, uint256 requestTtl) {
        if (identityRegistryAddress == address(0)) {
            revert InvalidIdentityRegistryAddress();
        }

        IDENTITY_REGISTRY = IIdentityRegistry(identityRegistryAddress);
        ttl = requestTtl;
    }

    function identityRegistry() public view returns (IIdentityRegistry) {
        return IDENTITY_REGISTRY;
    }

    /// @inheritdoc IValidationRegistry
    function validationRequest(uint256 agentValidatorId, uint256 agentServerId, bytes32 dataHash) external {
        Request storage request = _requests[dataHash];

        if (request.agentValidatorId != 0) {
            revert AlreadyRequested(request.agentValidatorId, request.agentServerId, dataHash);
        }

        (,, address validatorAddress) = IDENTITY_REGISTRY.getAgent(agentValidatorId);
        if (validatorAddress == Constants.AGENT_ADDRESS_NONE) {
            revert AgentNotFound(agentValidatorId);
        }

        (,, address serverAddress) = IDENTITY_REGISTRY.getAgent(agentServerId);
        if (serverAddress == Constants.AGENT_ADDRESS_NONE) {
            revert AgentNotFound(agentServerId);
        }
        if (msg.sender != serverAddress) {
            revert Unauthorized(msg.sender, serverAddress);
        }

        request.agentValidatorId = agentValidatorId;
        request.agentServerId = agentServerId;
        request.expiresAt = block.timestamp + ttl;
        request.responded = false;

        emit ValidationRequest(agentValidatorId, agentServerId, dataHash);
    }

    /// @inheritdoc IValidationRegistry
    function validationResponse(bytes32 dataHash, uint8 response) external {
        Request storage request = _requests[dataHash];

        if (request.agentValidatorId == 0) {
            revert RequestNotFound(dataHash);
        }
        if (request.responded) {
            revert AlreadyResponded(request.agentValidatorId, request.agentServerId, dataHash);
        }

        (,, address validatorAddress) = IDENTITY_REGISTRY.getAgent(request.agentValidatorId);
        if (validatorAddress == Constants.AGENT_ADDRESS_NONE) {
            revert AgentNotFound(request.agentValidatorId);
        }
        if (msg.sender != validatorAddress) {
            revert Unauthorized(msg.sender, validatorAddress);
        }
        if (block.timestamp > request.expiresAt) {
            revert RequestExpired(dataHash, block.timestamp, request.expiresAt);
        }
        if (response < 0 || response > 100) {
            revert InvalidResponse(response, 0, 100);
        }

        request.responded = true;

        emit ValidationResponse(request.agentValidatorId, request.agentServerId, dataHash, response);
    }
}
