// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IIdentityRegistry
 * @notice ERC-8004 Identity Registry interface for on-chain agent identity
 */
interface IIdentityRegistry {
    struct Identity {
        address owner;
        string metadataURI;
        uint256 registeredAt;
        bool active;
    }

    function registerIdentity(string calldata metadataURI) external returns (uint256 identityId);
    function updateMetadata(uint256 identityId, string calldata metadataURI) external;
    function deactivateIdentity(uint256 identityId) external;
    function getIdentity(uint256 identityId) external view returns (Identity memory);
    function getIdentityByOwner(address owner) external view returns (uint256);

    event IdentityRegistered(uint256 indexed identityId, address indexed owner, string metadataURI);
    event IdentityUpdated(uint256 indexed identityId, string metadataURI);
    event IdentityDeactivated(uint256 indexed identityId);
}
