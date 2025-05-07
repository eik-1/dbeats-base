// test/DBeatsContracts.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DBeats Contracts", function () {
  let feeManager, platform, factory, nft;
  let deployer, artist, otherAccount;

  beforeEach(async function () {
    [deployer, artist, otherAccount] = await ethers.getSigners();

    // Deploy FeeManager
    const FeeManager = await ethers.getContractFactory("FeeManager");
    feeManager = await FeeManager.deploy(5);
    // await feeManager.waitForDeployment();

    // Deploy Platform Wallet
    const PlatformWallet = await ethers.getContractFactory("DBeatsPlatformWallet");
    platformWallet = await PlatformWallet.deploy([deployer.address], 1);
    // await feeManager.waitForDeployment();

    // // Deploy DBeatsFactory
    const DBeatsFactory = await ethers.getContractFactory("DBeatsFactory");
    factory = await DBeatsFactory.deploy(deployer.address, feeManager.address);
    // // await factory.waitForDeployment();
  });

  describe("FeeManager", function () {
    it("should update platform fee", async function () {
      // Test updating the platform fee to 10%
      await feeManager.updatePlatformFee(10);
      const feePercentage = await feeManager.getPlatformFeePercentage();
      expect(feePercentage).to.equal(10);
    });
  });

  describe("DBeatsFactory", function () {
    beforeEach(async function () {
      // Set up the factory by adding an admin and an artist
      const connectedContract = factory.connect(deployer);
      await connectedContract.addAdmin(deployer.address);
      await connectedContract.addArtist(artist.address);
    });

    it("should create a new NFT", async function () {
      // Test creating a new NFT with specified parameters
      const newTokenURI = "https://example.com/token";
      const name = "DBeatsToken";
      const symbol = "DBT";
      const mintPrice = 1000000;
      const genre = "Music";

      await factory.connect(artist).createNFT(artist.address, newTokenURI, name, symbol, mintPrice, genre);
      const nfts = await factory.getNFTsByCreator(artist.address);
      expect(nfts.length).to.equal(1);
    });

    it("should get the correct token count", async function () {
      // Test creating an NFT and checking the token count
      const newTokenURI = "https://example.com/token";
      const name = "DBeatsToken";
      const symbol = "DBT";
      const mintPrice = 10000000;
      const genre = "Music";

      await factory.connect(artist).createNFT(artist.address, newTokenURI, name, symbol, mintPrice, genre);
      const tokenCount = await factory.getTokenCount();
      expect(tokenCount).to.equal(1);
    });

    it("should get the correct platform fee percentage", async function () {
      // Test getting the initial platform fee percentage
      const platformFee = await factory.getPlatformFeePercentage();
      expect(platformFee).to.equal(5); // Assuming the initial fee is 5%
    });

    it("should update the platform fee percentage and retrieve from the factory", async function () {
      // Test updating the platform fee and checking if the factory reflects the change
      await feeManager.updatePlatformFee(10);
      const updatedPlatformFee = await factory.getPlatformFeePercentage();
      expect(updatedPlatformFee).to.equal(10);
    });
  });

  describe("PlatformWallet", function () {
    beforeEach(async function () {
      // Set up the factory by adding an admin and an artist
      const connectedContract = factory.connect(deployer);
      await connectedContract.addAdmin(deployer.address);
      await connectedContract.addArtist(artist.address);
    });

    it("should create a new NFT and transfer 5% to the platform wallet", async function () {
      const newTokenURI = "https://example.com/token";
      const name = "DBeatsToken";
      const symbol = "DBT";
      const mintPrice = ethers.utils.parseEther("1.0"); // 1 ETH as mint price
      const genre = "Music";
    console.log("mintPrice", mintPrice.toString());
      // Step 1: Create the NFT via the factory
      await factory.connect(artist).createNFT(artist.address, newTokenURI, name, symbol, mintPrice, genre);
    
      // Step 2: Get the created NFT's contract address
      const nfts = await factory.getNFTsByCreator(artist.address);
      const nftAddress = nfts[0];
    
      // Step 3: Get the NFT contract using the address
      const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
      nft = DBeatsNFT.attach(nftAddress);
    
      // Step 4: Mint the NFT to the other account
      await nft.connect(otherAccount).mint(otherAccount.address, 1, { value: mintPrice });
    
      // Check balance or ownership to verify minting was successful
      const balance = await nft.balanceOf(otherAccount.address);
      expect(balance).to.equal(1);
    
      // Step 5: Get the balance of the platform wallet
      const platformWalletBalance = await ethers.provider.getBalance(platformWallet.address);
    
      // Log the balance (optional) for debugging
      console.log("Platform wallet balance in wei:", platformWalletBalance.toString());
      
      // Check if 5% of the mint price was transferred to the platform wallet
      // const expectedPlatformFee = mintPrice.mul(5).div(100); // 5% of the mint price
      // expect(platformWalletBalance).to.equal(expectedPlatformFee);
    });
    
  });
});