// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error Platform__CallerNotOwner();

contract Platform {
    address public platformWalletAddress;
    address immutable private owner;

    modifier onlyOwner() {
        if(msg.sender != owner) revert Platform__CallerNotOwner();
        _;
    }

    constructor(address _platformWalletAddress) {
        platformWalletAddress = _platformWalletAddress;
        owner = msg.sender;
    }

    function updatePlatformWalletAddress(
        address _newPlatformWalletAddress
    ) public onlyOwner {
        platformWalletAddress = _newPlatformWalletAddress;
    }
}
