// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DBeatsPlatformWallet is ReentrancyGuard {

    address[] public owners;
    mapping(address => bool) public isOwner;
    mapping(address => uint256) public lastConfirmedRound;
    uint256 public confirmations;
    uint256 public requiredConfirmations;
    uint256 public currentRound;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

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

    // Function to confirm transactions
    function confirm() external onlyOwner {
        require(lastConfirmedRound[msg.sender] < currentRound, "You have already confirmed");
        lastConfirmedRound[msg.sender] = currentRound;  // Mark as confirmed in the current round
        confirmations++;

        if (confirmations >= requiredConfirmations) {
            withdraw();
        }
    }

    // Function to reset confirmations efficiently
    function resetConfirmations() internal {
        confirmations = 0;
        currentRound++;  // Increment the round, invalidating previous confirmations
    }

    // Withdraw function that sends funds to owners' wallets
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

    // Function to receive ether
    receive() external payable {}
}
