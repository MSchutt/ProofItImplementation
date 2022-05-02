const { expect } = require("chai");
const { ethers } = require("hardhat");
const {loadRule} = require("solhint/lib/load-rules");

// Private keys of users
describe('ProofIt', function () {
  let addr, addr1, addr2;
  let proofIt;
  const asset = ethers.utils.toUtf8Bytes('ipfs://test.txt');
  beforeEach(async () => {
    const ProofIt = await ethers.getContractFactory('ProofIt');
    proofIt = await ProofIt.deploy();

    [addr, addr1, addr2] = await ethers.getSigners();

    await proofIt.deployed();
  })
  describe('mint', () => {
    it('should mint token provided string', async () => {
      await proofIt.connect(addr).mint(asset);
      const prevOwners = await proofIt.connect(addr).getPreviousOwners(asset)
      expect(prevOwners.length).to.equal(1);
      const prevOwnerObject = prevOwners[0];
      expect(prevOwnerObject.owner).to.equal(addr.address);
      expect(prevOwnerObject.blockTimestamp).to.not.be.undefined;
      expect(prevOwnerObject.verifiedFor.length).to.equal(0);
    })
    it('should throw error if token is minted twice by the same person', async () => {
      await proofIt.connect(addr).mint(asset);

      try {
        await proofIt.connect(addr).mint(asset);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Asset was already minted');
      }

      const prevOwners = await proofIt.connect(addr).getPreviousOwners(asset);
      expect(prevOwners.length).to.equal(1);
      const prevOwnerObject = prevOwners[0];
      expect(prevOwnerObject.owner).to.equal(addr.address);
      expect(prevOwnerObject.blockTimestamp).to.not.be.undefined;
      expect(prevOwnerObject.verifiedFor.length).to.equal(0);
    })
    it('should throw error if token is minted twice by two different persons', async () => {
      await proofIt.connect(addr).mint(asset);

      try {
        await proofIt.connect(addr2).mint(asset);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Asset was already minted');
      }

      const prevOwners = await proofIt.connect(addr).getPreviousOwners(asset);
      expect(prevOwners.length).to.equal(1);
      const prevOwnerObject = prevOwners[0];
      expect(prevOwnerObject.owner).to.equal(addr.address);
      expect(prevOwnerObject.blockTimestamp).to.not.be.undefined;
      expect(prevOwnerObject.verifiedFor.length).to.equal(0);
    })
    it('should throw error if tokenID is empty', async () => {
      try {
        await proofIt.connect(addr).mint(ethers.utils.toUtf8Bytes(''));
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Provided TokenID is empty');
      }
    })
    it('should update ownership on mint', async () => {
      await proofIt.connect(addr).mint(asset);

      const owners = await proofIt.connect(addr).getOwnedAssets(addr.address);
      expect(owners.length).to.equal(1);
      expect(ethers.utils.toUtf8String(owners[0])).to.equal(ethers.utils.toUtf8String(asset));
    })
  })
  describe('transferOwnership', () => {
    it('should not be possible to transfer assets from other users', async () => {
      await proofIt.connect(addr).mint(asset);

      try {
        await proofIt.connect(addr2).transferOwnership(asset, addr1.address);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Cannot transfer assets from other people!');
      }

      const owners = await proofIt.connect(addr).getOwnedAssets(addr.address);
      expect(owners.length).to.equal(1);
      expect(ethers.utils.toUtf8String(owners[0])).to.equal(ethers.utils.toUtf8String(asset));
    })
    it('should transfer ownership to another user while not checking verification (without user)', async () => {
      await proofIt.connect(addr).mint(asset);
      await proofIt.connect(addr).transferOwnership(asset, addr1.address);

      const currentOwner = await proofIt.connect(addr).getCurrentOwner(asset);
      expect(currentOwner.owner).to.equal(addr1.address);

      const history = await proofIt.connect(addr).getPreviousOwners(asset);
      expect(history.length).to.equal(2);
      expect(history[0].owner).to.equal(addr.address);
      expect(history[1].owner).to.equal(addr1.address);

      try {
        await proofIt.connect(addr).getOwnedAssets(addr.address);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('User does not own any assets');
      }

      const ownedAssets2 = await proofIt.connect(addr).getOwnedAssets(addr1.address);
      expect(ownedAssets2.length).to.equal(1);
      expect(ethers.utils.toUtf8String(ownedAssets2[0])).to.equal(ethers.utils.toUtf8String(asset));
    })
    it('should not be possible to transfer asset which was not created', async () => {
      try {
        await proofIt.connect(addr2).transferOwnership(asset, addr1.address);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Asset does not exist');
      }
    })
    it('should not be possible to transfer ownership twice', async () => {
      await proofIt.connect(addr).mint(asset);
      await proofIt.connect(addr).transferOwnership(asset, addr1.address);

      try {
        await proofIt.connect(addr).transferOwnership(asset, addr1.address);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Cannot transfer assets from other people!');
      }
    })
  })
  describe('isOwnerOfInsecure', () => {
    it('should check if provided address is owner without checking verification', async () => {
      await proofIt.connect(addr).mint(asset);
      const isOwner = await proofIt.connect(addr).isOwnerOfInsecure(asset, addr.address);
      expect(isOwner).to.be.true;
    })
    it('should return false if user is not the owner without checking verification', async () => {
      await proofIt.connect(addr).mint(asset);
      const isOwner = await proofIt.connect(addr).isOwnerOfInsecure(asset, addr2.address);
      expect(isOwner).to.be.false;
    })
    it('should reject if asset does not exist', async () => {
      try {
        await proofIt.connect(addr).isOwnerOfInsecure(asset, addr.address);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Asset does not exist');
      }
    })
  })
  describe('storeVerification', () => {
    it('should store verification', async () => {
      await proofIt.connect(addr).mint(asset);
      await proofIt.connect(addr).storeVerification(asset, addr1.address);
      const verification = await proofIt.connect(addr).getCurrentOwner(asset);
      expect(verification.owner).to.equal(addr.address);
      expect(verification.verifiedFor.length).to.equal(1);
      expect(verification.verifiedFor[0]).to.equal(addr1.address);
    })
    it('should reject if asset does not exist', async () => {
      try {
        await proofIt.connect(addr).storeVerification(asset, addr1.address);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Asset does not exist');
      }
    })
    it('should reject if caller is not the owner', async () => {
      await proofIt.connect(addr).mint(asset);
      try {
        await proofIt.connect(addr2).storeVerification(asset, addr1.address);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('Sender of transaction is not the current owner');
      }
    })
  })
  describe('isOwnerOf', () => {
    it('should check if user is the owner and verification for caller was created for that address', async () => {
      await proofIt.connect(addr).mint(asset);
      await proofIt.connect(addr).storeVerification(asset, addr1.address);
      const isOwner = await proofIt.connect(addr).isOwnerOf(asset, addr.address, addr1.address);
      expect(isOwner).to.be.true;
    })
    it('should return true if user is owner but did no verification', async () => {
      await proofIt.connect(addr).mint(asset);
      const isOwner = await proofIt.connect(addr).isOwnerOf(asset, addr.address, addr2.address);
      expect(isOwner).to.be.false;
    })
    it('should reject if user is not the owner', async () => {
      await proofIt.connect(addr).mint(asset);
      try {
        await proofIt.connect(addr).isOwnerOf(asset, addr2.address, addr1.address);
      } catch (e) {
        expect(e).to.be.instanceOf(Error);
        expect(e.message).to.contain('User is not owner');
      }
    })
    it('should return false if user is the owner but created verification for someone else', async () => {
      await proofIt.connect(addr).mint(asset);
      await proofIt.connect(addr).storeVerification(asset, addr1.address);
      const isOwner = await proofIt.connect(addr).isOwnerOf(asset, addr.address, addr2.address);
      expect(isOwner).to.be.false;
    })
  })
})