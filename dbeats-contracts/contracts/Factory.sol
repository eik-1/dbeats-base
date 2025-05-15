// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import './DBeatsNFT.sol';
import './FeeManager.sol';

/// @title DBeatsFactory
/// @author Tebbo & Eik
/// @notice Factory contract for deploying DBeatsNFT contracts and managing artist/admin roles
/// @dev Inherits from Ownable and AccessControl for role management
contract DBeatsFactory is Ownable, AccessControl {
    using Counters for Counters.Counter;

    /// @notice Counter for tracking the number of NFTs created
    Counters.Counter private _tokenCounter;

    /// @notice Address of the platform wallet to receive platform fees
    address public platformWalletAddress;

    /// @notice FeeManager contract for platform fee logic
    FeeManager immutable private feeManager;

    /// @notice Mapping from creator address to their deployed NFT contracts
    mapping(address => address[]) public nftsByCreator;

    /// @notice Role identifier for admins
    bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');
    /// @notice Role identifier for artists
    bytes32 public constant ARTIST_ROLE = keccak256('ARTIST_ROLE');

    /// @notice Emitted when a new NFT contract is deployed
    /// @param nftAddress The address of the new NFT contract
    /// @param _artistAddress The address of the artist
    /// @param _newTokenURI The base URI for the NFT
    /// @param name The name of the NFT collection
    /// @param symbol The symbol of the NFT collection
    /// @param mintPrice The mint price for each NFT
    /// @param _genre The genre of the NFT collection
    /// @param maxMintLimit The maximum mint limit for the NFT collection
    event NewNFT(
        address indexed nftAddress,
        address _artistAddress,
        string _newTokenURI,
        string name,
        string symbol,
        uint256 mintPrice,
        string _genre,
        uint256 maxMintLimit
    );

    /// @notice Thrown when caller is not an admin
    error Factory__CallerNotAdmin();
    /// @notice Thrown when caller is not an artist
    error Factory__CallerNotArtist();
    /// @notice Thrown when trying to add an artist that already exists
    error Factory__ArtistAlreadyAdded();

    /// @notice Deploys the factory contract and sets the platform wallet and fee manager
    /// @param _platformWalletAddress The address to receive platform fees
    /// @param _feeManagerAddress The address of the FeeManager contract
    constructor(
        address _platformWalletAddress,
        address _feeManagerAddress
    ) AccessControl() Ownable() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender); 
        platformWalletAddress = _platformWalletAddress;
        feeManager = FeeManager(_feeManagerAddress);
    }

    /// @notice Adds a user to a specific role (only owner)
    /// @param role The role to grant
    /// @param account The address to grant the role to
    function addUserToRole(bytes32 role, address account) public onlyOwner {
        grantRole(role, account);
    }

    /// @notice Adds an admin (only callable by admin)
    /// @param account The address to grant the admin role to
    function addAdmin(address account) public {
        if(!hasRole(ADMIN_ROLE, msg.sender)) {
            revert Factory__CallerNotAdmin();
        }
        grantRole(ADMIN_ROLE, account);
    }

    /// @notice Adds an artist (only callable by admin)
    /// @param account The address to grant the artist role to
    /// @dev Reverts if the artist is already added
    function addArtist(address account) public {
        if(!hasRole(ADMIN_ROLE, msg.sender)) {
            revert Factory__CallerNotAdmin();
        }
        if(hasRole(ARTIST_ROLE, account)) {
            revert Factory__ArtistAlreadyAdded();
        }
        grantRole(ARTIST_ROLE, account);
    }

    /// @notice Deploys a new DBeatsNFT contract for an artist
    /// @param _artistAddress The address of the artist
    /// @param _newTokenURI The base URI for the NFT
    /// @param name The name of the NFT collection
    /// @param symbol The symbol of the NFT collection
    /// @param mintPrice The mint price for each NFT
    /// @param _genre The genre of the NFT collection
    /// @param maxMintLimit The maximum mint limit (0 for unlimited)
    /// @dev Only callable by an artist
    function createNFT(
        address _artistAddress,
        string calldata _newTokenURI,
        string calldata name,
        string calldata symbol,
        uint256 mintPrice,
        string calldata _genre,
        uint256 maxMintLimit
    ) public {
        if(!hasRole(ARTIST_ROLE, msg.sender)) {
            revert Factory__CallerNotArtist();
        }

        _tokenCounter.increment();

        NFTMetadata memory metadata = NFTMetadata({
            uri: _newTokenURI,
            name: name,
            symbol: symbol,
            genre: _genre,
            mintPrice: mintPrice,
            mintLimit: maxMintLimit
        });

        DBeatsNFT newNFT = new DBeatsNFT(
            _artistAddress,
            platformWalletAddress,
            address(feeManager),
            metadata
        );

        emit NewNFT(
            address(newNFT),
            _artistAddress,
            _newTokenURI,
            name,
            symbol,
            mintPrice,
            _genre,
            maxMintLimit
        );

        nftsByCreator[_artistAddress].push(address(newNFT));
    }

    /// @notice Returns all NFT contracts created by a specific artist
    /// @param creator The address of the artist
    /// @return Array of NFT contract addresses
    function getNFTsByCreator(
        address creator
    ) public view returns (address[] memory) {
        return nftsByCreator[creator];
    }

    /// @notice Returns the current number of NFTs created
    /// @return The current token count
    function getTokenCount() public view returns (uint256) {
        return _tokenCounter.current();
    }

    /// @notice Returns the current platform fee percentage
    /// @return The platform fee percentage
    function getPlatformFeePercentage() public view returns (uint256) {
        return feeManager.getPlatformFeePercentage();
    }
}