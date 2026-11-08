require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const rawPrivateKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.trim() : "";
// Ensure 0x prefix if valid key is supplied, else fallback for compilation/tests
const deployerKey = rawPrivateKey.length >= 64
  ? (rawPrivateKey.startsWith("0x") ? rawPrivateKey : `0x${rawPrivateKey}`)
  : "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchainMainnet: {
      url: "https://rpc.botchain.ai",
      chainId: 677,
      accounts: [deployerKey],
    },
    botchainTestnet: {
      url: "https://rpc.bohr.life",
      chainId: 968,
      accounts: [deployerKey],
    },
  },
  etherscan: {
    apiKey: {
      botchainMainnet: "empty",
      botchainTestnet: "empty",
    },
    customChains: [
      {
        network: "botchainMainnet",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
      {
        network: "botchainTestnet",
        chainId: 968,
        urls: {
          apiURL: "https://scan.bohr.life/api",
          browserURL: "https://scan.bohr.life",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
