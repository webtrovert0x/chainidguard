const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  console.log("--------------------------------------------------");
  console.log(`Deploying ChainIDGuard to network: ${networkName}...`);
  console.log("--------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BOT");

  const ChainIDGuard = await hre.ethers.getContractFactory("contracts/ChainIDGuard.sol:ChainIDGuard");
  const guard = await ChainIDGuard.deploy();
  await guard.waitForDeployment();

  const contractAddress = await guard.getAddress();
  console.log("ChainIDGuard deployed successfully at:", contractAddress);

  const onchainChainId = await guard.getCurrentChainId();
  console.log("Verified on-chain block.chainid:", onchainChainId.toString());

  // Save address into frontend ABI config
  const frontendDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("contracts/ChainIDGuard.sol:ChainIDGuard");
  const deploymentInfo = {
    address: contractAddress,
    chainId: Number(onchainChainId),
    network: networkName,
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(
    path.join(frontendDir, "ChainIDGuard.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Updated frontend contract artifact at src/contracts/ChainIDGuard.json");

  // Also update .env CONTRACT_ADDRESS
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env with CONTRACT_ADDRESS");
  }

  const explorerBase = Number(onchainChainId) === 677
    ? "https://scan.botchain.ai"
    : "https://scan.bohr.life";

  console.log("--------------------------------------------------");
  console.log(`Deployment complete! Explorer: ${explorerBase}/address/${contractAddress}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
