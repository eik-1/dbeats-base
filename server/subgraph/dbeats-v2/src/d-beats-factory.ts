import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { NewNFT as NewNFTEvent, RoleGranted as RoleGrantedEvent } from "../generated/DBeatsFactory/DBeatsFactory";
import { NFT, Artist, Factory, RoleGranted } from "../generated/schema";

const FACTORY_ADDRESS = "0xCbDB0736971657049a02007c503c70C571bd3970";
const ARTIST_ROLE = Bytes.fromHexString("0x93fac2f6eba5c6ab0b78b0deca04c08b0e1c2a933a605c0fa3ce64da8fc04115");

export function handleNewNFT(event: NewNFTEvent): void {
  let nft = new NFT(event.params.nftAddress.toHex()); 
  let artistId = event.params._artistAddress.toHex();
  let artist = Artist.load(artistId);

  if (artist == null) {
    artist = new Artist(artistId);
    artist.address = event.params._artistAddress;
    artist.createdAt = event.block.timestamp;
    artist.save();

    let factory = Factory.load(FACTORY_ADDRESS);
    if (factory == null) {
      factory = new Factory(FACTORY_ADDRESS);
      factory.nftsCount = BigInt.fromI32(0);
      factory.artistsCount = BigInt.fromI32(0);
    }
    factory.artistsCount = factory.artistsCount.plus(BigInt.fromI32(1));
    factory.save();
  }

  nft.artist = artistId;
  nft.address = event.params.nftAddress;
  nft.tokenURI = event.params._newTokenURI; 
  nft.name = event.params.name;
  nft.symbol = event.params.symbol;
  nft.mintPrice = event.params.mintPrice;
  nft.genre = event.params._genre;
  nft.createdAt = event.block.timestamp;
  nft.save();

  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory == null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.nftsCount = BigInt.fromI32(0);
    factory.artistsCount = BigInt.fromI32(0);
  }
  factory.nftsCount = factory.nftsCount.plus(BigInt.fromI32(1));
  factory.save();
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  if (event.params.role.equals(ARTIST_ROLE)) {
    let artist = Artist.load(event.params.account.toHex());
    if (artist == null) {
      artist = new Artist(event.params.account.toHex());
      artist.address = event.params.account;
      artist.createdAt = event.block.timestamp;
      artist.save();

      let factory = Factory.load(FACTORY_ADDRESS);
      if (factory == null) {
        factory = new Factory(FACTORY_ADDRESS);
        factory.nftsCount = BigInt.fromI32(0);
        factory.artistsCount = BigInt.fromI32(0);
      }
      factory.artistsCount = factory.artistsCount.plus(BigInt.fromI32(1));
      factory.save();
    }
  }

  let roleGrantedId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let roleGranted = new RoleGranted(roleGrantedId);
  roleGranted.role = event.params.role;
  roleGranted.account = event.params.account;
  roleGranted.sender = event.params.sender;
  roleGranted.blockNumber = event.block.number;
  roleGranted.blockTimestamp = event.block.timestamp;
  roleGranted.transactionHash = event.transaction.hash;
  roleGranted.save();
}
