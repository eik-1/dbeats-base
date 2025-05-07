// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error FeeManager__OnlyOwner();

contract FeeManager {
    uint256 private platformFeePercentage;
    address immutable private owner;

    modifier onlyOwner() {
        if(msg.sender != owner) revert FeeManager__OnlyOwner();
        _;
    }

    constructor(uint256 _initialFeePercentage) {
        platformFeePercentage = _initialFeePercentage;
        owner = msg.sender;
    }

    function updatePlatformFee(
        uint256 _newPlatformFeePercent
    ) public onlyOwner {
        platformFeePercentage = _newPlatformFeePercent;
    }

    function getPlatformFeePercentage() public view returns (uint256) {
        return platformFeePercentage;
    }
}
