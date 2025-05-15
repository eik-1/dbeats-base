// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DBeatsPlatformWallet
 * @author Tebbo & Eik
 * @dev Multi-signature wallet for the DBeats platform. Allows multiple owners to collectively manage and withdraw funds.
 * Owners must confirm withdrawals, and a minimum number of confirmations is required to execute a withdrawal.
 */
contract DBeatsPlatformWallet is ReentrancyGuard {

    /// @notice List of wallet owners
    address[] public owners;
    /// @notice Mapping to check if an address is an owner
    mapping(address => bool) public isOwner;
    /// @notice Tracks the last confirmation round for each owner
    mapping(address => uint256) public lastConfirmedRound;
    /// @notice Number of confirmations in the current round
    uint256 public confirmations;
    /// @notice Number of confirmations required to execute a withdrawal
    uint256 public requiredConfirmations;
    /// @notice Current confirmation round
    uint256 public currentRound;

    /**
     * @dev Throws if called by any account other than an owner.
     */
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    /**
     * @notice Initializes the contract with a list of owners and required confirmations.
     * @param _owners Array of owner addresses.
     * @param _requiredConfirmations Number of confirmations required for withdrawal.
     */
    constructor(address[] memory _owners, uint256 _requiredConfirmations) {
        require(_owners.length > 0, "Owners required");
        require(_requiredConfirmations > 0, "Required confirmations must be positive");
        require(_requiredConfirmations <= _owners.length, "Invalid required confirmations");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredConfirmations = _requiredConfirmations;
        currentRound = 1;
    }

    /**
     * @notice Confirms a withdrawal for the current round. If enough confirmations are collected, triggers withdrawal.
     * @dev Only callable by owners. Each owner can confirm once per round.
     */
    function confirm() external onlyOwner {
        require(lastConfirmedRound[msg.sender] < currentRound, "You have already confirmed");
        lastConfirmedRound[msg.sender] = currentRound;  // Mark as confirmed in the current round
        confirmations++;

        if (confirmations >= requiredConfirmations) {
            withdraw();
        }
    }

    /**
     * @dev Resets the confirmation count and advances the confirmation round.
     */
    function resetConfirmations() internal {
        confirmations = 0;
        currentRound++;  // Increment the round, invalidating previous confirmations
    }

    /**
     * @notice Withdraws the contract's balance, splitting it equally among all owners.
     * @dev Only executes if enough confirmations are collected. Resets confirmations after withdrawal.
     */
    function withdraw() internal nonReentrant {
        uint256 balance = address(this).balance;
        uint256 numOwners = owners.length;
        uint256 reqConfirmations = requiredConfirmations;

        require(balance > 0, "No balance to withdraw");
        require(confirmations >= reqConfirmations, "Not enough confirmations");

        uint256 share = balance / numOwners;
        for (uint256 i = 0; i < numOwners; i++) {
            payable(owners[i]).transfer(share);
        }

        resetConfirmations();  // Reset confirmations after withdrawal
    }

    /**
     * @notice Allows the contract to receive Ether.
     */
    receive() external payable {}
}
