import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { NewNFT } from "../generated/schema"
import { NewNFT as NewNFTEvent } from "../generated/DBeatsFactory/DBeatsFactory"
import { handleNewNFT } from "../src/d-beats-factory"
import { createNewNFTEvent } from "./d-beats-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let nftAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _artistAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _newTokenURI = "Example string value"
    let name = "Example string value"
    let symbol = "Example string value"
    let mintPrice = BigInt.fromI32(234)
    let _genre = "Example string value"
    let newNewNFTEvent = createNewNFTEvent(
      nftAddress,
      _artistAddress,
      _newTokenURI,
      name,
      symbol,
      mintPrice,
      _genre
    )
    handleNewNFT(newNewNFTEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("NewNFT created and stored", () => {
    assert.entityCount("NewNFT", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "NewNFT",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nftAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "NewNFT",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_artistAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "NewNFT",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_newTokenURI",
      "Example string value"
    )
    assert.fieldEquals(
      "NewNFT",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "name",
      "Example string value"
    )
    assert.fieldEquals(
      "NewNFT",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "symbol",
      "Example string value"
    )
    assert.fieldEquals(
      "NewNFT",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "mintPrice",
      "234"
    )
    assert.fieldEquals(
      "NewNFT",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_genre",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
