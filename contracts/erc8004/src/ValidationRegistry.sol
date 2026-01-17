// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.30;

import {IValidationRegistry} from "./interfaces/IValidationRegistry.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";

contract ValidationRegistry is IValidationRegistry {
    IIdentityRegistry public immutable identityRegistry;

    struct Request {
        address validatorAddress;
        uint256 agentId;
        string requestURI;
        uint256 timestamp;
    }

    struct Response {
        uint8 response;
        string responseURI;
        bytes32 responseHash;
        string tag;
        uint256 lastUpdate;
    }

    mapping(bytes32 => Request) private _requests;
    mapping(bytes32 => Response) private _responses;
    mapping(bytes32 => bool) private _requestExists;
    mapping(uint256 => bytes32[]) private _agentRequests;
    mapping(address => bytes32[]) private _validatorRequests;

    constructor(address identityRegistryAddress) {
        if (identityRegistryAddress == address(0)) {
            revert InvalidIdentityRegistryAddress();
        }
        identityRegistry = IIdentityRegistry(identityRegistryAddress);
    }

    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external {
        require(bytes(requestURI).length > 0, "Empty requestURI");
        require(requestHash != bytes32(0), "Empty requestHash");
        if (!identityRegistry.agentExists(agentId)) {
            revert AgentNotFound(agentId);
        }
        address owner = identityRegistry.ownerOf(agentId);
        if (!_isAuthorized(owner, msg.sender, agentId)) {
            revert Unauthorized(msg.sender, owner);
        }
        require(!_requestExists[requestHash], "Request already exists");

        _requestExists[requestHash] = true;
        _requests[requestHash] = Request({
            validatorAddress: validatorAddress,
            agentId: agentId,
            requestURI: requestURI,
            timestamp: block.timestamp
        });

        _agentRequests[agentId].push(requestHash);
        _validatorRequests[validatorAddress].push(requestHash);

        emit ValidationRequest(validatorAddress, agentId, requestURI, requestHash);
    }

    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external {
        if (!_requestExists[requestHash]) {
            revert RequestNotFound(requestHash);
        }
        if (response > 100) {
            revert InvalidResponse(response, 0, 100);
        }
        Request storage request = _requests[requestHash];
        if (msg.sender != request.validatorAddress) {
            revert Unauthorized(msg.sender, request.validatorAddress);
        }

        _responses[requestHash] = Response({
            response: response,
            responseURI: responseURI,
            responseHash: responseHash,
            tag: tag,
            lastUpdate: block.timestamp
        });

        emit ValidationResponse(
            request.validatorAddress,
            request.agentId,
            requestHash,
            response,
            responseURI,
            responseHash,
            tag
        );
    }

    function getValidationStatus(bytes32 requestHash)
        external
        view
        returns (
            address validatorAddress,
            uint256 agentId,
            uint8 response,
            string memory tag,
            uint256 lastUpdate
        )
    {
        if (!_requestExists[requestHash]) {
            revert RequestNotFound(requestHash);
        }
        Request storage request = _requests[requestHash];
        Response storage stored = _responses[requestHash];
        return (request.validatorAddress, request.agentId, stored.response, stored.tag, stored.lastUpdate);
    }

    function getSummary(
        uint256 agentId,
        address[] calldata validatorAddresses,
        string calldata tag
    ) external view returns (uint64 count, uint8 averageResponse) {
        bytes32[] memory requestHashes = _agentRequests[agentId];
        bool filterValidator = validatorAddresses.length > 0;
        bool filterTag = bytes(tag).length > 0;
        uint256 total = 0;

        for (uint256 i = 0; i < requestHashes.length; i++) {
            bytes32 requestHash = requestHashes[i];
            Response storage stored = _responses[requestHash];
            if (stored.lastUpdate == 0) continue;

            Request storage request = _requests[requestHash];
            if (filterValidator && !_containsValidator(validatorAddresses, request.validatorAddress)) continue;
            if (filterTag && keccak256(bytes(stored.tag)) != keccak256(bytes(tag))) continue;

            total += stored.response;
            count += 1;
        }

        averageResponse = count > 0 ? uint8(total / count) : 0;
    }

    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory requestHashes) {
        return _agentRequests[agentId];
    }

    function getValidatorRequests(address validatorAddress)
        external
        view
        returns (bytes32[] memory requestHashes)
    {
        return _validatorRequests[validatorAddress];
    }

    function requestExists(bytes32 requestHash) external view returns (bool exists) {
        return _requestExists[requestHash];
    }

    function getRequest(bytes32 requestHash)
        external
        view
        returns (address validatorAddress, uint256 agentId, string memory requestURI, uint256 timestamp)
    {
        if (!_requestExists[requestHash]) {
            revert RequestNotFound(requestHash);
        }
        Request storage request = _requests[requestHash];
        return (request.validatorAddress, request.agentId, request.requestURI, request.timestamp);
    }

    function getIdentityRegistry() external view returns (address registry) {
        return address(identityRegistry);
    }

    function _isAuthorized(address owner, address spender, uint256 tokenId) internal view returns (bool) {
        return spender == owner
            || identityRegistry.getApproved(tokenId) == spender
            || identityRegistry.isApprovedForAll(owner, spender);
    }

    function _containsValidator(address[] calldata validators, address validator)
        internal
        pure
        returns (bool)
    {
        for (uint256 i = 0; i < validators.length; i++) {
            if (validators[i] == validator) return true;
        }
        return false;
    }
}
