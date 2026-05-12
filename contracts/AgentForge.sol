// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IIdentityRegistry.sol";
import "./interfaces/IReputationRegistry.sol";
import "./interfaces/IAgenticCommerce.sol";

/**
 * @title AgentForge
 * @notice AI Agent Marketplace — register agents, post jobs with USDC escrow,
 *         bid, execute, settle, and track reputation on Arc Network.
 * @dev On Arc testnet, native gas is USDC (18 decimals). msg.value is USDC.
 */
contract AgentForge {
    // ─── Types ───────────────────────────────────────────────────────────────

    enum AgentStatus { Inactive, Active, Suspended }
    enum JobStatus { Open, Assigned, InProgress, Delivered, Completed, Disputed, Cancelled, Expired }

    struct Agent {
        uint256 id;
        address owner;
        string metadataURI;      // IPFS/HTTP URI → {name, description, capabilities, avatar}
        string capabilities;     // comma-separated capabilities string
        uint256 pricePerTask;    // in USDC (18 decimals)
        uint256 pricePerInference; // nanopayment rate per inference call
        AgentStatus status;
        uint256 totalJobs;
        uint256 successfulJobs;
        uint256 totalEarnings;
        uint256 reputationScore; // 0-500 (scaled x100, so 500 = 5.00)
        uint256 registeredAt;
    }

    struct Job {
        uint256 id;
        address client;
        address assignedAgent;
        string title;
        string description;
        string requiredCapabilities; // comma-separated
        uint256 budget;          // USDC escrowed
        uint256 deadline;
        JobStatus status;
        string deliverableURI;
        uint256 createdAt;
        uint256 completedAt;
        uint256 bidCount;
    }

    struct Bid {
        uint256 jobId;
        address agent;
        uint256 price;
        string proposal;
        uint256 estimatedTime;   // seconds
        uint256 createdAt;
    }

    struct InferencePool {
        address depositor;
        uint256 balance;
        uint256 totalSpent;
        uint256 callCount;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    address public owner;
    uint256 public platformFeePercent = 250; // 2.5% (basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;

    uint256 public nextAgentId = 1;
    uint256 public nextJobId = 1;

    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public agentByOwner;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Bid[]) public jobBids;
    mapping(address => InferencePool) public inferencePools;
    mapping(address => uint256) public pendingWithdrawals;

    uint256 public totalAgents;
    uint256 public totalJobs;
    uint256 public totalVolume;

    // ─── Events ──────────────────────────────────────────────────────────────

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string metadataURI);
    event AgentUpdated(uint256 indexed agentId, string metadataURI);
    event AgentDeactivated(uint256 indexed agentId);

    event JobCreated(uint256 indexed jobId, address indexed client, uint256 budget, string title);
    event JobBidPlaced(uint256 indexed jobId, address indexed agent, uint256 price);
    event JobAssigned(uint256 indexed jobId, address indexed agent);
    event JobDelivered(uint256 indexed jobId, string deliverableURI);
    event JobCompleted(uint256 indexed jobId, uint256 payout, uint256 fee);
    event JobDisputed(uint256 indexed jobId, address indexed disputedBy);
    event JobCancelled(uint256 indexed jobId);

    event InferenceDeposit(address indexed depositor, uint256 amount);
    event InferencePayment(address indexed depositor, address indexed agent, uint256 amount);
    event InferenceWithdraw(address indexed depositor, uint256 amount);

    event PlatformFeeUpdated(uint256 newFee);
    event FundsWithdrawn(address indexed to, uint256 amount);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyActiveAgent(uint256 agentId) {
        require(agents[agentId].status == AgentStatus.Active, "Agent not active");
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }

    modifier jobExists(uint256 jobId) {
        require(jobId > 0 && jobId < nextJobId, "Job does not exist");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Agent Registry ──────────────────────────────────────────────────────

    function registerAgent(
        string calldata metadataURI,
        string calldata capabilities,
        uint256 pricePerTask,
        uint256 pricePerInference
    ) external returns (uint256 agentId) {
        require(agentByOwner[msg.sender] == 0, "Already registered");
        require(bytes(metadataURI).length > 0, "Empty metadata URI");

        agentId = nextAgentId++;
        agents[agentId] = Agent({
            id: agentId,
            owner: msg.sender,
            metadataURI: metadataURI,
            capabilities: capabilities,
            pricePerTask: pricePerTask,
            pricePerInference: pricePerInference,
            status: AgentStatus.Active,
            totalJobs: 0,
            successfulJobs: 0,
            totalEarnings: 0,
            reputationScore: 0,
            registeredAt: block.timestamp
        });

        agentByOwner[msg.sender] = agentId;
        totalAgents++;

        emit AgentRegistered(agentId, msg.sender, metadataURI);
    }

    function updateAgent(
        uint256 agentId,
        string calldata metadataURI,
        string calldata capabilities,
        uint256 pricePerTask,
        uint256 pricePerInference
    ) external onlyActiveAgent(agentId) {
        Agent storage agent = agents[agentId];
        agent.metadataURI = metadataURI;
        agent.capabilities = capabilities;
        agent.pricePerTask = pricePerTask;
        agent.pricePerInference = pricePerInference;

        emit AgentUpdated(agentId, metadataURI);
    }

    function deactivateAgent(uint256 agentId) external onlyActiveAgent(agentId) {
        agents[agentId].status = AgentStatus.Inactive;
        emit AgentDeactivated(agentId);
    }

    function getAgent(uint256 agentId) external view returns (Agent memory) {
        return agents[agentId];
    }

    function getAgentByOwner(address agentOwner) external view returns (Agent memory) {
        uint256 agentId = agentByOwner[agentOwner];
        require(agentId != 0, "Agent not found");
        return agents[agentId];
    }

    // ─── Job Marketplace ─────────────────────────────────────────────────────

    function createJob(
        string calldata title,
        string calldata description,
        string calldata requiredCapabilities,
        uint256 deadline
    ) external payable returns (uint256 jobId) {
        require(msg.value > 0, "Must escrow USDC");
        require(deadline > block.timestamp, "Deadline must be future");
        require(bytes(title).length > 0, "Empty title");

        jobId = nextJobId++;
        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            assignedAgent: address(0),
            title: title,
            description: description,
            requiredCapabilities: requiredCapabilities,
            budget: msg.value,
            deadline: deadline,
            status: JobStatus.Open,
            deliverableURI: "",
            createdAt: block.timestamp,
            completedAt: 0,
            bidCount: 0
        });

        totalJobs++;
        totalVolume += msg.value;

        emit JobCreated(jobId, msg.sender, msg.value, title);
    }

    function bidOnJob(
        uint256 jobId,
        uint256 price,
        string calldata proposal,
        uint256 estimatedTime
    ) external jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Open, "Job not open");
        require(price <= job.budget, "Bid exceeds budget");

        uint256 agentId = agentByOwner[msg.sender];
        require(agentId != 0, "Not a registered agent");
        require(agents[agentId].status == AgentStatus.Active, "Agent not active");

        jobBids[jobId].push(Bid({
            jobId: jobId,
            agent: msg.sender,
            price: price,
            proposal: proposal,
            estimatedTime: estimatedTime,
            createdAt: block.timestamp
        }));

        job.bidCount++;
        emit JobBidPlaced(jobId, msg.sender, price);
    }

    function assignJob(uint256 jobId, address agent) external jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client, "Not job client");
        require(job.status == JobStatus.Open, "Job not open");

        uint256 agentId = agentByOwner[agent];
        require(agentId != 0, "Not a registered agent");

        job.assignedAgent = agent;
        job.status = JobStatus.Assigned;

        emit JobAssigned(jobId, agent);
    }

    function startJob(uint256 jobId) external jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(msg.sender == job.assignedAgent, "Not assigned agent");
        require(job.status == JobStatus.Assigned, "Job not assigned");

        job.status = JobStatus.InProgress;
    }

    function submitDeliverable(uint256 jobId, string calldata deliverableURI) external jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(msg.sender == job.assignedAgent, "Not assigned agent");
        require(
            job.status == JobStatus.Assigned || job.status == JobStatus.InProgress,
            "Cannot submit now"
        );

        job.deliverableURI = deliverableURI;
        job.status = JobStatus.Delivered;

        emit JobDelivered(jobId, deliverableURI);
    }

    function approveJob(uint256 jobId) external jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client, "Not job client");
        require(job.status == JobStatus.Delivered, "Not delivered");

        uint256 fee = (job.budget * platformFeePercent) / FEE_DENOMINATOR;
        uint256 payout = job.budget - fee;

        job.status = JobStatus.Completed;
        job.completedAt = block.timestamp;

        // Update agent stats
        uint256 agentId = agentByOwner[job.assignedAgent];
        Agent storage agent = agents[agentId];
        agent.totalJobs++;
        agent.successfulJobs++;
        agent.totalEarnings += payout;
        _updateReputation(agentId, 500); // 5.00 rating for approved job

        // Transfer funds
        pendingWithdrawals[job.assignedAgent] += payout;
        pendingWithdrawals[owner] += fee;

        emit JobCompleted(jobId, payout, fee);
    }

    function disputeJob(uint256 jobId) external jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(
            msg.sender == job.client || msg.sender == job.assignedAgent,
            "Not a party"
        );
        require(
            job.status == JobStatus.Assigned ||
            job.status == JobStatus.InProgress ||
            job.status == JobStatus.Delivered,
            "Cannot dispute"
        );

        job.status = JobStatus.Disputed;
        emit JobDisputed(jobId, msg.sender);
    }

    function cancelJob(uint256 jobId) external jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client, "Not job client");
        require(job.status == JobStatus.Open, "Can only cancel open jobs");

        job.status = JobStatus.Cancelled;
        pendingWithdrawals[job.client] += job.budget;

        emit JobCancelled(jobId);
    }

    function resolveDispute(uint256 jobId, bool favorAgent) external onlyOwner jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Disputed, "Not disputed");

        if (favorAgent) {
            uint256 fee = (job.budget * platformFeePercent) / FEE_DENOMINATOR;
            uint256 payout = job.budget - fee;
            pendingWithdrawals[job.assignedAgent] += payout;
            pendingWithdrawals[owner] += fee;

            uint256 agentId = agentByOwner[job.assignedAgent];
            agents[agentId].totalJobs++;
            agents[agentId].successfulJobs++;
            agents[agentId].totalEarnings += payout;
            _updateReputation(agentId, 400);
        } else {
            pendingWithdrawals[job.client] += job.budget;

            uint256 agentId = agentByOwner[job.assignedAgent];
            if (agentId != 0) {
                agents[agentId].totalJobs++;
                _updateReputation(agentId, 100);
            }
        }

        job.status = JobStatus.Completed;
        job.completedAt = block.timestamp;
    }

    function claimExpiredJob(uint256 jobId) external jobExists(jobId) {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client, "Not job client");
        require(block.timestamp > job.deadline, "Not expired");
        require(
            job.status == JobStatus.Assigned || job.status == JobStatus.InProgress,
            "Cannot claim"
        );

        job.status = JobStatus.Expired;
        pendingWithdrawals[job.client] += job.budget;
    }

    function getJobBids(uint256 jobId) external view returns (Bid[] memory) {
        return jobBids[jobId];
    }

    // ─── Pay-per-Inference (Nanopayments) ────────────────────────────────────

    function depositInferencePool() external payable {
        require(msg.value > 0, "Must deposit USDC");

        InferencePool storage pool = inferencePools[msg.sender];
        pool.depositor = msg.sender;
        pool.balance += msg.value;

        emit InferenceDeposit(msg.sender, msg.value);
    }

    function chargeInference(address depositor, address agent, uint256 amount) external onlyOwner {
        InferencePool storage pool = inferencePools[depositor];
        require(pool.balance >= amount, "Insufficient pool balance");

        uint256 fee = (amount * platformFeePercent) / FEE_DENOMINATOR;
        uint256 agentPayout = amount - fee;

        pool.balance -= amount;
        pool.totalSpent += amount;
        pool.callCount++;

        pendingWithdrawals[agent] += agentPayout;
        pendingWithdrawals[owner] += fee;

        uint256 agentId = agentByOwner[agent];
        if (agentId != 0) {
            agents[agentId].totalEarnings += agentPayout;
        }

        emit InferencePayment(depositor, agent, amount);
    }

    function withdrawInferencePool(uint256 amount) external {
        InferencePool storage pool = inferencePools[msg.sender];
        require(pool.balance >= amount, "Insufficient balance");

        pool.balance -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit InferenceWithdraw(msg.sender, amount);
    }

    function getInferencePool(address depositor) external view returns (InferencePool memory) {
        return inferencePools[depositor];
    }

    // ─── Withdrawals ─────────────────────────────────────────────────────────

    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(msg.sender, amount);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // max 10%
        platformFeePercent = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    function _updateReputation(uint256 agentId, uint256 rating) internal {
        Agent storage agent = agents[agentId];
        uint256 totalRatings = agent.totalJobs;
        if (totalRatings == 0) {
            agent.reputationScore = rating;
        } else {
            // Weighted average
            agent.reputationScore =
                ((agent.reputationScore * (totalRatings - 1)) + rating) / totalRatings;
        }
    }

    // ─── View Helpers ────────────────────────────────────────────────────────

    function getStats() external view returns (
        uint256 _totalAgents,
        uint256 _totalJobs,
        uint256 _totalVolume
    ) {
        return (totalAgents, totalJobs, totalVolume);
    }

    receive() external payable {}
}
