// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAgenticCommerce
 * @notice ERC-8183 Agentic Commerce interface for autonomous agent transactions
 */
interface IAgenticCommerce {
    enum TaskStatus {
        Open,
        Assigned,
        InProgress,
        Completed,
        Disputed,
        Cancelled
    }

    struct Task {
        uint256 taskId;
        address client;
        address assignedAgent;
        string description;
        uint256 budget;
        TaskStatus status;
        uint256 createdAt;
        uint256 deadline;
    }

    function createTask(string calldata description, uint256 deadline) external payable returns (uint256 taskId);
    function assignTask(uint256 taskId, address agent) external;
    function completeTask(uint256 taskId, string calldata deliverableURI) external;
    function approveTask(uint256 taskId) external;
    function disputeTask(uint256 taskId) external;

    event TaskCreated(uint256 indexed taskId, address indexed client, uint256 budget);
    event TaskAssigned(uint256 indexed taskId, address indexed agent);
    event TaskCompleted(uint256 indexed taskId, string deliverableURI);
    event TaskApproved(uint256 indexed taskId, uint256 payout);
    event TaskDisputed(uint256 indexed taskId);
}
