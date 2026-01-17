// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.30;

import {IReputationRegistry} from "./interfaces/IReputationRegistry.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";

contract ReputationRegistry is IReputationRegistry {
    IIdentityRegistry public immutable identityRegistry;

    struct Feedback {
        uint8 score;
        string tag1;
        string tag2;
        bool isRevoked;
    }

    mapping(uint256 => mapping(address => mapping(uint64 => Feedback))) private _feedback;
    mapping(uint256 => mapping(address => uint64)) private _lastIndex;
    mapping(uint256 => address[]) private _clients;
    mapping(uint256 => mapping(address => bool)) private _clientExists;
    mapping(uint256 => mapping(address => mapping(uint64 => mapping(address => uint64)))) private _responseCount;

    constructor(address identityRegistryAddress) {
        if (identityRegistryAddress == address(0)) {
            revert InvalidIdentityRegistryAddress();
        }
        identityRegistry = IIdentityRegistry(identityRegistryAddress);
    }

    function giveFeedback(
        uint256 agentId,
        uint8 score,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external {
        if (score > 100) {
            revert InvalidScore(score, 0, 100);
        }
        if (!identityRegistry.agentExists(agentId)) {
            revert AgentNotFound(agentId);
        }

        uint64 feedbackIndex = _lastIndex[agentId][msg.sender] + 1;
        _lastIndex[agentId][msg.sender] = feedbackIndex;

        _feedback[agentId][msg.sender][feedbackIndex] = Feedback({
            score: score,
            tag1: tag1,
            tag2: tag2,
            isRevoked: false
        });

        if (!_clientExists[agentId][msg.sender]) {
            _clientExists[agentId][msg.sender] = true;
            _clients[agentId].push(msg.sender);
        }

        emit NewFeedback(
            agentId,
            msg.sender,
            feedbackIndex,
            score,
            tag1,
            tag2,
            endpoint,
            feedbackURI,
            feedbackHash
        );
    }

    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external {
        uint64 lastIndex = _lastIndex[agentId][msg.sender];
        if (feedbackIndex == 0 || feedbackIndex > lastIndex) {
            revert InvalidFeedbackIndex(feedbackIndex);
        }
        Feedback storage feedback = _feedback[agentId][msg.sender][feedbackIndex];
        if (feedback.isRevoked) {
            revert AlreadyRevoked(agentId, msg.sender, feedbackIndex);
        }
        feedback.isRevoked = true;
        emit FeedbackRevoked(agentId, msg.sender, feedbackIndex);
    }

    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseURI,
        bytes32 responseHash
    ) external {
        uint64 lastIndex = _lastIndex[agentId][clientAddress];
        if (feedbackIndex == 0 || feedbackIndex > lastIndex) {
            revert InvalidFeedbackIndex(feedbackIndex);
        }
        if (bytes(responseURI).length == 0) {
            revert EmptyResponseURI();
        }

        _responseCount[agentId][clientAddress][feedbackIndex][msg.sender] += 1;
        emit ResponseAppended(agentId, clientAddress, feedbackIndex, msg.sender, responseURI, responseHash);
    }

    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, uint8 averageScore) {
        address[] memory clients = clientAddresses.length > 0
            ? clientAddresses
            : _clients[agentId];

        uint256 totalScore = 0;
        uint64 validCount = 0;
        bool filterTag1 = bytes(tag1).length > 0;
        bool filterTag2 = bytes(tag2).length > 0;

        for (uint256 i = 0; i < clients.length; i++) {
            uint64 lastIndex = _lastIndex[agentId][clients[i]];
            for (uint64 j = 1; j <= lastIndex; j++) {
                Feedback storage feedback = _feedback[agentId][clients[i]][j];
                if (feedback.isRevoked) continue;
                if (filterTag1 && keccak256(bytes(feedback.tag1)) != keccak256(bytes(tag1))) continue;
                if (filterTag2 && keccak256(bytes(feedback.tag2)) != keccak256(bytes(tag2))) continue;
                totalScore += feedback.score;
                validCount += 1;
            }
        }

        count = validCount;
        averageScore = validCount > 0 ? uint8(totalScore / validCount) : 0;
    }

    function readFeedback(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex
    ) external view returns (uint8 score, string memory tag1, string memory tag2, bool isRevoked) {
        uint64 lastIndex = _lastIndex[agentId][clientAddress];
        if (feedbackIndex == 0 || feedbackIndex > lastIndex) {
            revert InvalidFeedbackIndex(feedbackIndex);
        }
        Feedback storage feedback = _feedback[agentId][clientAddress][feedbackIndex];
        return (feedback.score, feedback.tag1, feedback.tag2, feedback.isRevoked);
    }

    function readAllFeedback(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2,
        bool includeRevoked
    )
        external
        view
        returns (
            address[] memory clientAddresses_,
            uint64[] memory feedbackIndexes,
            uint8[] memory scores,
            string[] memory tag1s,
            string[] memory tag2s,
            bool[] memory revokedStatuses
        )
    {
        address[] memory clients = clientAddresses.length > 0
            ? clientAddresses
            : _clients[agentId];

        uint256 totalCount = _countValidFeedback(agentId, clients, tag1, tag2, includeRevoked);
        clientAddresses_ = new address[](totalCount);
        feedbackIndexes = new uint64[](totalCount);
        scores = new uint8[](totalCount);
        tag1s = new string[](totalCount);
        tag2s = new string[](totalCount);
        revokedStatuses = new bool[](totalCount);

        _populateFeedbackArrays(
            agentId,
            clients,
            tag1,
            tag2,
            includeRevoked,
            clientAddresses_,
            feedbackIndexes,
            scores,
            tag1s,
            tag2s,
            revokedStatuses
        );
    }

    function getResponseCount(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        address[] calldata responders
    ) external view returns (uint64 count) {
        if (responders.length == 0) {
            return 0;
        }

        if (clientAddress == address(0)) {
            address[] memory clients = _clients[agentId];
            for (uint256 i = 0; i < clients.length; i++) {
                uint64 lastIndex = _lastIndex[agentId][clients[i]];
                for (uint64 j = 1; j <= lastIndex; j++) {
                    for (uint256 k = 0; k < responders.length; k++) {
                        count += _responseCount[agentId][clients[i]][j][responders[k]];
                    }
                }
            }
            return count;
        }

        if (feedbackIndex == 0) {
            uint64 lastIndex = _lastIndex[agentId][clientAddress];
            for (uint64 j = 1; j <= lastIndex; j++) {
                for (uint256 k = 0; k < responders.length; k++) {
                    count += _responseCount[agentId][clientAddress][j][responders[k]];
                }
            }
            return count;
        }

        for (uint256 k = 0; k < responders.length; k++) {
            count += _responseCount[agentId][clientAddress][feedbackIndex][responders[k]];
        }
    }

    function getClients(uint256 agentId) external view returns (address[] memory clientList) {
        return _clients[agentId];
    }

    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64 lastIndex) {
        return _lastIndex[agentId][clientAddress];
    }

    function getIdentityRegistry() external view returns (address registry) {
        return address(identityRegistry);
    }

    function _countValidFeedback(
        uint256 agentId,
        address[] memory clientList,
        string calldata tag1,
        string calldata tag2,
        bool includeRevoked
    ) internal view returns (uint256 totalCount) {
        bool filterTag1 = bytes(tag1).length > 0;
        bool filterTag2 = bytes(tag2).length > 0;

        for (uint256 i = 0; i < clientList.length; i++) {
            uint64 lastIndex = _lastIndex[agentId][clientList[i]];
            for (uint64 j = 1; j <= lastIndex; j++) {
                Feedback storage feedback = _feedback[agentId][clientList[i]][j];
                if (!includeRevoked && feedback.isRevoked) continue;
                if (filterTag1 && keccak256(bytes(feedback.tag1)) != keccak256(bytes(tag1))) continue;
                if (filterTag2 && keccak256(bytes(feedback.tag2)) != keccak256(bytes(tag2))) continue;
                totalCount += 1;
            }
        }
    }

    function _populateFeedbackArrays(
        uint256 agentId,
        address[] memory clientList,
        string calldata tag1,
        string calldata tag2,
        bool includeRevoked,
        address[] memory clients,
        uint64[] memory feedbackIndexes,
        uint8[] memory scores,
        string[] memory tag1s,
        string[] memory tag2s,
        bool[] memory revokedStatuses
    ) internal view {
        uint256 idx = 0;
        bool filterTag1 = bytes(tag1).length > 0;
        bool filterTag2 = bytes(tag2).length > 0;

        for (uint256 i = 0; i < clientList.length; i++) {
            uint64 lastIndex = _lastIndex[agentId][clientList[i]];
            for (uint64 j = 1; j <= lastIndex; j++) {
                Feedback storage feedback = _feedback[agentId][clientList[i]][j];
                if (!includeRevoked && feedback.isRevoked) continue;
                if (filterTag1 && keccak256(bytes(feedback.tag1)) != keccak256(bytes(tag1))) continue;
                if (filterTag2 && keccak256(bytes(feedback.tag2)) != keccak256(bytes(tag2))) continue;

                clients[idx] = clientList[i];
                feedbackIndexes[idx] = j;
                scores[idx] = feedback.score;
                tag1s[idx] = feedback.tag1;
                tag2s[idx] = feedback.tag2;
                revokedStatuses[idx] = feedback.isRevoked;
                idx += 1;
            }
        }
    }
}
