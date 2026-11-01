const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainIDGuard Contract", function () {
  let guard;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const ChainIDGuard = await ethers.getContractFactory("ChainIDGuard");
    guard = await ChainIDGuard.deploy();
    await guard.waitForDeployment();
  });

  it("Should initialize with requestNonce = 0", async function () {
    expect(await guard.requestNonce()).to.equal(0);
  });

  it("Should return correct runtime block.chainid", async function () {
    const chainId = await guard.getCurrentChainId();
    expect(chainId).to.equal(31337n); // Hardhat default
  });

  it("Should process requestNetworkCheck matching current chain ID", async function () {
    const expectedChainId = 31337n;
    const tx = await guard.connect(user1).requestNetworkCheck(expectedChainId);
    const receipt = await tx.wait();

    expect(await guard.requestNonce()).to.equal(1n);

    const [req, res] = await guard.getRequest(1n);
    expect(req.id).to.equal(1n);
    expect(req.requester).to.equal(user1.address);
    expect(req.expectedChainId).to.equal(expectedChainId);
    expect(req.isResolved).to.be.true;

    expect(res.requestId).to.equal(1n);
    expect(res.expectedChainId).to.equal(expectedChainId);
    expect(res.actualChainId).to.equal(31337n);
    expect(res.isMatch).to.be.true;

    // Check emitted events
    await expect(tx)
      .to.emit(guard, "NetworkCheckRequested")
      .withArgs(1n, user1.address, expectedChainId, 31337n, req.timestamp);

    await expect(tx)
      .to.emit(guard, "NetworkCheckCompleted")
      .withArgs(1n, user1.address, expectedChainId, 31337n, true, req.timestamp);
  });

  it("Should record mismatch when expectedChainId differs from block.chainid", async function () {
    // Expected is Botchain Testnet (968), but Hardhat runtime is 31337
    const expectedChainId = 968n;
    const tx = await guard.connect(user2).requestNetworkCheck(expectedChainId);
    await tx.wait();

    const [req, res] = await guard.getRequest(1n);
    expect(req.expectedChainId).to.equal(968n);
    expect(res.actualChainId).to.equal(31337n);
    expect(res.isMatch).to.be.false;
  });

  it("Should support publishResult for an existing request", async function () {
    await guard.connect(user1).requestNetworkCheck(31337n);

    const tx = await guard.connect(user1).publishResult(1n);
    await expect(tx)
      .to.emit(guard, "NetworkCheckCompleted");

    const [, res] = await guard.getRequest(1n);
    expect(res.isMatch).to.be.true;
  });

  it("Should track requests per user address", async function () {
    await guard.connect(user1).requestNetworkCheck(1n);
    await guard.connect(user1).requestNetworkCheck(968n);
    await guard.connect(user2).requestNetworkCheck(968n);

    const user1List = await guard.getUserRequests(user1.address);
    const user2List = await guard.getUserRequests(user2.address);

    expect(user1List.length).to.equal(2);
    expect(user1List[0]).to.equal(1n);
    expect(user1List[1]).to.equal(2n);

    expect(user2List.length).to.equal(1);
    expect(user2List[0]).to.equal(3n);
  });

  it("Should revert getRequest for non-existent requestId", async function () {
    await expect(guard.getRequest(999n)).to.be.revertedWith(
      "ChainIDGuard: Request does not exist"
    );
  });
});

