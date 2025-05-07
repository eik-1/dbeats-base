// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import './Platform.sol';
import './FeeManager.sol';

error DBeatsNFT__OnlyPlatformAdminWallet();
error DBeatsNFT__OnlyArtist();
error DBeatsNFT__QuantityLessThanZero();
error DBeatsNFT__InsufficientEth();

contract DBeatsNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public immutable _mintPrice;
    uint256 private _platformFeePercentage;
    string public _uri;
    address public immutable _artistAddress;
    address public immutable _platformWalletAddress;
    string public _genre;
    FeeManager immutable private feeManager;

    event Minted(address indexed to, uint256 indexed tokenId, string uri);

    modifier onlyAdmin() {
        if (msg.sender != _platformWalletAddress)
            revert DBeatsNFT__OnlyPlatformAdminWallet();
        _;
    }

    modifier onlyArtist() {
        if (msg.sender != _artistAddress) revert DBeatsNFT__OnlyArtist();
        _;
    }

    constructor(
        address artistAddress,
        string memory _newTokenURI,
        string memory _name,
        string memory _symbol,
        uint256 mintPrice,
        string memory genre,
        address feeManagerAddress,
        address platformWalletAddress
    ) ERC721(_name, _symbol) {
        _uri = _newTokenURI;
        _artistAddress = artistAddress;
        _mintPrice = mintPrice;
        _platformWalletAddress = platformWalletAddress;
        _genre = genre;
        feeManager = FeeManager(feeManagerAddress);
    }

    function mint(address to, uint256 quantity) public payable {
        uint256 mintPrice = _mintPrice;
        uint256 platformFeePercentage = feeManager.getPlatformFeePercentage();

        if (quantity <= 0) revert DBeatsNFT__QuantityLessThanZero();
        if (msg.value < quantity * mintPrice)
            revert DBeatsNFT__InsufficientEth();

        uint256 fee = (msg.value * platformFeePercentage) / 100;
        if (fee > 0) {
             payable(_platformWalletAddress).transfer(fee);
        }

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(to, tokenId);
            emit Minted(to, tokenId, tokenURI(tokenId));
        }
    }

    function withdraw() public onlyArtist {
        payable(msg.sender).transfer(address(this).balance);
    }

    //Overrides for Solidity
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return _uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return _uri;
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
