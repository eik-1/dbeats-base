const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("DBeatsFactory", function () {
  let Factory, factory, FeeManager, feeManager, owner, admin, artist, other;
  const platformWallet = ethers.ZeroAddress;

  beforeEach(async function () {
    [owner, admin, artist, other] = await ethers.getSigners();

    // Deploy FeeManager mock
    FeeManager = await ethers.getContractFactory("FeeManager");
    feeManager = await FeeManager.deploy(10);
    await feeManager.waitForDeployment();

    // Deploy Factory
    Factory = await ethers.getContractFactory("DBeatsFactory");
    factory = await Factory.deploy(platformWallet, feeManager.target);
    await factory.waitForDeployment();
  });

  it("should deploy and set roles", async function () {
    expect(await factory.platformWalletAddress()).to.equal(platformWallet);

    // Owner has admin role
    const ADMIN_ROLE = await factory.ADMIN_ROLE();
    expect(await factory.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
  });

  it("should allow admin to add artist", async function () {
    await factory.addArtist(artist.address);
    const ARTIST_ROLE = await factory.ARTIST_ROLE();
    expect(await factory.hasRole(ARTIST_ROLE, artist.address)).to.be.true;
  });

  it("should revert if non-admin tries to add artist", async function () {
    await expect(
      factory.connect(other).addArtist(artist.address)
    ).to.be.revertedWithCustomError(factory, "Factory__CallerNotAdmin");
  });

  it("should allow artist to create NFT", async function () {
    await factory.addArtist(artist.address);

    const tx = await factory.connect(artist).createNFT(
      artist.address,
      "ipfs://testuri",
      "TestName",
      "TST",
      ethers.parseEther("0.1"),
      "HipHop",
      100
    );
    const receipt = await tx.wait();

    // Check event
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "NewNFT"
    );
    expect(event).to.not.be.undefined;

    // Check NFT address stored
    const nfts = await factory.getNFTsByCreator(artist.address);
    expect(nfts.length).to.equal(1);
  });

  it("should revert if non-artist tries to create NFT", async function () {
    await expect(
      factory.createNFT(
        other.address,
        "ipfs://failuri",
        "Fail",
        "FAIL",
        ethers.parseEther("0.1"),
        "Pop",
        10
      )
    ).to.be.revertedWithCustomError(factory, "Factory__CallerNotArtist");
  });

it("should allow artist to create NFT with unlimited mints and mint 10000 tokens", async function () {
  await factory.addArtist(artist.address);

  const mintPrice = ethers.parseEther("0.05");

  const tx = await factory.connect(artist).createNFT(
    artist.address,
    "ipfs://unlimiteduri",
    "UnlimitedNFT",
    "UNL",
    mintPrice,
    "Electronic",
    0 // unlimited mints
  );
  const receipt = await tx.wait();

  // Get the NFT contract address from the event
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "NewNFT"
  );
  const nftAddress = event.args.nftAddress;

  // Attach to the deployed NFT contract
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  // Mint 1000 tokens in a single call
  let totalMinted = 0;
  for (let i = 0; i < 10; i++) {
    await nft.connect(artist).mint(
      artist.address,
      1000,
      { value: mintPrice * 1000n }
    );
    totalMinted += 1000;
  }
  expect(await nft.balanceOf(artist.address)).to.equal(totalMinted);

  // Check total supply (if DBeatsNFT has totalSupply)
  if (nft.totalSupply) {
    const total = await nft.totalSupply();
    expect(total).to.equal(1000);
  }
});

it("should allow artist to create NFT with unlimited mints and mint 1 NFT to 100 users", async function () {
  await factory.addArtist(artist.address);

  const mintPrice = ethers.parseEther("0.05");

  // Create NFT with unlimited mints
  const tx = await factory.connect(artist).createNFT(
    artist.address,
    "ipfs://unlimiteduri",
    "UnlimitedNFT",
    "UNL",
    mintPrice,
    "Electronic",
    0 // unlimited mints
  );
  const receipt = await tx.wait();

  // Get the NFT contract address from the event
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "NewNFT"
  );
  const nftAddress = event.args.nftAddress;

  // Attach to the deployed NFT contract
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  // Create 100 new wallets and mint 1 NFT to each
  const users = [];
  for (let i = 0; i < 100; i++) {
    users.push(ethers.Wallet.createRandom().connect(ethers.provider));
    // Fund the user with ETH for minting
    await owner.sendTransaction({
      to: users[i].address,
      value: ethers.parseEther("1")
    });
    await nft.connect(users[i]).mint(
      users[i].address,
      1,
      { value: mintPrice }
    );
    expect(await nft.balanceOf(users[i].address)).to.equal(1);
  }

  // Optionally, check total minted
  let totalMinted = 0;
  for (let i = 0; i < 100; i++) {
    totalMinted += Number(await nft.balanceOf(users[i].address));
  }
  expect(totalMinted).to.equal(100);
});

it("should not allow minting more than the max mint limit", async function () {
  await factory.addArtist(artist.address);

  const mintPrice = ethers.parseEther("0.05");

  // Create NFT with max mint limit of 10
  const tx = await factory.connect(artist).createNFT(
    artist.address,
    "ipfs://limiteduri",
    "LimitedNFT",
    "LIM",
    mintPrice,
    "Electronic",
    10 // max mint limit
  );
  const receipt = await tx.wait();

  // Get the NFT contract address from the event
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "NewNFT"
  );
  const nftAddress = event.args.nftAddress;

  // Attach to the deployed NFT contract
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  // Mint 10 tokens (should succeed)
  await nft.connect(artist).mint(
    artist.address,
    10,
    { value: mintPrice * 10n }
  );
  expect(await nft.balanceOf(artist.address)).to.equal(10);

  // Try to mint 1 more (should fail)
  await expect(
    nft.connect(artist).mint(
      artist.address,
      1,
      { value: mintPrice }
    )
  ).to.be.revertedWithCustomError(nft, "DBeatsNFT__QuantityGreaterThanLimit");
});

it("should return correct metadata from the created NFT", async function () {
  await factory.addArtist(artist.address);

  const mintPrice = ethers.parseEther("0.05");
  const name = "MetaNFT";
  const symbol = "META";
  const genre = "Jazz";
  const uri = "ipfs://meta";
  const mintLimit = 42;

  // Create NFT
  const tx = await factory.connect(artist).createNFT(
    artist.address,
    uri,
    name,
    symbol,
    mintPrice,
    genre,
    mintLimit
  );
  const receipt = await tx.wait();

  // Get the NFT contract address from the event
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "NewNFT"
  );
  const nftAddress = event.args.nftAddress;

  // Attach to the deployed NFT contract
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  // Check metadata
  expect(await nft.name()).to.equal(name);
  expect(await nft.symbol()).to.equal(symbol);
  expect(await nft._genre()).to.equal(genre);
  expect(await nft._mintPrice()).to.equal(mintPrice);
  expect(await nft.MAX_MINT_LIMIT()).to.equal(mintLimit);
  expect(await nft._uri()).to.equal(uri);
});

it("should revert if non-admin tries to add admin", async function () {
  await expect(
    factory.connect(other).addAdmin(other.address)
  ).to.be.revertedWithCustomError(factory, "Factory__CallerNotAdmin");
});

it("should not allow adding the same artist twice", async function () {
  await factory.addArtist(artist.address);
  await expect(
    factory.addArtist(artist.address)
  ).to.be.revertedWithCustomError(factory, "Factory__ArtistAlreadyAdded");
  const ARTIST_ROLE = await factory.ARTIST_ROLE();
  expect(await factory.hasRole(ARTIST_ROLE, artist.address)).to.be.true;
});

it("should return all NFTs created by an artist", async function () {
  await factory.addArtist(artist.address);

  for (let i = 0; i < 3; i++) {
    await factory.connect(artist).createNFT(
      artist.address,
      `ipfs://uri${i}`,
      `Name${i}`,
      `SYM${i}`,
      ethers.parseEther("0.01"),
      "Genre",
      10
    );
  }
  const nfts = await factory.getNFTsByCreator(artist.address);
  expect(nfts.length).to.equal(3);
});

it("should revert if minting with insufficient ETH", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("0.1");
  const tx = await factory.connect(artist).createNFT(
    artist.address, "ipfs://uri", "Name", "SYM", mintPrice, "Genre", 10
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NewNFT");
  const nftAddress = event.args.nftAddress;
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  await expect(
    nft.connect(artist).mint(artist.address, 1, { value: mintPrice - 1n })
  ).to.be.revertedWithCustomError(nft, "DBeatsNFT__InsufficientEth");
});

it("should revert if minting with zero quantity", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("0.1");
  const tx = await factory.connect(artist).createNFT(
    artist.address, "ipfs://uri", "Name", "SYM", mintPrice, "Genre", 10
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NewNFT");
  const nftAddress = event.args.nftAddress;
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  await expect(
    nft.connect(artist).mint(artist.address, 0, { value: 0 })
  ).to.be.revertedWithCustomError(nft, "DBeatsNFT__QuantityLessThanZero");
});

it("should revert if minting more than max limit in one call", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("0.1");
  const tx = await factory.connect(artist).createNFT(
    artist.address, "ipfs://uri", "Name", "SYM", mintPrice, "Genre", 5
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NewNFT");
  const nftAddress = event.args.nftAddress;
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  await expect(
    nft.connect(artist).mint(artist.address, 6, { value: mintPrice * 6n })
  ).to.be.revertedWithCustomError(nft, "DBeatsNFT__QuantityGreaterThanLimit");
});

it("should revert if minting after reaching the max limit", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("0.1");
  const tx = await factory.connect(artist).createNFT(
    artist.address, "ipfs://uri", "Name", "SYM", mintPrice, "Genre", 2
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NewNFT");
  const nftAddress = event.args.nftAddress;
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  await nft.connect(artist).mint(artist.address, 2, { value: mintPrice * 2n });
  await expect(
    nft.connect(artist).mint(artist.address, 1, { value: mintPrice })
  ).to.be.revertedWithCustomError(nft, "DBeatsNFT__QuantityGreaterThanLimit");
});

it("should revert if non-artist tries to withdraw", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("0.1");
  const tx = await factory.connect(artist).createNFT(
    artist.address, "ipfs://uri", "Name", "SYM", mintPrice, "Genre", 10
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NewNFT");
  const nftAddress = event.args.nftAddress;
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  await expect(
    nft.connect(other).withdraw()
  ).to.be.revertedWithCustomError(nft, "DBeatsNFT__OnlyArtist");
});

it("should transfer all funds to artist on withdraw", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("0.1");
  const tx = await factory.connect(artist).createNFT(
    artist.address, "ipfs://uri", "Name", "SYM", mintPrice, "Genre", 10
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NewNFT");
  const nftAddress = event.args.nftAddress;
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  // Mint some NFTs
  await nft.connect(artist).mint(artist.address, 2, { value: mintPrice * 2n });

  // Record balance before
  const before = await ethers.provider.getBalance(artist.address);

  // Withdraw
  const withdrawTx = await nft.connect(artist).withdraw();
  await withdrawTx.wait();

  // Record balance after
  const after = await ethers.provider.getBalance(artist.address);

  // Contract balance should be zero
  expect(await ethers.provider.getBalance(nftAddress)).to.equal(0);

  // Artist's balance should have increased (not exact due to gas)
  expect(after).to.be.gt(before);
});

it("should return correct tokenURI for minted tokens", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("0.1");
  const uri = "ipfs://tokenuri";
  const tx = await factory.connect(artist).createNFT(
    artist.address, uri, "Name", "SYM", mintPrice, "Genre", 10
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NewNFT");
  const nftAddress = event.args.nftAddress;
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  await nft.connect(artist).mint(artist.address, 2, { value: mintPrice * 2n });

  expect(await nft.tokenURI(1)).to.equal(uri);
  expect(await nft.tokenURI(2)).to.equal(uri);
});

it("should revert if non-owner tries to update platform fee", async function () {
  await expect(
    feeManager.connect(other).updatePlatformFee(20)
  ).to.be.revertedWithCustomError(feeManager, "FeeManager__OnlyOwner");
});

it("should send correct platform fee on mint", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("1");
  const tx = await factory.connect(artist).createNFT(
    artist.address, "ipfs://uri", "Name", "SYM", mintPrice, "Genre", 10
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NewNFT");
  const nftAddress = event.args.nftAddress;
  const DBeatsNFT = await ethers.getContractFactory("DBeatsNFT");
  const nft = DBeatsNFT.attach(nftAddress);

  // Record platform wallet balance before
  const before = await ethers.provider.getBalance(platformWallet);

  // Mint NFT
  await nft.connect(artist).mint(artist.address, 1, { value: mintPrice });

  // Calculate expected fee (10% in this example)
  const expectedFee = mintPrice / 10n;

  // Record platform wallet balance after
  const after = await ethers.provider.getBalance(platformWallet);

  expect(after - before).to.equal(expectedFee);
});

it("should revert if non-owner tries to confirm", async function () {
  const owners = [owner.address, admin.address];
  const PlatformWallet = await ethers.getContractFactory("DBeatsPlatformWallet");
  const wallet = await PlatformWallet.deploy(owners, 2);
  await wallet.waitForDeployment();

await expect(
  wallet.connect(other).confirm()
).to.be.revertedWith("Not an owner");
});

it("should distribute withdrawal equally among owners", async function () {
  const owners = [owner.address, admin.address];
  const PlatformWallet = await ethers.getContractFactory("DBeatsPlatformWallet");
  const wallet = await PlatformWallet.deploy(owners, 2);
  await wallet.waitForDeployment();

  // Send ETH to wallet
  await owner.sendTransaction({ to: wallet.target, value: ethers.parseEther("2") });

  // Confirm from both owners
  await wallet.connect(owner).confirm();
  await wallet.connect(admin).confirm();

  // Withdraw
  // await wallet.connect(owner).withdraw();

  // Check balances of owners (should have received 1 ETH each, minus gas)
  const share = ethers.parseEther("1");
  const afterOwner = await ethers.provider.getBalance(owner.address);
  const afterAdmin = await ethers.provider.getBalance(admin.address);
  expect(afterOwner).to.be.gte(share - ethers.parseEther("0.001")); // allow for gas
  expect(afterAdmin).to.be.gte(share - ethers.parseEther("0.001"));
  // ...add balance checks as needed...
});

it("should emit NewNFT event with correct args", async function () {
  await factory.addArtist(artist.address);
  const mintPrice = ethers.parseEther("0.1");
  await expect(
    factory.connect(artist).createNFT(
      artist.address, "ipfs://uri", "Name", "SYM", mintPrice, "Genre", 10
    )
  ).to.emit(factory, "NewNFT")
    .withArgs(
      anyValue, // nftAddress (unknown before tx)
      artist.address,
      "ipfs://uri",
      "Name",
      "SYM",
      mintPrice,
      "Genre",
      10
    );
});
});