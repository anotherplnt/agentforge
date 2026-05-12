// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IReputationRegistry
 * @notice ERC-8004 Reputation Registry interface for on-chain reputation tracking
 */
interface IReputationRegistry {
    struct Reputation {
        uint256 totalJobs;
        uint256 successfulJobs;
        uint256 totalEarnings;
        uint256 averageRating; // scaled by 100 (e.g., 450 = 4.50)
        uint256 lastUpdated;
    }

    function updateReputation(uint256 identityId, uint256 rating, uint256 earnings) external;
    function getReputation(uint256 identityId) external view returns (Reputation memory);
    function getReputationScore(uint256 identityId) external view returns (uint256);

    event ReputationUpdated(uint256 indexed identityId, uint256 rating, uint256 totalJobs);
}
