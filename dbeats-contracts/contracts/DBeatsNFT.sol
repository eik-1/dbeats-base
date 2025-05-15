// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './Platform.sol';
import './FeeManager.sol';

/// @title DBeatsNFT - ERC721 NFT contract for DBeats platform
/// @author Tebbo & Eik
/// @notice This contract allows minting and management of music NFTs for artists on the DBeats platform.
/// @dev Inherits from OpenZeppelin ERC721, ERC721URIStorage, Ownable, and ReentrancyGuard.

/// @notice Thrown when the caller is not the platform admin wallet.
error DBeatsNFT__OnlyPlatformAdminWallet();
/// @notice Thrown when the caller is not the artist.
error DBeatsNFT__OnlyArtist();
/// @notice Thrown when mint quantity is less than or equal to zero.
error DBeatsNFT__QuantityLessThanZero();
/// @notice Thrown when insufficient ETH is sent for minting.
error DBeatsNFT__InsufficientEth();
/// @notice Thrown when mint quantity exceeds the maximum mint limit.
error DBeatsNFT__QuantityGreaterThanLimit();

/// @notice Struct to hold NFT metadata for deployment.
struct NFTMetadata {
    string uri;
    string name;
    string symbol;
    string genre;
    uint256 mintPrice;
    uint256 mintLimit;
}

/// @notice Main NFT contract for DBeats platform.
contract DBeatsNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    /// @notice Price to mint one NFT.
    uint256 public immutable _mintPrice;
    /// @notice Base URI for all tokens.
    string public _uri;
    /// @notice Address of the artist.
    address public immutable _artistAddress;
    /// @notice Address of the platform admin wallet.
    address public immutable _platformWalletAddress;
    /// @notice Genre of the NFT collection.
    string public _genre;
    /// @notice FeeManager contract instance.
    FeeManager immutable private _feeManager;

    /// @notice Maximum number of NFTs that can be minted.
    uint256 public MAX_MINT_LIMIT;

    /// @notice Emitted when a new NFT is minted.
    /// @param to Address receiving the NFT.
    /// @param tokenId ID of the minted NFT.
    /// @param uri URI of the minted NFT.
    event Minted(address indexed to, uint256 indexed tokenId, string uri);

    /// @notice Restricts function to only the platform admin wallet.
    modifier onlyAdmin() {
        if (msg.sender != _platformWalletAddress)
            revert DBeatsNFT__OnlyPlatformAdminWallet();
        _;
    }

    /// @notice Restricts function to only the artist.
    modifier onlyArtist() {
        if (msg.sender != _artistAddress) revert DBeatsNFT__OnlyArtist();
        _;
    }

    /// @notice Initializes the NFT contract with metadata and addresses.
    /// @param artistAddress Address of the artist.
    /// @param platformWalletAddress Address of the platform admin wallet.
    /// @param feeManagerAddress Address of the FeeManager contract.
    /// @param metadata NFTMetadata struct containing collection details.
    constructor(
        address artistAddress,
        address platformWalletAddress,
        address feeManagerAddress,
        NFTMetadata memory metadata
    ) ERC721(metadata.name, metadata.symbol) {
        _uri = metadata.uri;
        _artistAddress = artistAddress;
        _mintPrice = metadata.mintPrice;
        _platformWalletAddress = platformWalletAddress;
        _genre = metadata.genre;
        _feeManager = FeeManager(feeManagerAddress);
        MAX_MINT_LIMIT = metadata.mintLimit;
    }

    /// @notice Mint new NFTs to a specified address.
    /// @dev Mints `quantity` NFTs and emits a Minted event for each.
    /// @param to Address to receive the NFTs.
    /// @param quantity Number of NFTs to mint.
    function mint(address to, uint256 quantity) public payable {
        // Check constraints
        if (MAX_MINT_LIMIT != 0 && _tokenIdCounter.current() + quantity > MAX_MINT_LIMIT) {
            revert DBeatsNFT__QuantityGreaterThanLimit();
        }
        if (quantity <= 0) revert DBeatsNFT__QuantityLessThanZero();
        if (msg.value < quantity * _mintPrice)
            revert DBeatsNFT__InsufficientEth();

        // Process platform fee
        _processPlatformFee();
        
        // Mint tokens
        _mintTokens(to, quantity);
    }

    /// @notice Internal function to process the platform fee.
    function _processPlatformFee() private {
        uint256 platformFeePercentage = _feeManager.getPlatformFeePercentage();
        uint256 fee = (msg.value * platformFeePercentage) / 100;
        
        if (fee > 0) {
            payable(_platformWalletAddress).transfer(fee);
        }
    }
    
    /// @notice Internal function to mint multiple NFTs.
    /// @param to Address to receive the NFTs.
    /// @param quantity Number of NFTs to mint.
    function _mintTokens(address to, uint256 quantity) private {
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(to, tokenId);
            emit Minted(to, tokenId, tokenURI(tokenId));
        }
    }

    /// @notice Withdraws the contract balance to the artist.
    function withdraw() public onlyArtist nonReentrant {
        payable(msg.sender).transfer(address(this).balance);
    }

    /// @notice Returns the URI for a given token ID.
    /// @param tokenId ID of the token.
    /// @return URI string.
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return _uri;
    }

    /// @notice Returns the base URI for the collection.
    /// @return Base URI string.
    function _baseURI() internal view override returns (string memory) {
        return _uri;
    }

    /// @notice Burns a token.
    /// @param tokenId ID of the token to burn.
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @notice Checks if the contract supports a given interface.
    /// @param interfaceId Interface identifier.
    /// @return True if supported, false otherwise.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}