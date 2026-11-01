// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainIDGuard
 * @notice Network configuration inspection tool that helps developers verify
 * whether their wallet, application, and RPC deployment target the correct blockchain.
 * Uses `block.chainid` to detect the executing network on-chain.
 * All interactions require strictly standard network gas fees only (no protocol/service fees).
 */
contract ChainIDGuard {
    /// @notice Auto-incrementing identifier for network inspection requests
    uint256 public requestNonce;

    /// @notice Struct representing an inspection check request
    struct CheckRequest {
        uint256 id;
        address requester;
        uint256 expectedChainId;
        uint256 timestamp;
        bool isResolved;
    }

    /// @notice Struct representing the verified on-chain result
    struct CheckResult {
        uint256 requestId;
        address requester;
        uint256 expectedChainId;
        uint256 actualChainId;
        bool isMatch;
        uint256 resolvedAtBlock;
        uint256 timestamp;
    }

    /// @notice Storage for all requests indexed by requestId
    mapping(uint256 => CheckRequest) public requests;

    /// @notice Storage for all results indexed by requestId
    mapping(uint256 => CheckResult) public results;

    /// @notice Index of request IDs per user address for quick history lookup
    mapping(address => uint256[]) private userRequests;

    /// @notice Emitted when a developer requests a network configuration check
    event NetworkCheckRequested(
        uint256 indexed requestId,
        address indexed requester,
        uint256 expectedChainId,
        uint256 actualChainId,
        uint256 timestamp
    );

    /// @notice Emitted when a network check result is finalized/published
    event NetworkCheckCompleted(
        uint256 indexed requestId,
        address indexed requester,
        uint256 expectedChainId,
        uint256 actualChainId,
        bool isMatch,
        uint256 timestamp
    );

    /**
     * @notice Initiates a network check recording the expected chain ID and
     * comparing it immediately with runtime block.chainid.
     * @dev Strictly gas fee only: no ETH/BOT fees or token transfers required.
     * @param expectedChainId The chain ID the developer expected to execute on.
     * @return requestId The unique ID assigned to this inspection request.
     */
    function requestNetworkCheck(uint256 expectedChainId) external returns (uint256 requestId) {
        requestNonce++;
        requestId = requestNonce;

        uint256 currentChainId = block.chainid;
        bool matched = (expectedChainId == currentChainId);

        // Store request record
        requests[requestId] = CheckRequest({
            id: requestId,
            requester: msg.sender,
            expectedChainId: expectedChainId,
            timestamp: block.timestamp,
            isResolved: true
        });

        // Store result record
        results[requestId] = CheckResult({
            requestId: requestId,
            requester: msg.sender,
            expectedChainId: expectedChainId,
            actualChainId: currentChainId,
            isMatch: matched,
            resolvedAtBlock: block.number,
            timestamp: block.timestamp
        });

        userRequests[msg.sender].push(requestId);

        emit NetworkCheckRequested(
            requestId,
            msg.sender,
            expectedChainId,
            currentChainId,
            block.timestamp
        );

        emit NetworkCheckCompleted(
            requestId,
            msg.sender,
            expectedChainId,
            currentChainId,
            matched,
            block.timestamp
        );
    }

    /**
     * @notice Allows explicit publication or re-publishing of an inspection result.
     * @dev Strictly gas fee only: no ETH/BOT fees.
     * @param requestId The ID of the existing request to publish/re-evaluate.
     */
    function publishResult(uint256 requestId) external returns (CheckResult memory) {
        require(requestId > 0 && requestId <= requestNonce, "ChainIDGuard: Invalid requestId");
        CheckRequest storage req = requests[requestId];

        uint256 currentChainId = block.chainid;
        bool matched = (req.expectedChainId == currentChainId);

        req.isResolved = true;

        CheckResult memory res = CheckResult({
            requestId: requestId,
            requester: req.requester,
            expectedChainId: req.expectedChainId,
            actualChainId: currentChainId,
            isMatch: matched,
            resolvedAtBlock: block.number,
            timestamp: block.timestamp
        });

        results[requestId] = res;

        emit NetworkCheckCompleted(
            requestId,
            req.requester,
            req.expectedChainId,
            currentChainId,
            matched,
            block.timestamp
        );

        return res;
    }

    /**
     * @notice Retrieves both the request and its verified result.
     * @param requestId The unique ID of the check.
     * @return request The stored CheckRequest struct.
     * @return result The stored CheckResult struct.
     */
    function getRequest(uint256 requestId)
        external
        view
        returns (CheckRequest memory request, CheckResult memory result)
    {
        require(requestId > 0 && requestId <= requestNonce, "ChainIDGuard: Request does not exist");
        return (requests[requestId], results[requestId]);
    }

    /**
     * @notice Helper function to get the current runtime chain ID directly.
     * @return chainId The EVM block.chainid.
     */
    function getCurrentChainId() external view returns (uint256) {
        return block.chainid;
    }

    /**
     * @notice Returns all request IDs submitted by a specific address.
     * @param user The address to query.
     */
    function getUserRequests(address user) external view returns (uint256[] memory) {
        return userRequests[user];
    }
}

