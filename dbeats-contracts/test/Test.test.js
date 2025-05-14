// // test/DBeatsContracts.test.js
// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("DBeats Contracts", function () {
//   let feeManager, platform, factory, nft;
//   let deployer, artist, otherAccount;

//   beforeEach(async function () {
//     [deployer, artist, otherAccount] = await ethers.getSigners();

//     // Deploy FeeManager
//     const FeeManager = await ethers.getContractFactory("FeeManager");
//     feeManager = await FeeManager.deploy(5);
//     // await feeManager.waitForDeployment();

//     // // Deploy DBeatsFactory
//     const DBeatsFactory = await ethers.getContractFactory("DBeatsFactory");
//     factory = await DBeatsFactory.deploy(deployer.address, feeManager.address);
//     // // await factory.waitForDeployment();
//   });

//   describe("FeeManager", function () {
//     it("should update platform fee", async function () {
//       console.log("FeeManager deployed to:", feeManager.address);
//       // Test updating the platform fee to 10%
//       await feeManager.updatePlatformFee(10);
//       const feePercentage = await feeManager.getPlatformFeePercentage();
//       expect(feePercentage).to.equal(10);
//     });
//   });

//   describe("DBeatsFactory", function () {
//     beforeEach(async function () {
//       // Set up the factory by adding an admin and an artist
//       const connectedContract = factory.connect(deployer);
//       await connectedContract.addAdmin(deployer.address);
//       await connectedContract.addArtist(artist.address);
//     });

//     it("should create a new NFT", async function () {
//       // Test creating a new NFT with specified parameters
//       const newTokenURI = "https://example.com/token";
//       const name = "DBeatsToken";
//       const symbol = "DBT";
//       const mintPrice = 1000000;
//       const genre = "Music";

//       await factory.connect(artist).createNFT(artist.address, newTokenURI, name, symbol, mintPrice, genre);
//       const nfts = await factory.getNFTsByCreator(artist.address);
//       expect(nfts.length).to.equal(1);
//     });

//     it("should get the correct token count", async function () {
//       // Test creating an NFT and checking the token count
//       const newTokenURI = "https://example.com/token";
//       const name = "DBeatsToken";
//       const symbol = "DBT";
//       const mintPrice = 10000000;
//       const genre = "Music";

//       await factory.connect(artist).createNFT(artist.address, newTokenURI, name, symbol, mintPrice, genre);
//       const tokenCount = await factory.getTokenCount();
//       expect(tokenCount).to.equal(1);
//     });

//     it("should get the correct platform fee percentage", async function () {
//       // Test getting the initial platform fee percentage
//       const platformFee = await factory.getPlatformFeePercentage();
//       expect(platformFee).to.equal(5); // Assuming the initial fee is 5%
//     });

//     it("should update the platform fee percentage", async function () {
//       // Test updating the platform fee and checking if the factory reflects the change
//       await feeManager.updatePlatformFee(10);
//       const updatedPlatformFee = await factory.getPlatformFeePercentage();
//       expect(updatedPlatformFee).to.equal(10);
//     });
//   });
// });